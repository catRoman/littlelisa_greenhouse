#include <stdio.h>
#include <stdbool.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "sensor_tasks.h"
#include "network_components/esp_now_comm.h"
#include "task_common.h"
#include "sdkconfig.h"
#include "cJSON.h"

//TODO: make queue wrapper for passing genic sensor struct with state to que        -DONE
//      -->alocate memory at sensor source for sensor_struct_t and queue wrapper
//              (sesnor task-outgoing/esp_now_com_recv-incoming?)   -DONE
//      -->wrap in sensor_queue_event_t, pass pointer   -DONE
//TODO: if fail push back to esp_now_comm_outgoing-retry attempt-datapersistance problem with que to resolve?
//
//TODO:   -->cleanup sensor event using a semaphore given during postprocessing depending on how
//      -->tasks it was sent to-->sensor_event_queue has metadata for semaphore count?,
//      -->clean waits for completion before freeing memory
//TODO: make tasks for each step including routing to the next step and passing back to the queue
/**
 * -preprocessing ->recieved from sensor task - validation -move to process_for_outgoing
 *                   or to postprocessing depending on module(node/controler)
 * -process_for_outgoing-> recieved from preprocessing - allocate esp_now_queue
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
//TODO make task logic for each task, validation, post_process, to_http, to sd_db, to_ram, to external_db
//TODO reorganize sensor tasks related between module_config, esp-now_comm, dht22 to focus on que use
//TODO use stack analysiusi to fiugure out apropriate stact sizes
static const char SENSOR_EVENT_TAG[] = "sensor_tasks";

QueueHandle_t sensor_queue_handle = NULL;
TaskHandle_t sensor_queue_task_handle = NULL;

QueueHandle_t sensor_preprocessing_handle = NULL;
TaskHandle_t  sensor_preprocessing_task_handle = NULL;

QueueHandle_t sensor_prepare_to_send_handle = NULL;
TaskHandle_t sensor_prepare_to_send_task_handle = NULL;

QueueHandle_t sensor_post_processing_handle = NULL;
TaskHandle_t sensor_post_processing_task_handle = NULL;

QueueHandle_t sensor_send_to_ram_handle = NULL;
TaskHandle_t sensor_send_to_ram_task_handle = NULL;

QueueHandle_t sensor_send_to_sd_db_handle = NULL;
TaskHandle_t sensor_send_to_sd_db_task_handle = NULL;

QueueHandle_t sensor_send_to_server_db_handle = NULL;
TaskHandle_t sensor_send_to_server_db_task_handle = NULL;

QueueHandle_t sensor_queue_mem_cleanup_handle = NULL;
TaskHandle_t sensor_queue_mem_cleanup_task_handle = NULL;


void sensor_queue_monitor_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
   
    for(;;){
        if (xQueueReceive(sensor_queue_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s entered sensor que",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,  
                                              sensor_type_to_string(event->sensor_data->sensor_type));
            
            
            switch(event->nextEventID){

                case SENSOR_PREPOCESSING:

                    if(xQueueSend(sensor_preprocessing_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to preprocessing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to preprocessing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_PREPARE_TO_SEND:

                    if(xQueueSend(sensor_prepare_to_send_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to prepare to send",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to prepare to send",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_POST_PROCESSING:

                    if(xQueueSend(sensor_post_processing_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to post processing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to post processing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_SEND_TO_RAM:

                    if(xQueueSend(sensor_send_to_ram_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to send to ram",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to send to ram",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_SEND_TO_SD_DB:


                    if(xQueueSend(sensor_send_to_sd_db_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed tosend to sd db",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to send to sd db",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_SEND_TO_SERVER_DB:


                    if(xQueueSend(sensor_send_to_server_db_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to send to server db",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to send to server db",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;

                case SENSOR_QUEUE_MEM_CLEANUP:


                    if(xQueueSend(sensor_queue_mem_cleanup_handle, &event, portMAX_DELAY) == pdPASS){
                        ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s passed to queue mem cleanup",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }else{
                        ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to queue mem cleanup",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                    }
                    break;
            }
            
        }
    }
}


void sensor_preprocessing_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_preprocessing_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in preprocessing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));

            //TODO:check values are within range if not send to cleanup
            //sensor_validation();

            #ifdef CONFIG_MODULUE_TYPE_NODE
                event->nextEventID=SENSOR_PREPARE_TO_SEND;
            #elif  CONFIG_MODULE_TYPE_CONTROLLER
                event->nextEventID=SENSOR_POST_PROCESSING;
            #else
                ESP_LOGE(SENSOR_EVENT_TAG, "Module type error in preprocessing");
            #endif

            xQueueSend(sensor_queue_monitor_task, &event, portMAX_DELAY);
        }
    }
}

void sensor_prepare_to_send_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_prepare_to_send_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s preparing to send",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));

            //TODO:change esp_now_comm struct wrapper name
            queue_packet_t *queue_packet = (queue_packet_t*)malloc(sizeof(queue_packet_t));
            uint8_t *temp_data;
            queue_packet->data = event->sensor_data;
            //printf("%s ->len: %d\n", queue_packet.data->location, strlen(queue_packet.data.location));

            queue_packet->len = calculate_serialized_size(queue_packet->data);
            temp_data = serialize_sensor_data(queue_packet->data, &queue_packet->len);
            queue_packet->data = temp_data;
            esp_now_comm_get_config_reciever_mac_addr(&queue_packet->mac_addr);


            extern QueueHandle_t esp_now_comm_outgoing_data_queue_handle;
            if(xQueueSend(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS){
                    ESP_LOGV(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s sent to esp_now outgoing que",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                }else{
                    ESP_LOGE(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s failed to pass to outcoming data que",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));
                }

            //free the wrapper as its changed hands to the esp_now_comm wrapper
            free(event);

        }
    }
}

void sensor_post_processing_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_post_processing_handle, &event, portMAX_DELAY) == pdTRUE){

            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in postprocessing",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));



            time_t currentTime;
            time(&currentTime);
            event->sensor_data->timestamp = currentTime;

            //temp for logging testing

            cJSON *json_data = cJSON_CreateObject();

            cJSON_AddNumberToObject(json_data, "mod id", event->sensor_data->module_id);
            cJSON_AddNumberToObject(json_data, "sensor id", event->sensor_data->local_sensor_id);
            cJSON_AddStringToObject(json_data, "timestamp", ctime(event->sensor_data->timestamp));
            cJSON_AddStringToObject(json_data, "location", event->sensor_data->location);
            cJSON_AddNumberToObject(json_data, "pin", event->sensor_data->pin_number);
            if(event->sensor_data->sensor_type == HUMIDITY){
                cJSON_AddNumberToObject(json_data, "value", event->sensor_data->value[0]);
            }else if(event->sensor_data->sensor_type == TEMP){
                cJSON_AddNumberToObject(json_data, "value", event->sensor_data->value[0]);
            }

            char *json_string = cJSON_Print(json_data);

            cJSON_Delete(json_data);

            ESP_LOGI(SENSOR_EVENT_TAG, "{mod:%d-id:%d-%s} Logged JSON Data: %s",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type),
                                                 json_string);

            free(event->sensor_data);
            free(event);

            //end temp for loggin and testing

        }
    }
}

void sensor_send_to_ram_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_send_to_ram_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in ram send process",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));


        }
    }
}

void sensor_send_to_sd_db_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_send_to_sd_db_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in sd db send process",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));


        }
    }
}

void sensor_send_to_server_db_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_send_to_server_db_handle, &event, portMAX_DELAY) == pdTRUE){
            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in external db send process",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));


        }
    }
}

void sensor_queue_mem_cleanup_task(void * pvParameters)
{
    sensor_queue_wrapper_t *event;
    for(;;){
        if (xQueueReceive(sensor_queue_mem_cleanup_handle, &event, portMAX_DELAY) == pdTRUE){

            ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in cleanup process",
                                                event->sensor_data->module_id,
                                                event->sensor_data->local_sensor_id,
                                                sensor_type_to_string(event->sensor_data->sensor_type));

        }
    }
}

esp_err_t initiate_sensor_queue(){
    ESP_LOGI(SENSOR_EVENT_TAG, "sensor queue init started");
    
    sensor_queue_handle = xQueueCreate(50, sizeof(sensor_queue_wrapper_t));
    sensor_preprocessing_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_prepare_to_send_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_post_processing_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_ram_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_sd_db_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_send_to_server_db_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));
    sensor_queue_mem_cleanup_handle = xQueueCreate(10, sizeof(sensor_queue_wrapper_t));

    xTaskCreatePinnedToCore(
        &sensor_queue_monitor_task,
        "sensor_queue_monitor",
        SENSOR_QUEUE_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_PRIORITY,
        &sensor_queue_task_handle,
        SENSOR_QUEUE_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_preprocessing_task,
        "sensor_prepocessing",
        SENSOR_PREPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_PREPROCESSING_PRIORITY,
        &sensor_preprocessing_handle,
        SENSOR_PREPROCESSING_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_prepare_to_send_task,
        "sensor_prepare_to_send",
        SENSOR_PREPARE_TO_SEND_STACK_SIZE,
        NULL,
        SENSOR_PREPARE_TO_SEND_PRIORITY,
        &sensor_prepare_to_send_handle,
        SENSOR_PREPARE_TO_SEND_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_post_processing_task,
        "sensor_post_processing",
        SENSOR_POSTPROCESSING_STACK_SIZE,
        NULL,
        SENSOR_POSTPROCESSING_PRIORITY,
        &sensor_post_processing_handle,
        SENSOR_POSTPROCESSING_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_send_to_ram_task,
        "sensor_send_to_ram",
        SENSOR_SEND_TO_RAM_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_RAM_PRIORITY,
        &sensor_send_to_ram_handle,
        SENSOR_SEND_TO_RAM_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_send_to_sd_db_task,
        "sensor_send_to_sd_db",
        SENSOR_SEND_TO_SD_DB_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SD_DB_PRIORITY,
        &sensor_send_to_sd_db_handle,
        SENSOR_SEND_TO_SD_DB_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_send_to_server_db_task,
        "sensor_send_to_server_db",
        SENSOR_SEND_TO_SERVER_DB_STACK_SIZE,
        NULL,
        SENSOR_SEND_TO_SERVER_DB_PRIORITY,
        &sensor_send_to_server_db_handle,
        SENSOR_SEND_TO_SERVER_DB_CORE_ID);


    xTaskCreatePinnedToCore(
        &sensor_queue_mem_cleanup_task,
        "sensor_queue_mem_cleanup",
        SENSOR_QUEUE_MEM_CLEANUP_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_MEM_CLEANUP_PRIORITY,
        &sensor_queue_mem_cleanup_handle,
        SENSOR_QUEUE_MEM_CLEANUP_CORE_ID);

      
        return ESP_OK;
}

char *sensor_type_to_string(Sensor_List sensor_type){
    int type = sensor_type;
    switch(type){
        case TEMP:
            return "temp";
            break;
        case HUMIDITY:
            return "humidity";
            break;
    }
    return "";
}