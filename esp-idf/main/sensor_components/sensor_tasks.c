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


static const char SENSOR_QUEUE_TAG[] = "sensor_tasks";

static QueueHandle_t sensor_queue_handle = NULL;

static void sensor_event_monitor_task(void * xTASK_PARAMETERS)
{
    sensor_queue_type_t event;
    for(;;){
        if (xQueueReceive(sensor_queue_handle, &event, portMAX_DELAY) == pdTRUE){
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
    sensor_queue_handle = xQueueCreate(10, sizeof(sensor_queue_type_t));

    xTaskCreatePinnedToCore(&sensor_event_monitor_task, "sensor_queue_monitor",
        SENSOR_QUEUE_STACK_SIZE, NULL, SENSOR_QUEUE_PRIORITY, &sensor_event_monitor_task, SENSOR_QUEUE_CORE_ID);
}




