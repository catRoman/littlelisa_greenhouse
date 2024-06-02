#include <stdio.h>
#include <stdbool.h>
#include <string.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_task_wdt.h"
#include "esp_heap_caps.h"
#include "esp_heap_trace.h"
#include "esp_http_server.h"
#include "sdkconfig.h"
#include "cJSON.h"
#include "freertos/semphr.h"
#include "esp_http_client.h"
// components
#include "sensor_tasks.h"
#include "module_config.h"
#include "esp_now_comm.h"
#include "websocket_server.h"
#include "task_common.h"
#include "helper.h"
#include "sensor_helpers.h"
#include "http_client.h"

// COMPLETED -make queue wrapper for passing genic sensor struct with state to que
// COMNPLETED-     -->alocate memory at sensor source for sensor_struct_t and queue wrapper
// COMPLETED-             (sesnor task-outgoing/esp_now_com_recv-incoming?)
// COMPLETED    -->wrap in sensor_queue_event_t, pass pointer   -DONE
// TODO: if fail push back to esp_now_comm_outgoing-retry attempt-datapersistance problem with que to resolve?
//
// TODO:   -->cleanup sensor event and using a semaphore given during postprocessing depending on how
//      -->tasks it was sent to-->sensor_event_queue has metadata for semaphore count?,
//      -->clean waits for completion before freeing memory
// COMPLETED -make tasks for each step including routing to the next step and passing back to the queue
/**
 * COMPLETED -preprocessing ->recieved from sensor task
 *TODO:: validation - verify sensor data is within range
 * COMPLETED -move to process_for_outgoing or to postprocessing depending on module(node/controler)
 * COMPLETED -process_for_outgoing-> recieved from preprocessing - allocate esp_now_queue
 *              wrapper, free sensor wrapper, get serialized size, serialize data
 *              send to esp_now_comm_outgoing queue
 *              (function in dht22.c basicly already written turned into task)
 * -postprocessing -> recieved from either precoseesing or incoming_esp_now queue
 *                  - routing to different areas adding semaphores and count as need,
 *                      checking for route
 *                      reliability (db online etc) send to send_to_sd_db,
 *                  -add timestamp
 * -cleanup -> recieved from _http_process, sd-db_process, external_db_process -
 *              based on semphore count clean up wrapper and sensor struct
 */
// TODO: make task logic for each task, validation, post_process, to_http, to sd_db, to_ram, to external_db
// TODO: reorganize sensor tasks related between module_config, esp-now_comm, dht22 to focus on que use
// TODO: use stack analysiusi to fiugure out apropriate stact sizes
static const char SENSOR_EVENT_TAG[] = "sensor_tasks";

extern Module_info_t *module_info_gt;
extern QueueHandle_t websocket_send_sensor_data_queue_handle;

SemaphoreHandle_t mutex;
SemaphoreHandle_t all_tasks_complete_semaphore;

QueueHandle_t sensor_queue_handle = NULL;
TaskHandle_t sensor_queue_task_handle = NULL;

QueueHandle_t sensor_preprocessing_handle = NULL;
TaskHandle_t sensor_preprocessing_task_handle = NULL;

QueueHandle_t sensor_prepare_to_send_handle = NULL;
TaskHandle_t sensor_prepare_to_send_task_handle = NULL;

QueueHandle_t sensor_post_processing_handle = NULL;
TaskHandle_t sensor_post_processing_task_handle = NULL;

QueueHandle_t sensor_send_to_ram_handle = NULL;
TaskHandle_t sensor_send_to_ram_task_handle = NULL;

QueueHandle_t sensor_send_to_sd_db_handle = NULL;
TaskHandle_t sensor_send_to_sd_db_task_handle = NULL;

QueueHandle_t sensor_send_to_server_handle = NULL;
TaskHandle_t sensor_send_to_server_task_handle = NULL;

QueueHandle_t sensor_queue_mem_cleanup_handle = NULL;
TaskHandle_t sensor_queue_mem_cleanup_task_handle = NULL;

QueueHandle_t sensor_send_to_websocket_server_handle = NULL;
TaskHandle_t sensor_send_to_websocket_server_task_handle = NULL;

void sensor_queue_monitor_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_queue_handle, &event, portMAX_DELAY))
        {

            char logMsg[100];

            // Use snprintf to format the string
            snprintf(logMsg, sizeof(logMsg), "module->%s-id:%d-%s->send_id:%d",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            ESP_LOGD(SENSOR_EVENT_TAG, "%s entered sensor que", logMsg);
            // ESP_LOGW(SENSOR_EVENT_TAG, "free mem total:%d", heap_caps_get_free_size());
            // ESP_LOGW("sensor-que", "free min size:%lu", esp_get_free_heap_size());
            // ESP_LOGW(SENSOR_EVENT_TAG, "largest free block:%d\n", heap_caps_get_largest_free_block());
            heap_caps_check_integrity_all(true);
            // heap_caps_print_heap_info();

            switch (event->nextEventID)
            {

            case SENSOR_PREPOCESSING:
                if (xQueueSend(sensor_preprocessing_handle, &event, portMAX_DELAY))
                {

                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to preprocessing", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to preprocessing", logMsg);
                }

                taskYIELD();
                break;

            case SENSOR_PREPARE_TO_SEND:

                if (xQueueSend(sensor_prepare_to_send_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to prepare to send", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to prepare to send",
                             logMsg);
                }

                taskYIELD();
                break;

            case SENSOR_POST_PROCESSING:

                if (xQueueSend(sensor_post_processing_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to post processing", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to post processing", logMsg);
                }

                taskYIELD();
                break;

            case SENSOR_SEND_TO_RAM:

                if (xQueueSend(sensor_send_to_ram_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to send to ram", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to send to ram", logMsg);
                }
                break;

            case SENSOR_SEND_TO_SD_DB:

                if (xQueueSend(sensor_send_to_sd_db_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed tosend to sd db", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to send to sd db", logMsg);
                }
                break;

            case SENSOR_SEND_TO_SERVER:

                if (xQueueSend(sensor_send_to_server_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to send to server db", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to send to server db", logMsg);
                }
                break;

            case SENSOR_QUEUE_MEM_CLEANUP:

                if (xQueueSend(sensor_queue_mem_cleanup_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passed to queue mem cleanup", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to queue mem cleanup", logMsg);
                }
                break;

            case SENSOR_SEND_TO_WEBSOCKET_SERVER:

                if (xQueueSend(sensor_send_to_websocket_server_handle, &event, portMAX_DELAY))
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "%s passing to websocket server queue", logMsg);
                }
                else
                {
                    ESP_LOGE(SENSOR_EVENT_TAG, "%s failed to pass to websocket server queue", logMsg);
                }
                break;
            }
        }
    }
}

void sensor_preprocessing_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;
    for (;;)
    {
        if (xQueueReceive(sensor_preprocessing_handle, &event, portMAX_DELAY))
        {
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in preprocessing",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            // heap_caps_print_heap_info(MALLOC_CAP_INTERNAL);
            // TODO:check values are within range if not send to cleanup
            // sensor_validation();
            if (strcmp(module_info_gt->type, "node") == 0)
            {
                event->nextEventID = SENSOR_PREPARE_TO_SEND;
            }
            else if (strcmp(module_info_gt->type, "controller") == 0)
            {
                event->nextEventID = SENSOR_POST_PROCESSING;
            }
            else
            {
                ESP_LOGE(SENSOR_EVENT_TAG, "Module type error in preprocessing");
                // continue;
            }
            if (xQueueSend(sensor_queue_handle, &event, portMAX_DELAY))
            {
                if (strcmp(module_info_gt->type, "node") == 0)
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d preparing to send",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id);
                }
                else if (strcmp(module_info_gt->type, "controller") == 0)
                {
                    ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sent to post processing",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id);
                }
            }
            // ESP_LOGW("preprocessor", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }
    }
}

void sensor_prepare_to_send_task(void *pvParameters)
{

    sensor_queue_wrapper_t *event;
    for (;;)
    {
        if (xQueueReceive(sensor_prepare_to_send_handle, &event, portMAX_DELAY))
        {
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d preparing to send",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            // TODO:change esp_now_comm struct wrapper name
            queue_packet_t *queue_packet = (queue_packet_t *)malloc(sizeof(queue_packet_t));

            queue_packet->data = serialize_sensor_data(event->sensor_data, &queue_packet->len);
            esp_now_comm_get_config_reciever_mac_addr(queue_packet->mac_addr);
            // trigger_panic();

            // char *log_string = create_sensor_data_json(event->sensor_data);
            // ESP_LOGE(SENSOR_EVENT_TAG, "before esp_now%s", log_string);
            // free(log_string);
            // log_string = NULL;

            extern QueueHandle_t esp_now_comm_outgoing_data_queue_handle;
            if (xQueueSend(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS)
            {
                ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sent to esp_now outgoing que",
                         event->sensor_data->module_id,
                         event->sensor_data->local_sensor_id,
                         sensor_type_to_string(event->sensor_data->sensor_type),
                         event->current_send_id);
            }
            else
            {
                ESP_LOGE(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d failed to pass to outcoming data que",
                         event->sensor_data->module_id,
                         event->sensor_data->local_sensor_id,
                         sensor_type_to_string(event->sensor_data->sensor_type),
                         event->current_send_id);
            }

            event->nextEventID = SENSOR_POST_PROCESSING;

            xQueueSend(sensor_queue_handle, &event, portMAX_DELAY);

            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sent to post processing",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            //     //free the wrapper as its changed hands to the esp_now_comm wrapper
            //     vTaskDelay(pdMS_TO_TICKS(10));
            //     free(event->sensor_data->value);
            //     event->sensor_data->value=NULL;
            //     free(event->sensor_data->location);
            //     event->sensor_data->location=NULL;
            //     free(event->sensor_data->module_id);
            //     event->sensor_data->module_id=NULL;

            //     free(event->sensor_data);
            //     event->sensor_data=NULL;
            //     free(event);
            //     event=NULL;
            // ESP_LOGW("prepare-to-send", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }
    }
}

void sensor_post_processing_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;
    mutex = xSemaphoreCreateMutex();
    for (;;)
    {
        if (xQueueReceive(sensor_post_processing_handle, &event, portMAX_DELAY))
        {

            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in postprocessing",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            time_t currentTime;
            time(&currentTime);
            event->sensor_data->timestamp = currentTime;

            // debug senor data to console
            char *log_string = create_sensor_data_json(event->sensor_data);
            ESP_LOGE(SENSOR_EVENT_TAG, "%s", log_string);
            free(log_string);
            log_string = NULL;

            // prepare to send to multiple tasks for furter proccessing

            int8_t num_of_semaphores = 0;
            if (strcmp(module_info_gt->type, "controller") == 0)
            {
                num_of_semaphores = 2;
                all_tasks_complete_semaphore = xSemaphoreCreateCounting(num_of_semaphores, 0);

                event->nextEventID = SENSOR_SEND_TO_SERVER;

                if (xQueueSend(sensor_queue_handle, &event, portMAX_DELAY) == pdPASS)
                {

                    ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sent to server send queue",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id);
                }
            }
            else
            {
                num_of_semaphores = 1;
                all_tasks_complete_semaphore = xSemaphoreCreateCounting(num_of_semaphores, 0);
            }

            event->nextEventID = SENSOR_SEND_TO_WEBSOCKET_SERVER;

            if (xQueueSend(sensor_queue_handle, &event, portMAX_DELAY) == pdPASS)
            {

                ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sent to websocket server send queue",
                         event->sensor_data->module_id,
                         event->sensor_data->local_sensor_id,
                         sensor_type_to_string(event->sensor_data->sensor_type),
                         event->current_send_id);
            }

            for (int i = 0; i < num_of_semaphores; i++)
            {
                xSemaphoreTake(all_tasks_complete_semaphore, portMAX_DELAY);
            }

            event->nextEventID = SENSOR_QUEUE_MEM_CLEANUP;
            vSemaphoreDelete(all_tasks_complete_semaphore);

            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d All semaphores returned sent to mem cleanup queue ",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            xQueueSend(sensor_queue_handle, &event, portMAX_DELAY);

            //-->pass to next thing ie db, save to ram etc,

            // //temp mem cleanup
            // vTaskDelay(pdMS_TO_TICKS(10));
            // free(event->sensor_data->value);
            // event->sensor_data->value=NULL;
            // free(event->sensor_data->location);
            // event->sensor_data->location=NULL;
            // free(event->sensor_data->module_id);
            // event->sensor_data->module_id=NULL;
            // free(event->sensor_data);
            // event->sensor_data=NULL;
            // free(event);
            // event=NULL;
            //  heap_trace_stop();
            // heap_trace_dump();
            // trigger_panic();

            // ESP_LOGW("post-process", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }
    }
}

void sensor_send_to_ram_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_send_to_ram_handle, &event, portMAX_DELAY) == pdTRUE)
        {
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in ram send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);
            // ESP_LOGW("send-to-ram", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }
    }
}

void sensor_send_to_sd_db_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_send_to_sd_db_handle, &event, portMAX_DELAY) == pdTRUE)
        {
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in sd db send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);
            // ESP_LOGW("send-sd-db", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }
    }
}
esp_http_client_handle_t initialize_http_client()
{
    char *url = BACKEND_URL;
    //====================================
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .keep_alive_enable = false,
        .timeout_ms = 5000,
        //.event_handler = client_event_post_handler
    };
    //=====================
    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL)
    {
        ESP_LOGE("HTTP_CLIENT", "Failed to initialize HTTP client");
    }
    else
    {

        esp_http_client_set_header(client, "Content-Type", "application/json");
    }
    return client;
}

static SemaphoreHandle_t client_mutex = NULL;
void sensor_send_to_server_task(void *pvParameters)
{
    if (!client_mutex)
    {
        client_mutex = xSemaphoreCreateMutex();
    }
    sensor_queue_wrapper_t *event;
    // char *url = BACKEND_URL;
    // //====================================
    // esp_http_client_config_t config = {
    //     .url = url,
    //     .method = HTTP_METHOD_POST,
    //     .keep_alive_enable = false,
    //     .timeout_ms = 5000,
    //     //.event_handler = client_event_post_handler
    // };
    // //=====================
    // esp_http_client_handle_t client = esp_http_client_init(&config);
    // if (client == NULL)
    // {
    //     ESP_LOGE("HTTP_CLIENT", "Failed to initialize HTTP client");
    // }
    // esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_handle_t client = initialize_http_client();
    for (;;)
    {
        if (xQueueReceive(sensor_send_to_server_handle, &event, portMAX_DELAY) == pdTRUE)
        {

            // ESP_LOGW("send-to-server-start", "free min size:%lu", esp_get_free_heap_size());
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in server send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            if (event->sensor_data != NULL)
            {
                // ESP_LOGW("send-to-server-before-post", "free min size:%lu", esp_get_free_heap_size());
                char *sensor_data_json = create_sensor_data_json(event->sensor_data);
                // ESP_LOGW("send-server-mem", "allocated at %p", sensor_data_json);
                if (sensor_data_json != NULL)
                {
                    if (xSemaphoreTake(client_mutex, portMAX_DELAY) == pdTRUE)
                    {
                        //===============================================
                        // ESP_LOGE("HTTP_CLIENT", "mutex taken by module->%s-id:%d-%s->send_id:%d", event->sensor_data->module_id,
                        //          event->sensor_data->local_sensor_id,
                        //          sensor_type_to_string(event->sensor_data->sensor_type),
                        //          event->current_send_id);
                        esp_http_client_set_post_field(client, sensor_data_json, strlen(sensor_data_json));
                        esp_err_t err = esp_http_client_perform(client);
                        if (err == ESP_OK)
                        {
                            ESP_LOGI("HTTP_CLIENT", "HTTP POST Status = %d, content_length = %" PRId64,
                                     esp_http_client_get_status_code(client),
                                     esp_http_client_get_content_length(client));
                        }
                        else
                        {
                            ESP_LOGE("HTTP_CLIENT", "HTTP POST request failed here: %s", esp_err_to_name(err));

                            esp_http_client_cleanup(client);
                            // // retry_count++;
                            ESP_LOGI("http_TAG", "Retrying... ");
                            vTaskDelay(pdMS_TO_TICKS(1000)); // wait for 1 second before retrying
                            client = initialize_http_client();
                            // esp_http_client_set_header(client, "Content-Type", "application/json");
                        }

                        free(sensor_data_json);
                        // ESP_LOGW("http-client-mem", "freed at %p", sensor_json);
                        sensor_data_json = NULL;

                        //============================================
                        xSemaphoreGive(client_mutex);
                        // ESP_LOGE("HTTP_CLIENT", "mutex gievn");
                    }
                    else
                    {
                        ESP_LOGE("HTTP_CLIENT", "mutex error");
                    }
                    // post_sensor_data_backend(sensor_data_json);
                    ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sensor data sent posting to servers",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id);
                    // if (sensor_data_json != NULL)
                    // {
                    //     free(sensor_data_json);
                    // }
                    // ESP_LOGW("send-to-server-after-post", "free min size:%lu", esp_get_free_heap_size());
                    // esp_http_client_cleanup(client);
                    vTaskDelay(pdMS_TO_TICKS(500));
                }
            }

            xSemaphoreGive(all_tasks_complete_semaphore);

            // ESP_LOGW("send-to-server-end", "free min size:%lu", esp_get_free_heap_size());
            taskYIELD();
        }

        // esp_http_client_cleanup(client);
    }
}

void sensor_queue_mem_cleanup_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_queue_mem_cleanup_handle, &event, portMAX_DELAY) == pdTRUE)
        {

            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in cleanup process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            char module_id[24];
            strcpy(module_id, event->sensor_data->module_id);
            int8_t sensor_id = event->sensor_data->local_sensor_id;
            char *sensor_type = sensor_type_to_string(event->sensor_data->sensor_type);
            int8_t curr_send_id = event->current_send_id;

            // if (event)
            // {

            // vTaskDelay(pdMS_TO_TICKS(100));
            free(event->sensor_data->value);
            event->sensor_data->value = NULL;
            free(event->sensor_data->location);
            event->sensor_data->location = NULL;
            free(event->sensor_data->module_location);
            event->sensor_data->module_location = NULL;

            //  free(event->sensor_data->sensor_square_pos);
            // event->sensor_data->sensor_square_pos = NULL;
            // free(event->sensor_data->sensor_zn_rel_pos);
            // event->sensor_data->sensor_zn_rel_pos = NULL;
            // free(event->sensor_data->module_square_pos);
            //    event->sensor_data->module_square_pos = NULL;
            // free(event->sensor_data->module_zn_rel_pos);
            //   event->sensor_data->module_location = NULL;

            free(event->sensor_data->module_type);
            event->sensor_data->module_type = NULL;
            free(event->sensor_data->module_id);
            event->sensor_data->module_id = NULL;
            free(event->sensor_data);
            event->sensor_data = NULL;
            free(event);
            event = NULL;

            // }
            // else
            // {

            // ESP_LOGE(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d Failed to cleanup memory",
            //          module_id,
            //          sensor_id,
            //          sensor_type,
            //          curr_send_id);
            // }

            // ESP_LOGW(SENSOR_EVENT_TAG, "\n===================================\n"
            //                            "module->%s\n\tid:%d-%s->send_id:%d\nMemory cleaned up successfully\n"
            //                            "mem-cleanup:-> \n\tfree heap size: %lu\n\tfree internal: %d\n"
            //                            "===================================",
            //          module_id,
            //          sensor_id,
            //          sensor_type,
            //          curr_send_id,
            //          esp_get_free_heap_size(),
            //          heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
            // ESP_LOGW("mem-cleanup", "free min total size:%lu", esp_get_free_heap_size());
            // ESP_LOGW("mem-cleanup", "free min internal size:%d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
            taskYIELD();
        }
    }
}

void sensor_send_to_websocket_server_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_send_to_websocket_server_handle, &event, portMAX_DELAY) == pdTRUE)
        {

            // ESP_LOGW("send-to-ws-start", "free min size:%lu", esp_get_free_heap_size());
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in websocket send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            // ESP_LOGW("send-to-ws-1", "free min size:%lu", esp_get_free_heap_size());
            if (event->sensor_data != NULL)
            {
                char *sensor_data_json = create_sensor_data_json(event->sensor_data);
                // ESP_LOGW("send-to-ws-mem", "allocated at %p", sensor_data_json);
                // ESP_LOGW("send-to-ws-2", "free min size:%lu", esp_get_free_heap_size());
                if (sensor_data_json != NULL)
                {
                    // json clean up

                    ESP_LOGV(SENSOR_EVENT_TAG, "{module->%s-id:%d-%s->send_id:%d} Logged JSON Data: %s",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id,
                             sensor_data_json);

                    // ESP_LOGW("send-to-ws-3", "free min size:%lu", esp_get_free_heap_size());
                    //  char *ws_data_packet = (char *)malloc(strlen(sensor_data_json) + 1);
                    //  strcpy(ws_data_packet, sensor_data_json);
                    //  free(sensor_data_json);
                    //  add json to fram pacakage and pass to websocket server for transmission
                    websocket_frame_data_t ws_frame;
                    httpd_ws_frame_t ws_pkt;
                    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
                    ws_pkt.type = HTTPD_WS_TYPE_TEXT;
                    ws_pkt.final = true;
                    ws_pkt.fragmented = false;
                    ws_frame.ws_pkt = &ws_pkt;
                    ws_pkt.payload = (uint8_t *)sensor_data_json;
                    ws_pkt.len = strlen(sensor_data_json) + 1;

                    // ESP_LOGW("send-to-ws-4", "free min size:%lu", esp_get_free_heap_size());
                    //=================heap trace=============
                    //  heap_trace_start(HEAP_TRACE_LEAKS);
                    //================heap trace=============
                    xQueueSend(websocket_send_sensor_data_queue_handle, &ws_frame, portMAX_DELAY);
                    //=================heap trace=============
                    // heap_trace_stop();
                    // heap_trace_dump();
                    //================heap trace=============
                }
            }

            // ESP_LOGW("send-to-ws-5", "free min size:%lu", esp_get_free_heap_size());
            xSemaphoreGive(all_tasks_complete_semaphore);
            // ESP_LOGW("send-to-ws-end", "free min size:%lu", esp_get_free_heap_size());

            taskYIELD();
        }
    }
}

esp_err_t initiate_sensor_queue()
{

    //===========================heap tracing=================
    // #define NUM_RECORDS 100                                    // Adjust this number based on available memory and needed trace duration
    //     static heap_trace_record_t trace_records[NUM_RECORDS]; // Allocate memory for trace records

    //     esp_err_t ret = heap_trace_init_standalone(trace_records, NUM_RECORDS);
    //     if (ret != ESP_OK)
    //     {
    //         printf("Heap trace initialization failed\n");
    //     }

    //===========================================

    ESP_LOGI(SENSOR_EVENT_TAG, "sensor queue init started");
    esp_log_level_set(SENSOR_EVENT_TAG, ESP_LOG_INFO);

    sensor_queue_handle = xQueueCreate(50, sizeof(sensor_queue_wrapper_t));
    if (sensor_queue_handle == NULL)
    {
        ESP_LOGE(SENSOR_EVENT_TAG, "queue not created");
    }
    sensor_preprocessing_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    if (sensor_preprocessing_handle == NULL)
    {
        ESP_LOGE(SENSOR_EVENT_TAG, "queue not created");
    }
    sensor_prepare_to_send_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    if (sensor_prepare_to_send_handle == NULL)
    {
        ESP_LOGE(SENSOR_EVENT_TAG, "queue not created");
    }
    sensor_post_processing_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    if (sensor_post_processing_handle == NULL)
    {
        ESP_LOGE(SENSOR_EVENT_TAG, "queue not created");
    }

    sensor_send_to_ram_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_sd_db_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_server_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_queue_mem_cleanup_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_websocket_server_handle = xQueueCreate(20, sizeof(sensor_queue_wrapper_t));
    BaseType_t task_code;
    task_code = xTaskCreatePinnedToCore(
        sensor_queue_monitor_task,
        "sq_monitor",
        SENSOR_QUEUE_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_PRIORITY,
        &sensor_queue_task_handle,
        SENSOR_QUEUE_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_preprocessing_task,
        "s_prepocess",
        SENSOR_PREPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_PREPROCESSING_PRIORITY,
        &sensor_preprocessing_task_handle,
        SENSOR_PREPROCESSING_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_prepare_to_send_task,
        "s_prep_send",
        SENSOR_PREPARE_TO_SEND_STACK_SIZE,
        NULL,
        SENSOR_PREPARE_TO_SEND_PRIORITY,
        &sensor_prepare_to_send_task_handle,
        SENSOR_PREPARE_TO_SEND_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_post_processing_task,
        "s_post_process",
        SENSOR_POSTPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_POSTPROCESSING_PRIORITY,
        &sensor_post_processing_task_handle,
        SENSOR_POSTPROCESSING_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_send_to_ram_task,
        "s_snd_ram",
        SENSOR_SEND_TO_RAM_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_RAM_PRIORITY,
        &sensor_send_to_ram_task_handle,
        SENSOR_SEND_TO_RAM_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_send_to_sd_db_task,
        "s_snd_sd_db",
        SENSOR_SEND_TO_SD_DB_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SD_DB_PRIORITY,
        &sensor_send_to_sd_db_task_handle,
        SENSOR_SEND_TO_SD_DB_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_send_to_server_task,
        "s_snd_serv",
        SENSOR_SEND_TO_SERVER_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SERVER_PRIORITY,
        &sensor_send_to_server_task_handle,
        SENSOR_SEND_TO_SERVER_CORE_ID);

    task_code = xTaskCreatePinnedToCore(
        sensor_queue_mem_cleanup_task,
        "s_q_memclean",
        SENSOR_QUEUE_MEM_CLEANUP_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_MEM_CLEANUP_PRIORITY,
        &sensor_queue_mem_cleanup_task_handle,
        SENSOR_QUEUE_MEM_CLEANUP_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    task_code = xTaskCreatePinnedToCore(
        sensor_send_to_websocket_server_task,
        "s_snd_ws",
        SENSOR_SEND_TO_WEBSOCKET_SERVER_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_WEBSOCKET_SERVER_PRIORITY,
        &sensor_send_to_websocket_server_task_handle,
        SENSOR_SEND_TO_WEBSOCKET_SERVER_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    return ESP_OK;
}

char *sensor_type_to_string(Sensor_List sensor_type)
{

    switch (sensor_type)
    {
    case DHT22:
        return "DHT22";
        break;
    case SOIL_MOISTURE:
        return "soil moisture";
        break;
    case LIGHT:
        return "light";
        break;
    case SOUND:
        return "sound";
        break;
    case MOVEMENT:
        return "movement";
        break;
    case CAMERA:
        return "camera";
        break;
    case SENSOR_LIST_TOTAL:
        break;
    }
    return "";
}