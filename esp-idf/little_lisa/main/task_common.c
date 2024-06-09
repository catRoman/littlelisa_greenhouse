#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "task_common.h"
#include "esp_log.h"

extern TaskHandle_t sensor_queue_task_handle;
extern TaskHandle_t sensor_preprocessing_task_handle;
extern TaskHandle_t sensor_prepare_to_send_task_handle;
extern TaskHandle_t sensor_post_processing_task_handle;
extern TaskHandle_t sensor_send_to_ram_task_handle;
extern TaskHandle_t sensor_send_to_sd_db_task_handle;
extern TaskHandle_t sensor_send_to_server_task_handle;
extern TaskHandle_t sensor_queue_mem_cleanup_task_handle;
extern TaskHandle_t sensor_send_to_websocket_server_task_handle;
extern TaskHandle_t *sensor_task_handles;
extern int8_t total_local_sensors;

void pauseSensorPipelineTasks()
{
    for (int i = 0; i < total_local_sensors; i++)
    {
        vTaskSuspend(sensor_task_handles[i]);
        ESP_LOGI("task_common", "sensor task %d suspended", i);
    }
    vTaskSuspend(sensor_queue_task_handle);
    ESP_LOGI("task_common", "task: sensor_queue paused");
    vTaskSuspend(sensor_preprocessing_task_handle);
    ESP_LOGI("task_common", "task: sensor_preprocessor paused");
    vTaskSuspend(sensor_prepare_to_send_task_handle);
    ESP_LOGI("task_common", "task: prepare_to_send paused");
    vTaskSuspend(sensor_post_processing_task_handle);
    ESP_LOGI("task_common", "task: post_processing paused");
    vTaskSuspend(sensor_send_to_ram_task_handle);
    ESP_LOGI("task_common", "task: send_to_ram paused");
    vTaskSuspend(sensor_send_to_sd_db_task_handle);
    ESP_LOGI("task_common", "task: send_to_sd_db paused");
    vTaskSuspend(sensor_send_to_server_task_handle);
    ESP_LOGI("task_common", "task: send_to_server paused");
    vTaskSuspend(sensor_queue_mem_cleanup_task_handle);
    ESP_LOGI("task_common", "task: mem_cleanup paused");
    vTaskSuspend(sensor_send_to_websocket_server_task_handle);
    ESP_LOGI("task_common", "task: send_to_websocket paused");

    ESP_LOGI("task_common", "all sensor tasks paused");
}

void resumeSensorPipelineTasks()
{
    for (int i = 0; i < total_local_sensors; i++)
    {
        vTaskResume(sensor_task_handles[i]);
        ESP_LOGI("task_common", "sensor task %d resumed", i);
    }

    vTaskResume(sensor_queue_task_handle);
    ESP_LOGI("task_common", "task: sensor_queue resumed");
    vTaskResume(sensor_preprocessing_task_handle);
    ESP_LOGI("task_common", "task: sensor_preprocessor resumed");
    vTaskResume(sensor_prepare_to_send_task_handle);
    ESP_LOGI("task_common", "task: prepare_to_send resumed");
    vTaskResume(sensor_post_processing_task_handle);
    ESP_LOGI("task_common", "task: post_processing resumed");
    vTaskResume(sensor_send_to_ram_task_handle);
    ESP_LOGI("task_common", "task: send_to_ram resumed");
    vTaskResume(sensor_send_to_sd_db_task_handle);
    ESP_LOGI("task_common", "task: send_to_sd_db resumed");
    vTaskResume(sensor_send_to_server_task_handle);
    ESP_LOGI("task_common", "task: send_to_server resumed");
    vTaskResume(sensor_queue_mem_cleanup_task_handle);
    ESP_LOGI("task_common", "task: mem_cleanup resumed");
    vTaskResume(sensor_send_to_websocket_server_task_handle);
    ESP_LOGI("task_common", "task: send_to_websocket resumed");

    ESP_LOGI("task_common", "all sensor tasks resumed");
}