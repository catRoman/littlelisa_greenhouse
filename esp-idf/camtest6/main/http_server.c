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

#include "http_server.h"

#include "esp_camera.h"

#define PART_BOUNDARY "123456789000000000000987654321"
static const char *_STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char *_STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char *_STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

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
    xTaskCreatePinnedToCore(&http_server_monitor, "http_server_monitor",
                            8148, NULL, 5, &task_http_server_monitor, 1);

    // http server config
    config.core_id = 1;
    config.task_priority = 5;
    config.stack_size = 8148;
    config.max_uri_handlers = 20;
    config.max_open_sockets = 7;
    config.recv_wait_timeout = 10000;
    config.send_wait_timeout = 10000;

    ESP_LOGI(HTTP_SERVER_TAG, "http_server_configure: Starting server on port '%d'",
             config.server_port);

    // start the httpd server
    if (httpd_start(&http_server_handle, &config) == ESP_OK)
    {

        ESP_LOGI("http_handler", "http_server_configure: Registering URI handlers");

        /* Register a generic preflight handler */
        httpd_uri_t cam_stream_uri = {
            .uri = "/camStream",
            .method = HTTP_GET,
            .handler = jpg_stream_httpd_handler,
            .user_ctx = NULL};
        httpd_register_uri_handler(http_server_handle, &cam_stream_uri);

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

esp_err_t jpg_stream_httpd_handler(httpd_req_t *req)
{
    camera_fb_t *fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len;
    uint8_t *_jpg_buf;
    char *part_buf[64];
    static int64_t last_frame = 0;
    if (!last_frame)
    {
        last_frame = esp_timer_get_time();
    }

    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if (res != ESP_OK)
    {
        return res;
    }

    while (true)
    {
        fb = esp_camera_fb_get();
        if (!fb)
        {
            ESP_LOGE(HTTP_SERVER_TAG, "Camera capture failed");
            res = ESP_FAIL;
            break;
        }
        if (fb->format != PIXFORMAT_JPEG)
        {
            bool jpeg_converted = frame2jpg(fb, 20, &_jpg_buf, &_jpg_buf_len);
            if (!jpeg_converted)
            {
                ESP_LOGE(HTTP_SERVER_TAG, "JPEG compression failed");
                esp_camera_fb_return(fb);
                res = ESP_FAIL;
            }
        }
        else
        {
            _jpg_buf_len = fb->len;
            _jpg_buf = fb->buf;
        }

        if (res == ESP_OK)
        {
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
        }
        if (res == ESP_OK)
        {
            size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);

            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }
        if (res == ESP_OK)
        {
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }
        if (fb->format != PIXFORMAT_JPEG)
        {
            free(_jpg_buf);
        }
        esp_camera_fb_return(fb);
        if (res != ESP_OK)
        {
            break;
        }
        int64_t fr_end = esp_timer_get_time();
        int64_t frame_time = fr_end - last_frame;
        last_frame = fr_end;
        frame_time /= 1000;
        ESP_LOGI(HTTP_SERVER_TAG, "MJPG: %luKB %lums (%.1ffps)",
                 (uint32_t)(_jpg_buf_len / 1024),
                 (uint32_t)frame_time, 1000.0 / (uint32_t)frame_time);
    }

    last_frame = 0;
    return res;
}