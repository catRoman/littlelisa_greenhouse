#include <stdio.h>
#include <stdbool.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/task.h"

#include "esp_now_comm.h"
#include "task_common.h"


static const char ESP_NOW_TAG[] = "esp_now";

static TaskHandle_t task_esp_now_event_monitor = NULL;
static QueueHandle_t esp_now_event_monitor_queue_handle = NULL;

static void esp_now_event_monitor_task(void * xTASK_PARAMETERS)
{
    esp_now_queue_event_t event;
    for(;;){
        if (xQueueReceive(esp_now_event_monitor_queue_handle, &event, portMAX_DELAY) == pdTRUE){
            switch(event.eventID){
                case ESP_NOW_INIT:
                    break;
                case ESP_NOW_COMMUNICATION_SENT:
                    break;
                case ESP_NOW_COMMUNICATION_RECIEVED:
                    break;              
                case ESP_NOW_CONTRO_PEER_ADDED:
                    break;
                case ESP_NOW_PEER_DELETED:
                    break;
            }
        }
    }
}

esp_err_t esp_now_start(){
    esp_now_event_monitor_queue_handle = xQueueCreate(10, sizeof(esp_now_queue_event_t));

    xTaskCreatePinnedToCore(&esp_now_event_monitor_task, "esp_now_monitor",
        ESP_NOW_MONITOR_STACK_SIZE, NULL, ESP_NOW_MONITOR_PRIORITY, &esp_now_event_monitor_task, ESP_NOW_MONITOR_CORE_ID);
}


