#include <stdio.h>
#include <stdbool.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "sensor_tasks.h"
#include "task_common.h"
#include "sdkconfig.h"

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

static QueueHandle_t sensor_queue_handle = NULL;
static TaskHandle_t sensor_queue_task_handle = NULL;

static QueueHandle_t sensor_preprocessing_handle = NULL;
static TaskHandle_t  sensor_preprocessing_task_handle = NULL;

static QueueHandle_t sensor_prepare_to_send_handle = NULL;
static TaskHandle_t sensor_prepare_to_send_task_handle = NULL;

static QueueHandle_t sensor_post_processing_handle = NULL;
static TaskHandle_t sensor_post_processing_task_handle = NULL;

static QueueHandle_t sensor_send_to_ram_handle = NULL;
static TaskHandle_t sensor_send_to_ram_task_handle = NULL;

static QueueHandle_t sensor_send_to_sd_db_handle = NULL;
static TaskHandle_t sensor_send_to_sd_db_task_handle = NULL;

static QueueHandle_t sensor_send_to_server_db_handle = NULL;
static TaskHandle_t sensor_send_to_server_db_task_handle = NULL;

static QueueHandle_t sensor_queue_mem_cleanup_handle = NULL;
static TaskHandle_t sensor_queue_mem_cleanup_task_handle = NULL;


static void sensor_queue_monitor_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_queue_handle, &event, portMAX_DELAY) == pdTRUE){

            switch(event.nextEventID){

                case SENSOR_PREPOCESSING:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in preprocessing",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_PREPARE_TO_SEND:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s preparing to send",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_POST_PROCESSING:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in postprocessing",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_SEND_TO_RAM:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in ram send process",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_SEND_TO_SD_DB:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in sd db send process",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_SEND_TO_SERVER_DB:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in external db send process",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
                case SENSOR_QUEUE_MEM_CLEANUP:
                    ESP_LOGI(SENSOR_EVENT_TAG, "mod:%d-id:%d-%s in cleanup process",
                                                event.sensor_data->module_id,
                                                event.sensor_data->local_sensor_id,
                                                sensor_type_to_string(event.sensor_data->sensor_type));
                    break;
            }
        }
    }
}


static void sensor_preprocessing_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_preprocessing_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_prepare_to_send_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_prepare_to_send_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_post_processing_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_post_processing_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_send_to_ram_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_send_to_ram_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_send_to_sd_db_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_send_to_sd_db_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_send_to_server_db_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_send_to_server_db_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

static void sensor_queue_mem_cleanup_task(void * pvParameters)
{
    sensor_queue_wrapper_t event;
    for(;;){
        if (xQueueReceive(sensor_queue_mem_cleanup_handle, &event, portMAX_DELAY) == pdTRUE){



        }
    }
}

esp_err_t sensor_queue_start(){
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
        &sensor_prepocessing_task,
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
        &sensor_postprocessing_task_handle,
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
}










void send_sensor_struct(dht22_sensor_t *sensor_t, int sensor_choice){
	// add sensor data to sensor struct , make queue wrappper and assign sensor data to it, send queue data
	//dht22 sensor data

//sesnor struct

	sensor_data_t sensor_data = {
		.pin_number= sensor_t->pin_number,
		.total_values = 1,
		.local_sensor_id = sensor_t->identifier,
		.module_id = CONFIG_MODULE_IDENTITY
	};


	//TODO: mem error handling
	sensor_data.value = (float *)malloc(sensor_data.total_values * sizeof(float));
	sensor_data.location = (char*)malloc(strlen(sensor_t->TAG)+1);
	strcpy(sensor_data.location, sensor_t->TAG);


	if(sensor_choice == HUMIDITY){
		sensor_data.sensor_type = HUMIDITY;
		sensor_data.value[0] = get_humidity(sensor_t);
	}else if(sensor_choice == TEMP){
		sensor_data.sensor_type = TEMP;
		sensor_data.value[0] = get_temperature(sensor_t);
	}


	queue_packet_t queue_packet = {0};
	uint8_t *temp_data;
	queue_packet.data = &sensor_data;
	//printf("%s ->len: %d\n", queue_packet.data->location, strlen(queue_packet.data.location));

	queue_packet.len = calculate_serialized_size(queue_packet.data);
	temp_data = serialize_sensor_data(queue_packet.data, &queue_packet.len);
	queue_packet.data = temp_data;
	esp_now_comm_get_config_reciever_mac_addr(&queue_packet.mac_addr);


	extern QueueHandle_t esp_now_comm_outgoing_data_queue_handle;
	 if(xQueueSend(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS){
            ESP_LOGV(TAG, "data recieved sent to outgoing que");
        }else{
            ESP_LOGE(TAG, "data failed to send to outcoming data que");
        }
 }
