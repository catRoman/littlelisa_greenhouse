#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "task_common.h"
#include "esp_log.h"

// extern TaskHandle_t sensor_queue_task_handle;
// extern TaskHandle_t sensor_preprocessing_task_handle;
// extern TaskHandle_t sensor_prepare_to_send_task_handle;
// extern TaskHandle_t sensor_post_processing_task_handle;
// extern TaskHandle_t sensor_send_to_ram_task_handle;
// extern TaskHandle_t sensor_send_to_sd_db_task_handle;
// extern TaskHandle_t sensor_send_to_server_task_handle;
// extern TaskHandle_t sensor_queue_mem_cleanup_task_handle;
// extern TaskHandle_t sensor_send_to_websocket_server_task_handle;
extern TaskHandle_t *sensor_task_handles;
extern int8_t total_local_sensors;

void pauseSensorPipelineTasks()
{

    for (int i = 0; i < total_local_sensors; i++)
    {
        vTaskSuspend(sensor_task_handles[i]);
        ESP_LOGD("task_common", "sensor task %d suspended", i);
    }
}

void resumeSensorPipelineTasks()
{
    for (int i = 0; i < total_local_sensors; i++)
    {
        vTaskResume(sensor_task_handles[i]);
        ESP_LOGD("task_common", "sensor task %d resumed", i);
    }
}