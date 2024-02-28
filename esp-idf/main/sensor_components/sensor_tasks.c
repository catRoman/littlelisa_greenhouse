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


static const char SENSOR_EVENT_TAG[] = "sensor_tasks";

static QueueHandle_t sensor_event_queue_handle = NULL;
static TaskHandle_t sensor_event_task_handle = NULL;

static void sensor_event_monitor_task(void * pvParameters)
{
    sensor_event_type_t event;
    for(;;){
        if (xQueueReceive(sensor_event_queue_handle, &event, portMAX_DELAY) == pdTRUE){
            
            #ifdef CONFIG_MODULE_TYPE_CONTROLLER
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
            #elif CONFIG_MODULE_TYPE_NODE
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
            #else
                ESP_LOGE(TAG, "Module config error: no module type found");
            #endif
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




