/**
 * @file		http_server.c
 * @brief		http server setup
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 *
 */

#include "esp_http_server.h"
#include "esp_log.h"

#include "esp_wifi.h"
#include "sys/param.h"
#include "esp_timer.h"

#include "task_common.h"

#include "http_server.h"
#include "wifi_ap_sta.h"
#include "DHT22.h"
#include "http_handlers.h"
<<<<<<< HEAD
=======
#include "led.h"
>>>>>>> landing_page

// wifi connect status
int g_wifi_connect_status = NONE;

static const char HTTP_SERVER_TAG[] = "http_server";
httpd_handle_t http_server_handle = NULL;
static TaskHandle_t task_http_server_monitor = NULL;
static QueueHandle_t http_server_monitor_queue_handle;
esp_timer_handle_t fw_update_reset;

static void http_server_monitor(void *xTASK_PARAMETERS)
{
    http_server_queue_message_t msg;
    for (;;)
    {
        if (xQueueReceive(http_server_monitor_queue_handle, &msg, portMAX_DELAY))
        {
            switch (msg.msgID)
            {
            case HTTP_MSG_WIFI_CONNECT_INIT:
                ESP_LOGI(HTTP_SERVER_TAG, "HTTP_MSG_CONNECT_INIT");
                g_wifi_connect_status = HTTP_WIFI_STATUS_CONNECTING;
                break;

            case HTTP_MSG_WIFI_CONNECT_SUCCESS:
                ESP_LOGI(HTTP_SERVER_TAG, "HTTP_MSG_CONNECT_SUCCESS");
                g_wifi_connect_status = HTTP_WIFI_STATUS_CONNECT_SUCCESS;
                break;

            case HTTP_MSG_WIFI_CONNECT_FAIL:
                ESP_LOGI(HTTP_SERVER_TAG, "HTTP_MSG_WIFI_CONNECT_FAIL");
                g_wifi_connect_status = HTTP_WIFI_STATUS_CONNECT_FAILED;
                break;

            default:
                break;
            }
        }
    }
}

static httpd_handle_t http_server_configuration(void)
{
    // Generate the default configuration
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    // create the message queue
    http_server_monitor_queue_handle = xQueueCreate(3, sizeof(http_server_queue_message_t));

    vTaskDelay(pdMS_TO_TICKS(100));

    // create HTTP server monitor task
    BaseType_t task_code;
    task_code = xTaskCreatePinnedToCore(&http_server_monitor, "http_server_monitor",
                                        HTTP_SERVER_MONITOR_STACK_SIZE, NULL, HTTP_SERVER_MONITOR_PRIORITY, &task_http_server_monitor, HTTP_SERVER_MONITOR_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    // http server config
    config.core_id = HTTP_SERVER_TASK_CORE_ID;
    config.task_priority = HTTP_SERVER_TASK_PRIORITY;
    config.stack_size = HTTP_SERVER_TASK_STACK_SIZE;
    config.max_uri_handlers = 30;
    config.max_open_sockets = 13;
    config.recv_wait_timeout = 100;
    config.send_wait_timeout = 100;

    ESP_LOGI(HTTP_SERVER_TAG, "http_server_configure: Starting server on port '%d'",
             config.server_port);

    // start the httpd server
    if (httpd_start(&http_server_handle, &config) == ESP_OK)
    {
        led_http_server_started();
        register_http_server_handlers();
        return http_server_handle;
    }

    return NULL;
}

void http_server_start(void)
{
    if (http_server_handle == NULL)
    {
        http_server_handle = http_server_configuration();
    };
}

void http_server_stop(void)
{
    if (http_server_handle)
    {
        httpd_stop(http_server_handle);
        ESP_LOGI(HTTP_SERVER_TAG, "http_server_stop: stopping HTTP server");
        http_server_handle = NULL;
    }
    if (task_http_server_monitor)
    {
        vTaskDelete(task_http_server_monitor);
        ESP_LOGI(HTTP_SERVER_TAG, "http_server_stop: stopping http server monitor");
        task_http_server_monitor = NULL;
    }
}

BaseType_t http_server_monitor_send_message(http_server_message_e msgID)
{
    http_server_queue_message_t msg;
    msg.msgID = msgID;
    // vTaskDelay(5000 / portTICK_PERIOD_MS);
    return xQueueSend(http_server_monitor_queue_handle, &msg, portMAX_DELAY);
}
