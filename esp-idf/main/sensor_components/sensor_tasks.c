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

//TODO: make queue wrapper for passing genic sensor struct with state to que
//      -->alocate memory at sensor source for sensor_struct_t and queue wrapper
//              (sesnor task-outgoing/esp_now_com_recv-incoming?)
//      -->wrap in sensor_queue_event_t, pass pointer
//      -->at esp_now_send-ack-send to sensor_cleanup-if fail push back to esp_now_comm_outgoing
//       -->at
//      -->cleanup sensor event using a semaphore given during postprocessing depending on how
//      -->tasks it was sent to-->sensor_event_queue has metadata for semaphore count?, 
//      -->clean waits for completion before freeing memory
//TODO: make tasks for each step including routing to the next step and passing back to the queue
/**
 * -preprocessing ->recieved from sensor task - validation -move to process_for_outgoing or to postprocessing depending on module(node/controler)
 * -process_for_outgoing-> recieved from preprocessing - allocate esp_now_queue wrapper, free sensor wrapper, get serialized size, serialize data send to esp_now_comm_outgoing queue 
 *              (function in dht22.c basicly already written turned into task)
 * -postprocessing -> recieved from either precoseesing or incoming_esp_now queue - routing to different areas adding semaphores and count as need, checking for route
 *                      reliability (db online etc) send to send_to_sd_db, 
 * -cleanup -> recieved from _http_process, sd-db_process, external_db_process - based on semphore count clean up wrapper and sensor struct
*/
//TODO make task logic for each task, validation, post_process, to_http, to sd_db, to_ram, to external_db
//TODO reorganize sensor tasks related between module_config, esp-now_comm, dht22 to focus on que use

static const char SENSOR_EVENT_TAG[] = "sensor_tasks";

static QueueHandle_t sensor_event_queue_handle = NULL;
static TaskHandle_t sensor_event_task_handle = NULL;

static void sensor_event_monitor_task(void * pvParameters)
{
    sensor_event_type_t event;
    for(;;){
        if (xQueueReceive(sensor_event_queue_handle, &event, portMAX_DELAY) == pdTRUE){
            
            switch(event.eventID){
                
                case SENSOR_PREPOCESSING:
                    break;
                case SENSOR_ESP_NOW_SEND:
                    break;
                case SENSOR_ESP_NOW_REC:
                    break;
                case SENSOR_POST_PROCESS:
                    break;
                case SENSOR_SEND_TO_RAM:
                    break;
                case SENSOR_SEND_TO_SD_DB:
                    break;
                case SENSOR_SEND_TO_SERVER_DB:
                    break;
            }         
        }
    }
}

esp_err_t sensor_queue_start(){
    sensor_event_queue_handle = xQueueCreate(10, sizeof(sensor_event_type_t));

    xTaskCreatePinnedToCore(
        &sensor_event_monitor_task,
        "sensor_queue_monitor",
        SENSOR_QUEUE_STACK_SIZE,
        NULL,
        SENSOR_QUEUE_PRIORITY,
        &sensor_event_task_handle,
        SENSOR_QUEUE_CORE_ID);
}




