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

                         ESP_LOGD(SENSOR_EVENT_TAG, "%s entered sensor que",logMsg);
                         ESP_LOGW(SENSOR_EVENT_TAG, "free mem total:%d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
             ESP_LOGW(SENSOR_EVENT_TAG, "free min size:%d", heap_caps_get_minimum_free_size(MALLOC_CAP_INTERNAL));
                         ESP_LOGW(SENSOR_EVENT_TAG, "largest free block:%d\n", heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL));
                         heap_caps_check_integrity_all(true);
            // heap_caps_print_heap_info(MALLOC_CAP_INTERNAL);

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
            // taskYIELD();
        }
    }
}

void sensor_post_processing_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

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

            // prepare to send to multiple tasks for furter proccessing
            mutex = xSemaphoreCreateMutex();
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

            taskYIELD();
        }
    }
}

void sensor_send_to_server_task(void *pvParameters)
{
    sensor_queue_wrapper_t *event;

    for (;;)
    {
        if (xQueueReceive(sensor_send_to_server_handle, &event, portMAX_DELAY) == pdTRUE)
        {
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in server send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            if (event->sensor_data != NULL)
            {
                char *sensor_data_json = create_sensor_data_json(event->sensor_data);

                if (sensor_data_json != NULL)
                {
                    post_sensor_data_backend(sensor_data_json);
                    ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d sensor data sent posting to servers",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);


                     free(sensor_data_json);                  
                }
            }

            xSemaphoreGive(all_tasks_complete_semaphore);
            taskYIELD();
        }
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

            if (event)
            {

               // vTaskDelay(pdMS_TO_TICKS(100));
                free(event->sensor_data->value);
                event->sensor_data->value = NULL;
                free(event->sensor_data->location);
                event->sensor_data->location = NULL;
                free(event->sensor_data->module_id);
                event->sensor_data->module_id = NULL;
                free(event->sensor_data);
                event->sensor_data = NULL;
                free(event);
                event = NULL;


                ESP_LOGD(SENSOR_EVENT_TAG, "Memory cleaned up successfully");
                     
                
            }

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
            ESP_LOGD(SENSOR_EVENT_TAG, "module->%s-id:%d-%s->send_id:%d in websocket send process",
                     event->sensor_data->module_id,
                     event->sensor_data->local_sensor_id,
                     sensor_type_to_string(event->sensor_data->sensor_type),
                     event->current_send_id);

            if (event->sensor_data != NULL)
            {
                char *sensor_data_json = create_sensor_data_json(event->sensor_data);

                if (sensor_data_json != NULL)
                {
                    // json clean up

                    ESP_LOGV(SENSOR_EVENT_TAG, "{module->%s-id:%d-%s->send_id:%d} Logged JSON Data: %s",
                             event->sensor_data->module_id,
                             event->sensor_data->local_sensor_id,
                             sensor_type_to_string(event->sensor_data->sensor_type),
                             event->current_send_id,
                             sensor_data_json);

                    // add json to fram pacakage and pass to websocket server for transmission
                    websocket_frame_data_t ws_frame;
                    httpd_ws_frame_t ws_pkt;
                    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
                    ws_pkt.type = HTTPD_WS_TYPE_TEXT;
                    ws_pkt.final = true;
                    ws_pkt.fragmented = false;
                    ws_frame.ws_pkt = &ws_pkt;
                    ws_pkt.payload = (uint8_t *)sensor_data_json;
                    ws_pkt.len = strlen(sensor_data_json) + 1;

                    xQueueSend(websocket_send_sensor_data_queue_handle, &ws_frame, portMAX_DELAY);

                    free(sensor_data_json);
                }
            }

            xSemaphoreGive(all_tasks_complete_semaphore);
            
            
            // free(event);
            // event = NULL;

            taskYIELD();
        }
    }
}

esp_err_t initiate_sensor_queue()
{
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

    xTaskCreatePinnedToCore(
        sensor_queue_monitor_task,
        "sq_monitor",
        SENSOR_QUEUE_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_PRIORITY,
        &sensor_queue_task_handle,
        SENSOR_QUEUE_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_preprocessing_task,
        "s_prepocess",
        SENSOR_PREPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_PREPROCESSING_PRIORITY,
        &sensor_preprocessing_task_handle,
        SENSOR_PREPROCESSING_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_prepare_to_send_task,
        "s_prep_send",
        SENSOR_PREPARE_TO_SEND_STACK_SIZE,
        NULL,
        SENSOR_PREPARE_TO_SEND_PRIORITY,
        &sensor_prepare_to_send_task_handle,
        SENSOR_PREPARE_TO_SEND_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_post_processing_task,
        "s_post_process",
        SENSOR_POSTPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_POSTPROCESSING_PRIORITY,
        &sensor_post_processing_task_handle,
        SENSOR_POSTPROCESSING_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_send_to_ram_task,
        "s_snd_ram",
        SENSOR_SEND_TO_RAM_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_RAM_PRIORITY,
        &sensor_send_to_ram_task_handle,
        SENSOR_SEND_TO_RAM_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_send_to_sd_db_task,
        "s_snd_sd_db",
        SENSOR_SEND_TO_SD_DB_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SD_DB_PRIORITY,
        &sensor_send_to_sd_db_task_handle,
        SENSOR_SEND_TO_SD_DB_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_send_to_server_task,
        "s_snd_serv",
        SENSOR_SEND_TO_SERVER_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SERVER_PRIORITY,
        &sensor_send_to_server_task_handle,
        SENSOR_SEND_TO_SERVER_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_queue_mem_cleanup_task,
        "s_q_memclean",
        SENSOR_QUEUE_MEM_CLEANUP_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_MEM_CLEANUP_PRIORITY,
        &sensor_queue_mem_cleanup_task_handle,
        SENSOR_QUEUE_MEM_CLEANUP_CORE_ID);

    xTaskCreatePinnedToCore(
        sensor_send_to_websocket_server_task,
        "s_snd_ws",
        SENSOR_SEND_TO_WEBSOCKET_SERVER_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_WEBSOCKET_SERVER_PRIORITY,
        &sensor_send_to_websocket_server_task_handle,
        SENSOR_SEND_TO_WEBSOCKET_SERVER_CORE_ID);

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