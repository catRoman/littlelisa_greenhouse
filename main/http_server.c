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
#include "esp_ota_ops.h"
#include "sys/param.h"
#include "esp_timer.h"

#include "http_server.h"
#include "task_common.h"
#include "wifi_app.h"
#include "DHT22.h"

// Tag used for ESP serial console message
static const char TAG[] = "http_server";

// Firmware update status
static int g_fw_update_status = OTA_UPDATE_PENDING;

// HTTP Server task handle
static httpd_handle_t http_server_handle = NULL;

// HTTP server monitor task
static TaskHandle_t task_http_server_monitor = NULL;

// Queue handle used to manipulate the main queue of events
static QueueHandle_t http_server_monitor_queue_handle;

/**
 * ESP32 timer configuration passed to esp_timer_creat
*/
const esp_timer_create_args_t fw_update_reset_args = {
    .callback = &http_server_fw_update_reset_callback,
    .arg = NULL,
    .dispatch_method = ESP_TIMER_TASK,
    .name = "fw_update_reset"
};
esp_timer_handle_t fw_update_reset;

// Embeded files: JQuery, index.html, app.css, app.js and favicon.ico files
extern const uint8_t jquery_3_3_1_min_js_start[]    asm("_binary_jquery_3_3_1_min_js_start");
extern const uint8_t jquery_3_3_1_min_js_end[]      asm("_binary_jquery_3_3_1_min_js_end");

extern const uint8_t index_html_start[]             asm("_binary_index_html_start");
extern const uint8_t index_html_end[]               asm("_binary_index_html_end");

extern const uint8_t app_css_start[]                asm("_binary_app_css_start");
extern const uint8_t app_css_end[]            asm("_binary_app_css_end");

extern const uint8_t app_js_start[]                 asm("_binary_app_js_start");
extern const uint8_t app_js_end[]                   asm("_binary_app_js_end");

extern const uint8_t favicon_ico_start[]            asm("_binary_favicon_ico_start");
extern const uint8_t favicon_ico_end[]              asm("_binary_favicon_ico_end");
/**
 * Checks the g_fw_update_status and creates the fw_update_reset_timer if
 * g_fw_update_status is true.
*/
static void http_server_fw_update_reset_timer(void)
{
    if (g_fw_update_status == OTA_UPDATE_SUCCESSFUL)
    {
        ESP_LOGI(TAG, "http_server_fw_update_reset_timer: fw update succesful starting Fw update rest timer");

        // Give the web page a chance to recieve an acknowedge back and initalize the timer
        ESP_ERROR_CHECK(esp_timer_create(&fw_update_reset_args, &fw_update_reset));
        ESP_ERROR_CHECK(esp_timer_start_once(fw_update_reset, 8000000));
    }    
    else
    {
        ESP_LOGI(TAG, "http_Server_fw_update_reset_timer: FW update unsuccessful");
    }
}
/**
 * http server monitor task, used to track events of the http server
 * @param pvPArameters parameter which can be passed to the task
 */
static void http_server_monitor(void * xTASK_PARAMETERS)
{
    http_server_queue_message_t msg;
    for(;;)
    {
        if (xQueueReceive(http_server_monitor_queue_handle, &msg, portMAX_DELAY))
        {
            switch(msg.msgID)
            {
                case HTTP_MSG_WIFI_CONNECT_INIT:
                    ESP_LOGI(TAG, "HTTP_MSG_CONNECT_INIT");

                    break;

                case HTTP_MSG_WIFI_CONNECT_SUCCESS:
                    ESP_LOGI(TAG, "HTTP_MSG_CONNECT_SUCCESS");

                    break;

                case HTTP_MSG_WIFI_CONNECT_FAIL:
                    ESP_LOGI(TAG, "HTTP_MSG_WIFI_CONNECT_FAIL");

                    break;

                case HTTP_MSG_OTA_UPDATE_SUCCESSFUL:
                    ESP_LOGI(TAG, "HTTP_MSG_OTA_UPDATE_SUCCESFUL");
                    g_fw_update_status = OTA_UPDATE_SUCCESSFUL;
                    http_server_fw_update_reset_timer();
                    break;

                case HTTP_MSG_OTA_UPDATE_FAILED:
                    ESP_LOGI(TAG, "HTTP_MSG_OTA_UPDATE_FAILED");
                    g_fw_update_status = OTA_UPDATE_FAILED;

                    break;

                default:
                    break;
            }
        }
    }
}

/** 
 * jquery get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_server_jquery_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "JQuery requested");

    httpd_resp_set_type(req, "application/javascript");
    httpd_resp_send(req, (const char *)jquery_3_3_1_min_js_start, jquery_3_3_1_min_js_end - jquery_3_3_1_min_js_start);

    return ESP_OK;
}

/**
 * sends theindex.html page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_server_index_html_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "index.html requested");

    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, (const char *)index_html_start, index_html_end- index_html_start);

    return ESP_OK;
}

/**
 * app.js get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_server_app_js_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "App.js requested");

    httpd_resp_set_type(req, "application/javascript");
    httpd_resp_send(req, (const char *)app_js_start, app_js_end - app_js_start);

    return ESP_OK;
}

/**
 * App.css get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_server_app_css_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "App.css requested");

    httpd_resp_set_type(req, "text/css");
    httpd_resp_send(req, (const char *)app_css_start, app_css_end - app_css_start);

    return ESP_OK;
}

/**
 * sends the .ico (icon) file  when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_server_favicon_ico_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "Favicon.ico requested");

    httpd_resp_set_type(req, "image/x-icon");
    httpd_resp_send(req, (const char *)favicon_ico_start, favicon_ico_end - favicon_ico_start);

    return ESP_OK;
}
/**
 * Recieves the .bin file via the web page and handles the firmware update
 * @param req HTTP request for which the uri needs to be handles.
 * @return ESP_OK, otherwise ESP_FAIL if timeout occurs and the update cannot be started
*/
esp_err_t http_server_OTA_update_handler(httpd_req_t *req)
{
    esp_ota_handle_t ota_handle;

    char ota_buff[1024];
    int content_length = req->content_len;
    int content_recieved = 0;
    int recv_len;
    bool is_req_body_started = false;
    bool flash_succesful = false;

    const esp_partition_t *update_partition = esp_ota_get_next_update_partition(NULL);

    do
    {
        // Read the data for the request
        if ((recv_len = httpd_req_recv(req, ota_buff, MIN(content_length, sizeof(ota_buff)))) < 0)
        {
            // check if timeout occured
            if (recv_len == HTTPD_SOCK_ERR_TIMEOUT)
            {
                ESP_LOGI(TAG, "http_server_/ota_update_handler: Socket Timeout");
                continue; // retry recieving if timeout occured
            }
            ESP_LOGI(TAG, "http_server_OTA_update_handler: OTA other Error %d", recv_len);
            return ESP_FAIL;
        }
        printf("http_server_OTA_update_handler: OTA RX: %d of %d\r", content_recieved, content_length);

        // is this the first data we are recieving
        // if so, it will have the information in the header that we need
        if (!is_req_body_started)
        {
            is_req_body_started = true;

            // get the location of the .bin file content (remove the web form data)
            char *body_start_p = strstr(ota_buff, "\r\n\r\n") + strlen("\r\n\r\n"); // + 4
            int body_part_len = recv_len - (body_start_p - ota_buff);

            printf("http_server_OTA_update_handler: OTA file size: %d\r\n", content_length);

            esp_err_t err = esp_ota_begin(update_partition, OTA_SIZE_UNKNOWN, &ota_handle);
            if(err != ESP_OK)
            {
                printf("http_server_OTA_update_handler: Error with OTA begin, cancelling OTA\r\n");
            }
            else
            {
                printf("http_server_OTA_update_handler: Writing to partioin subtype %d at offset 0x%lx\r\n", update_partition->subtype, update_partition->address);
            }
            // write this first part of the data
            esp_ota_write(ota_handle, body_start_p, body_part_len);
            content_recieved += body_part_len;
        }
        else
        {
            // write OTA data
            esp_ota_write(ota_handle, ota_buff, recv_len);
            content_recieved += recv_len;
        }
    } while ( recv_len > 0 && content_recieved < content_length);
    
    if(esp_ota_end(ota_handle) == ESP_OK)
    {
        // update the partition
        if (esp_ota_set_boot_partition(update_partition) == ESP_OK)
        {
            const esp_partition_t *boot_partition = esp_ota_get_boot_partition();
            ESP_LOGI(TAG, "http_server_OTA_update_handle: Next boot partition subtype %d at offset 0x%lx", boot_partition->subtype, boot_partition->address);
            flash_succesful = true;
        }
        else
        {
            ESP_LOGI(TAG, "http_server_OTA_update_handler: FLASH ERROR! ! !");
        }
    }
    else
    {
        ESP_LOGI(TAG, "http_server_OTA_update_handler: esp_ota_end ERROR! ! !");
    }
    // we wont update the global variables throughout the file, so send the message sbout the status
    if(flash_succesful) 
    { 
        http_server_monitor_send_message(HTTP_MSG_OTA_UPDATE_SUCCESSFUL);
    }
    else 
    {
        http_server_monitor_send_message(HTTP_MSG_OTA_UPDATE_FAILED);
    }

    return ESP_OK;
}

/**
 * OTA status handler responds with the firmware update status after the OTA update is started
 * and responds with the compile time/date when the page is first requested
 * @param req http request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_OTA_status_handler(httpd_req_t *req)
{
    char otaJSON[100];

    ESP_LOGI(TAG, "OTAstatus requested");

    sprintf(otaJSON, "{\"ota_update_status\":%d,\"compile_time\":\"%s\",\"compile_data\":\"%s\"}", g_fw_update_status, __TIME__, __DATE__);
    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, otaJSON, strlen(otaJSON));

    return ESP_OK;
}

/**
 * DHT sensor readings JSON handler responds with DHT22 sensor data
 * @param req http request for which the uri needs to be handled
 * @return ESP_OK
*/
static esp_err_t http_ser_get_dht_sensor_readings_json_handler(httpd_req_t *req)
{
    ESP_LOGI(TAG, "/dhtSensor.json requested");

    char dhtSensorJSON[100];

    sprintf(dhtSensorJSON, "{\"temp\":\"%.1f\", \"humidity\":\"%.1f\"}", (getTemperature()*(9.0/5.0) + 32), getHumidity()); //temp in fahrenheit

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, dhtSensorJSON, strlen(dhtSensorJSON));

    return ESP_OK;
}

/**
 * Setsd up the default httpd server configurations
 * @return http server inc\stance handle if succseful, NULL otherwise
*/
static httpd_handle_t http_server_configuration(void)
{
    // Generate the default configuration
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    // create HTTP server monitor task
    xTaskCreatePinnedToCore(&http_server_monitor, "http_server_monitor", 
        HTTP_SERVER_MONITOR_STACK_SIZE, NULL, HTTP_SERVER_MONITOR_PRIORITY, &task_http_server_monitor, HTTP_SERVER_MONITOR_CORE_ID);
    // create the message queue
    http_server_monitor_queue_handle = xQueueCreate(3, sizeof(http_server_queue_message_t));
    // The core that the http will run on
    config.core_id = HTTP_SERVER_TASK_CORE_ID;

    //adjust the default priority to 1 less then the wifi application task
    config.task_priority = HTTP_SERVER_TASK_PRIORITY;

    // Bump up the stack size (default is 4096)
    config.stack_size = HTTP_SERVER_TASK_STACK_SIZE;

    // increase uri handlers
    config.max_uri_handlers = 20;

    // increase the timeout limits
    config.recv_wait_timeout = 10;
    config.send_wait_timeout = 10;

    ESP_LOGI(TAG, "http_server_configure: Starting server on port '%d'", 
            config.server_port);

    // start the httpd server
    if(httpd_start(&http_server_handle, &config)== ESP_OK)
    {
        ESP_LOGI(TAG, "http_server_configure: Registering URI handlers");

        //register query handler
        httpd_uri_t jquery_js = {
            .uri = "/jquery-3.3.1.min.js",
            .method = HTTP_GET,
            .handler = http_server_jquery_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &jquery_js);
        
        //register index.html handler
        httpd_uri_t index_html = {
            .uri = "/",
            .method = HTTP_GET,
            .handler = http_server_index_html_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_html);

        //register query handler
        httpd_uri_t app_css = {
            .uri = "/app.css",
            .method = HTTP_GET,
            .handler = http_server_app_css_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &app_css);
     
        //register query handler
        httpd_uri_t app_js = {
            .uri = "/app.js",
            .method = HTTP_GET,
            .handler = http_server_app_js_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &app_js);

        //register query handler
        httpd_uri_t favicon_ico = {
            .uri = "/favicon.ico",
            .method = HTTP_GET,
            .handler = http_server_favicon_ico_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &favicon_ico);

        // resgister OTA update handler
        httpd_uri_t OTA_update = {
            .uri = "/OTAupdate",
            .method = HTTP_POST,
            .handler = http_server_OTA_update_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &OTA_update);
        
        // register_OTAstatus_handler
        httpd_uri_t OTA_status = {
            .uri = "/OTAstatus",
            .method = HTTP_POST,
            .handler = http_server_OTA_status_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &OTA_status);

        //register D]dhtSensor.json handler
        httpd_uri_t dht_sensor_json = {
            .uri = "/dhtSensor.json",
            .method = HTTP_GET,
            .handler = http_ser_get_dht_sensor_readings_json_handler,
            .user_ctx = NULL
        };;
        httpd_register_uri_handler(http_server_handle, &dht_sensor_json);


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
    if(http_server_handle)
    {
        httpd_stop(http_server_handle);
        ESP_LOGI(TAG, "http_server_stop: stopping HTTP server");
        http_server_handle = NULL;
    }
    if (task_http_server_monitor)
    {
        vTaskDelete(task_http_server_monitor);
        ESP_LOGI(TAG, "http_server_stop: stopping http server monitor");
        task_http_server_monitor = NULL;
    }
}

BaseType_t http_server_monitor_send_message(http_server_message_e msgID)
{
    http_server_queue_message_t msg;
    msg.msgID = msgID;
    return xQueueSend(http_server_monitor_queue_handle, &msg, portMAX_DELAY);
}


void http_server_fw_update_reset_callback(void *arg)
{
    ESP_LOGI(TAG, "http_server_fw_update_reset_callback: Timer timed out, restarting the device");
    esp_restart();
}