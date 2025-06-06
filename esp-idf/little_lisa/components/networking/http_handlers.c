#include <stdlib.h>
#include <sys/param.h>

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_http_server.h"
#include "esp_ota_ops.h"
#include "esp_log.h"
#include "sdkconfig.h"
#include "esp_http_client.h"
#include "wifi_ap_sta.h"

// my components
#include "DHT22.h"
#include "module_config.h"
#include "sensor_tasks.h"
#include "http_server.h"
#include "http_handlers.h"
#include "nvs_service.h"
#include "node_info.h"
#include "module_config.h"
#include "sensor_tasks.h"
#include "module_config.h"
#include "websocket_server.h"
#include "spi_sd_card.h"
#include "http_client.h"
#include "helper.h"
#include "env_cntrl.h"
#include "cJSON.h"
#include "mdns.h"

#include "task_common.h"

#define SQL_ID_SYNC_VAL 1

TaskHandle_t myTaskHandle = NULL;
int ota_updating = false;

extern Module_info_t *module_info_gt;
extern int g_fw_update_status;
extern int g_wifi_connect_status;

extern httpd_handle_t http_server_handle;

// new landing page
// embed files: all files in new-landing page
extern const uint8_t index_html_start[] asm("_binary_index_html_start");
extern const uint8_t index_html_end[] asm("_binary_index_html_end");

extern const uint8_t favicon_png_start[] asm("_binary_favicon_png_start");
extern const uint8_t favicon_png_end[] asm("_binary_favicon_png_end");

extern const uint8_t index_js_start[] asm("_binary_index_js_start");
extern const uint8_t index_js_end[] asm("_binary_index_js_end");

extern const uint8_t index_css_start[] asm("_binary_index_css_start");
extern const uint8_t index_css_end[] asm("_binary_index_css_end");

extern const uint8_t list_svg_start[] asm("_binary_list_svg_start");
extern const uint8_t list_svg_end[] asm("_binary_list_svg_end");

static const char HTTP_HANDLER_TAG[] = "http_handlers";

void register_http_server_handlers(void)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "http_server_configure: Registering URI handlers");

    /* Register a generic preflight handler */
    httpd_uri_t options_uri = {
        .uri = "*",
        .method = HTTP_OPTIONS,
        .handler = preflight_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &options_uri);

    //=====================
    // littleLisa Debug content service
    //=====================

    // register index.html handler
    httpd_uri_t index_html = {
        .uri = "/",
        .method = HTTP_GET,
        .handler = index_html_handler,
        .user_ctx = NULL,
    };
    httpd_register_uri_handler(http_server_handle, &index_html);

    // register css handler
    httpd_uri_t index_css = {
        .uri = "/index.css",
        .method = HTTP_GET,
        .handler = index_css_handler,
        .user_ctx = NULL,
    };
    httpd_register_uri_handler(http_server_handle, &index_css);

    // register js handler
    httpd_uri_t index_js = {
        .uri = "/index.js",
        .method = HTTP_GET,
        .handler = index_js_handler,
        .user_ctx = NULL,
    };
    httpd_register_uri_handler(http_server_handle, &index_js);

    // register icon handler
    httpd_uri_t favicon_png = {
        .uri = "/favicon.png",
        .method = HTTP_GET,
        .handler = favicon_png_handler,
        .user_ctx = NULL,
    };
    httpd_register_uri_handler(http_server_handle, &favicon_png);

    // register icon handler
    httpd_uri_t list_svg = {
        .uri = "/icons/list.svg",
        .method = HTTP_GET,
        .handler = list_svg_handler,
        .user_ctx = NULL,
    };
    httpd_register_uri_handler(http_server_handle, &list_svg);

    // end of littlelisa content service

    //==========================
    // littleLisa API
    //=========================

    // register dhtSensor.json handler
    httpd_uri_t dht_sensor_json = {
        .uri = "/api/dhtSensor.json",
        .method = HTTP_GET,
        .handler = get_dht_sensor_readings_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &dht_sensor_json);

    // register wifiConnectStatus.json handler
    httpd_uri_t wifi_connect_status = {
        .uri = "/api/wifiConnectStatus.json",
        .method = HTTP_POST,
        .handler = wifi_connect_status_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &wifi_connect_status);

    // register wifiStaConnectInfo.json handler
    httpd_uri_t wifi_sta_connect_info_json = {
        .uri = "/api/wifiStaConnectInfo.json",
        .method = HTTP_GET,
        .handler = get_wifi_sta_connect_info_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &wifi_sta_connect_info_json);

    // register wifiApConnectInfo.json handler
    httpd_uri_t wifi_ap_connect_info_json = {
        .uri = "/api/wifiApConnectInfo.json",
        .method = HTTP_GET,
        .handler = get_wifi_ap_connect_info_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &wifi_ap_connect_info_json);

    // register moduleInfo.json handler
    httpd_uri_t module_info_json = {
        .uri = "/api/moduleInfo.json",
        .method = HTTP_GET,
        .handler = get_module_info_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &module_info_json);

    // register controllerStaList.json handler
    httpd_uri_t controller_sta_list_json = {
        .uri = "/api/controllerStaList.json",
        .method = HTTP_GET,
        .handler = get_controller_sta_list_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &controller_sta_list_json);

    // register uptimeFunk.json handler
    httpd_uri_t uptimeFunk_json = {
        .uri = "/api/uptimeFunk.json",
        .method = HTTP_GET,
        .handler = get_uptime_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &uptimeFunk_json);

    // register deviceInfo.json handler
    httpd_uri_t device_info_json = {
        .uri = "/api/deviceInfo.json",
        .method = HTTP_GET,
        .handler = get_device_info_json_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &device_info_json);

    // OTA-handlers

    // register upload handler
    httpd_uri_t upload_ota_sd = {
        .uri = "/ota/upload",
        .method = HTTP_POST,
        .handler = recv_ota_update_save_to_sd_post_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &upload_ota_sd);

    // register upload handler
    httpd_uri_t preform_ota = {
        .uri = "/ota/update",
        .method = HTTP_POST,
        .handler = ota_update_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &preform_ota);

    // register propgate update handler
    httpd_uri_t propagate_ota_update = {
        .uri = "/ota/update_prop",
        .method = HTTP_POST,
        .handler = propogate_ota_update_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &propagate_ota_update);

    // register propgate update handler
    httpd_uri_t ota_restart = {
        .uri = "/ota/restart",
        .method = HTTP_GET,
        .handler = ota_restart_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &ota_restart);

    // register systemstate handler
    httpd_uri_t system_state = {
        .uri = "/api/system_state",
        .method = HTTP_GET,
        .handler = get_system_state_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &system_state);

    // enviro cntrl get state handler
    httpd_uri_t env_state = {
        .uri = "/api/envState",
        .method = HTTP_GET,
        .handler = env_get_state_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &env_state);

    // enviro cntrl update handler
    httpd_uri_t env_state_update = {
        .uri = "/api/envStateUpdate",
        .method = HTTP_PUT,
        .handler = env_state_handler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &env_state_update);

    // enviro cntrl update handler
    httpd_uri_t proxyNodeUpdate = {
        .uri = "/api/updateNode",
        .method = HTTP_PUT,
        .handler = proxyUpdatehandler,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &proxyNodeUpdate);

    // enviro cntrl update handler
    httpd_uri_t nodeUpdatePos = {
        .uri = "/api/updateNodePos",
        .method = HTTP_PUT,
        .handler = update_node_pos,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &nodeUpdatePos);

    // enviro cntrl update handler
    httpd_uri_t nodeUpdateTag = {
        .uri = "/api/updateNodeTag",
        .method = HTTP_PUT,
        .handler = update_node_tag,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &nodeUpdateTag);

    // enviro cntrl update handler
    httpd_uri_t sensorUpdateTag = {
        .uri = "/api/updateSensorTag",
        .method = HTTP_PUT,
        .handler = update_sensor_tag,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &sensorUpdateTag);

    httpd_uri_t sensorUpdatePos = {
        .uri = "/api/updateSensorPos",
        .method = HTTP_PUT,
        .handler = update_sensor_pos,
        .user_ctx = NULL};
    httpd_register_uri_handler(http_server_handle, &sensorUpdatePos);
}
// static debug landing page content serve

esp_err_t index_css_handler(httpd_req_t *req)
{
    ESP_LOGD(HTTP_HANDLER_TAG, "index.css requested");

    httpd_resp_set_type(req, "text/css");
    httpd_resp_send(req, (const char *)index_css_start, index_css_end - index_css_start);

    return ESP_OK;
}

esp_err_t index_html_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "index.html requested");

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, (const char *)index_html_start, index_html_end - index_html_start);

    return ESP_OK;
}

esp_err_t index_js_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "index.js requested");

    httpd_resp_set_type(req, "application/javascript");
    httpd_resp_send(req, (const char *)index_js_start, index_js_end - index_js_start);

    return ESP_OK;
}

esp_err_t favicon_png_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "favicon.png requested");

    httpd_resp_set_type(req, "image/x-con");
    httpd_resp_send(req, (const char *)favicon_png_start, favicon_png_end - favicon_png_start);

    return ESP_OK;
}

esp_err_t list_svg_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "list.svg requested");

    httpd_resp_set_type(req, "image/x-con");
    httpd_resp_send(req, (const char *)list_svg_start, list_svg_end - list_svg_start);

    return ESP_OK;
}

// api
esp_err_t get_dht_sensor_readings_json_handler(httpd_req_t *req)
{

    // // Add CORS headers to the response
    // httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    // httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    // ESP_LOGV(HTTP_HANDLER_TAG, "dhtSensor.json requested");
    // char * dhtSensorJSON;
    // dht22_sensor_t sensor;
    // int sensor_choice;
    // char log_str [100] = "dht22-";

    // char* buf;
    // size_t buf_len;
    // // First, get the length of the query string
    // buf_len = httpd_req_get_url_query_len(req) + 1;
    // if (buf_len > 1) {
    //     buf = malloc(buf_len);
    //     if(!buf){
    //         httpd_resp_send_500(req);
    //         ESP_LOGE(HTTP_HANDLER_TAG, "memory allocation error");
    //     }
    //     if(httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
    //         char ident[3];
    //         char type[16];

    //         // Extract 'location' parameter
    //         if (httpd_query_key_value(buf, "identity", ident, sizeof(ident)) == ESP_OK) {
    //             int identNum = atoi(ident);

    //             if (identNum >= 1 && identNum < ((module_info_gt->identity)+SQL_ID_SYNC_VAL)){
    //                 sensor = dht22_sensor_arr[identNum];
    //                 size_t log_buf_size = sizeof(log_str) - strlen(log_str) - 1;
    //                 snprintf(log_str + strlen(log_str), log_buf_size, "%d-", identNum);
    //             }else {
    //                 ESP_LOGE(HTTP_HANDLER_TAG, "Invalid location parameter");
    //                 httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Invalid Location Parameter");

    //                 free(buf);
    //                 return ESP_FAIL;
    //             }
    //         } else {
    //             ESP_LOGE(HTTP_HANDLER_TAG, "Location parameter not found");
    //             httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Parameters Not Found");

    //             free(buf);
    //             return ESP_FAIL;
    //         }

    //         // Extract 'type' parameter
    //         if (httpd_query_key_value(buf, "type", type, sizeof(type)) == ESP_OK) {
    //             if (strcmp(type, "temp") == 0){
    //                 sensor_choice = TEMP;
    //                 strncat(log_str, "TEMP", 5);
    //             }else if(strcmp(type, "humidity") == 0) {
    //                 sensor_choice = HUMIDITY;
    //                 strncat(log_str, "humidity", 9);
    //             } else {
    //                 ESP_LOGE(HTTP_HANDLER_TAG, "Invalid type parameter");
    //                 httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Invalid Type Parameters");

    //                 free(buf);
    //                 return ESP_FAIL;
    //             }
    //         } else {
    //             ESP_LOGE(HTTP_HANDLER_TAG, "Type parameter not found");
    //             httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Parameters Not Found");

    //             free(buf);
    //             return ESP_FAIL;
    //         }
    //         strncat(log_str, " JSON requested", 16);
    //         ESP_LOGV(HTTP_HANDLER_TAG, "%s", log_str);
    //         dhtSensorJSON= get_DHT22_SENSOR_JSON_String(&sensor, sensor_choice);
    //         httpd_resp_set_type(req, "application/json");
    //         httpd_resp_send(req, dhtSensorJSON, strlen(dhtSensorJSON));
    //         ESP_LOGV(HTTP_HANDLER_TAG,"%s", dhtSensorJSON);
    //         free(dhtSensorJSON);
    //     }
    //     free(buf);
    // } else {
    //     ESP_LOGE(HTTP_HANDLER_TAG, "Query string not found");
    //     httpd_resp_send_404(req);
    //     return ESP_FAIL;
    // }

    return ESP_OK;
}

esp_err_t get_module_info_json_handler(httpd_req_t *req)
{

    extern Module_info_t *module_info_gt;
    ESP_LOGD(HTTP_HANDLER_TAG, "moduleInfo.json requested");

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    char *module_json_data = node_info_get_module_info_json(module_info_gt);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, module_json_data);
    free(module_json_data);

    return ESP_OK;
}

esp_err_t get_controller_sta_list_json_handler(httpd_req_t *req)
{

    ESP_LOGD(HTTP_HANDLER_TAG, "controllerStaList.json requested");

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    wifi_mode_t mode;
    esp_wifi_get_mode(&mode);

    if (mode == WIFI_MODE_APSTA || mode == WIFI_MODE_AP)
    {
        char *controller_sta_list = node_info_get_controller_sta_list_json();
        httpd_resp_set_type(req, "application/json");
        httpd_resp_sendstr(req, controller_sta_list);

        free(controller_sta_list);
    }
    else
    {
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - requested from node");
    }

    return ESP_OK;
}

esp_err_t wifi_connect_status_json_handler(httpd_req_t *req)
{

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "wifiConnectStatus requested");

    char statusJSON[100];
    sprintf(statusJSON, "{\"wifi_connect_status\":%d}", g_wifi_connect_status);
    httpd_resp_send(req, statusJSON, strlen(statusJSON));

    return ESP_OK;
}

esp_err_t get_device_info_json_handler(httpd_req_t *req)
{

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGD(HTTP_HANDLER_TAG, "deviceInfo.json requested");

    char *deviceInfo = node_info_get_device_info_json();
    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, deviceInfo);

    free(deviceInfo);
    return ESP_OK;
}

esp_err_t get_uptime_json_handler(httpd_req_t *req)
{

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGD(HTTP_HANDLER_TAG, "uptimeFunk.json requested");

    char *uptimeFunk = node_info_get_uptime_json();
    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, uptimeFunk);

    free(uptimeFunk);
    return ESP_OK;
}

esp_err_t get_wifi_sta_connect_info_json_handler(httpd_req_t *req)
{
    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "wifiConnectInfo.json requested");

    char *ipInfoJSON = node_info_get_network_sta_info_json();

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, ipInfoJSON, strlen(ipInfoJSON));

    free(ipInfoJSON);

    return ESP_OK;
}

esp_err_t get_wifi_ap_connect_info_json_handler(httpd_req_t *req)
{
    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "wifiConnectInfo.json requested");

    char *ap_info = node_info_get_network_ap_info_json();

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, ap_info, strlen(ap_info));

    free(ap_info);

    return ESP_OK;
}

esp_err_t get_system_state_handler(httpd_req_t *req)
{
    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "systemState requested");

    char pcWriteBuffer[2048];
    vTaskGetRunTimeStats(pcWriteBuffer);
    printf("%s\n\n", pcWriteBuffer);

    TaskStatus_t pxTaskStatusArray[30];
    uint32_t uxArraySize = 30;

    uint32_t uxNumberOfTasks;
    uxNumberOfTasks = uxTaskGetSystemState(pxTaskStatusArray, uxArraySize, NULL);
    for (uint32_t i = 0; i < uxNumberOfTasks; i++)
    {
        printf("Task: %s\tHigh Water Mark: %lu words\n",
               pxTaskStatusArray[i].pcTaskName,
               pxTaskStatusArray[i].usStackHighWaterMark);
    }

    httpd_resp_set_hdr(req, "Content-Type", "text/plain");
    httpd_resp_send(req, pcWriteBuffer, strlen(pcWriteBuffer));

    return ESP_OK;
}

esp_err_t preflight_handler(httpd_req_t *req)
{
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    httpd_resp_send(req, NULL, 0); // 200 OK with no body
    return ESP_OK;
}

esp_err_t recv_ota_update_save_to_sd_post_handler(httpd_req_t *req)
{

    //    spi_sd_card_test();
    if (recv_ota_update_write_to_sd(req) == ESP_OK)
    {
        httpd_resp_sendstr(req, "File uploaded successfully");
    }
    else
    {
        httpd_resp_sendstr(req, "Error: File uploaded unsuccessfully");
    }

    return ESP_OK;
}

esp_err_t ota_update_handler(httpd_req_t *req)
{
    ESP_LOGI("OTA_UPDATE", "pausing sensor pipeline for ota update");
    pauseSensorPipelineTasks();
    char ota_buff[1024]; // Buffer size adjusted for chunk size
    int recv_len;
    bool is_req_body_started = false;

    esp_ota_handle_t ota_handle;

    const esp_partition_t *ota_partition = esp_ota_get_next_update_partition(NULL);

    // Initialize OTA update on this partition
    esp_err_t err = esp_ota_begin(ota_partition, OTA_SIZE_UNKNOWN, &ota_handle);
    if (err != ESP_OK)
    {
        ESP_LOGE("OTA_UPDATE", "esp_ota_begin failed, error=%d", err);
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA begin failed");
        ESP_LOGI("OTA_UPDATE", "resuming sensor pipeline for ota update");
        resumeSensorPipelineTasks();
        return ESP_FAIL;
    }

    ESP_LOGI("OTA_UPDATE", "Starting OTA...");
    int remaining = req->content_len;

    while ((recv_len = httpd_req_recv(req, ota_buff, sizeof(ota_buff))) > 0)
    {
        ESP_LOGI("OTA_UPDATE", "%d bytes", remaining);
        taskYIELD();

        if (!is_req_body_started)
        {
            is_req_body_started = true;
            ESP_LOGI("OTA_UPDATE", "Receiving OTA data...");
        }

        // Write received data to the OTA partition
        if (esp_ota_write(ota_handle, (const void *)ota_buff, recv_len) != ESP_OK)
        {
            ESP_LOG_BUFFER_HEX("OTA Data", ota_buff, recv_len);
            ESP_LOGE("OTA_UPDATE", "OTA write failed");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA write failed");
            esp_ota_abort(ota_handle);
            ESP_LOGI("OTA_UPDATE", "resuming sensor pipeline for ota update");
            resumeSensorPipelineTasks();
            return ESP_FAIL;
        }
        remaining -= recv_len;
    }

    if (recv_len < 0)
    {
        ESP_LOGE("OTA_UPDATE", "Receive error %d", recv_len);
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Error receiving data");
        esp_ota_abort(ota_handle);
        ESP_LOGI("OTA_UPDATE", "resuming sensor pipeline for ota update");
        resumeSensorPipelineTasks();
        return ESP_FAIL;
    }

    // Complete the OTA update
    if (esp_ota_end(ota_handle) != ESP_OK)
    {
        ESP_LOGE("OTA_UPDATE", "OTA end failed");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA end failed");
        ESP_LOGI("OTA_UPDATE", "resuming sensor pipeline for ota update");
        resumeSensorPipelineTasks();
        return ESP_FAIL;
    }

    // Set the new OTA partition as the boot partition
    if (esp_ota_set_boot_partition(ota_partition) != ESP_OK)
    {
        ESP_LOGE("OTA_UPDATE", "OTA set boot partition failed");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA set boot partition failed");
        ESP_LOGI("OTA_UPDATE", "resuming sensor pipeline for ota update");
        resumeSensorPipelineTasks();
        return ESP_FAIL;
    }

    ESP_LOGI("OTA_UPDATE", "OTA Update Successful. Waiting for reboot signal");
    httpd_resp_send(req, "OTA Update Successful. Waiting for reboot signal", HTTPD_RESP_USE_STRLEN);

    vTaskDelay(pdMS_TO_TICKS(5000));

    // esp_restart(); // Restart the system to boot from the updated firmware

    return ESP_OK;
}
esp_err_t ota_restart_handler(httpd_req_t *req)
{
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");

    ESP_LOGE("OTA_UPDATE", "restart messageRecieved. rebooting in 5 seconds");
    httpd_resp_send(req, "OTA restart recieved. rebooting", HTTPD_RESP_USE_STRLEN);
    vTaskDelay(pdMS_TO_TICKS(1000));
    ESP_LOGI("OTA_UPDATE", "ensuring all suspended task restarted before restart");
    resumeSensorPipelineTasks();
    esp_restart();
}

esp_err_t propogate_ota_update_handler(httpd_req_t *req)
{
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");

    ota_updating = true;
    ESP_LOGI("OTA_UPDATE_PROP", "pausing sensors tasks");
    pauseSensorPipelineTasks();
    // //download to sd
    if (recv_ota_update_write_to_sd(req) == ESP_OK)
    {

        httpd_resp_send(req, "OTA update recieved successful. Preforming update to all nodes and controller...", HTTPD_RESP_USE_STRLEN);

        //  wifi_config_t wifi_config;
        //     ESP_ERROR_CHECK(esp_wifi_get_config(WIFI_IF_AP, &wifi_config));
        //     strncpy((char*)wifi_config.ap.password, "uploading", sizeof(wifi_config.ap.password));
        //     wifi_config.ap.authmode = WIFI_AUTH_WPA_WPA2_PSK; // Ensure mode that requires password
        //     ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));
        //     vTaskDelay(pdMS_TO_TICKS(100));
    }
    else
    {
        httpd_resp_send(req, "Could not download ota update in full, cancelling update", HTTPD_RESP_USE_STRLEN);
        ESP_LOGI("OTA_UPDATE_PROP", "resuming sensors tasks");
        resumeSensorPipelineTasks();
        return ESP_FAIL;
    }

    // Loop over each connected station
    ESP_LOGD("OTA_PROP_UPADTE", "Free heap size: %lu bytes\n", esp_get_free_heap_size());
    BaseType_t task_code;
    task_code = xTaskCreatePinnedToCore(
        node_ota_update_send,
        "node_ota_update_send",
        OTA_PROP_STACK_SIZE,
        NULL,
        OTA_PROP_TASK_PRIORITY,
        &myTaskHandle,
        OTA_PROP_TASK_CORE_ID);
    // taskCreated = xTaskCreatePinnedToCore(
    //         http_test_task,
    //         "test_send",
    //         8000,
    //         NULL,
    //         7,
    //        &myTaskHandle,
    //         1);

    if (task_code != pdPASS)
    {
        ESP_LOGE("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
        ESP_LOGI("OTA_UPDATE_PROP", "resuming sensors tasks");
        resumeSensorPipelineTasks();
    }

    return ESP_OK;
}

esp_err_t recv_ota_update_write_to_sd(httpd_req_t *req)
{

    //    spi_sd_card_test();

    const char *file_path = MOUNT_POINT "/ota.bin";

    ESP_LOGI("SD_DOWNLOAD", "{==POST WRITE==} Opening file %s", file_path);
    FILE *fd = fopen(file_path, "w");

    if (fd == NULL)
    {
        ESP_LOGE("FILE", "Failed to open file for writing");
        return ESP_FAIL;
    }

    // Read the content posted by the browser
    char buf[1024];
    int received;

    // Content length
    int remaining = req->content_len;
    ESP_LOGI("SD_DOWNLOAD", "initial content length -> %d", remaining);
    while (remaining > 0)
    {
        // Calculate how much data to read
        int to_read = sizeof(buf);
        if (to_read > remaining)
        {
            to_read = remaining;
        }

        // Read data and write it to the file
        received = httpd_req_recv(req, buf, to_read);
        if (received <= 0)
        {
            fclose(fd);
            if (received == HTTPD_SOCK_ERR_TIMEOUT)
            {
                ESP_LOGE("SD_DOWNLOAD", "Socket Timeout");
                return ESP_FAIL;
            }
            ESP_LOGE("SD_DOWNLOAD", "Error in receiving file");

            return ESP_FAIL;
        }

        // Write the received data to the file
        fwrite(buf, 1, received, fd);
        remaining -= received;
        ESP_LOGI("SD_DOWNLOAD", "%d bytes", remaining);
        ESP_LOGD("SD_DOWNLOAD", "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
    }
    ESP_LOGI("SD_DOWNLOAD", "recieving finished closing file");
    fclose(fd);

    ESP_LOGI("SD_DOWNLOAD", "File download succesfully to sd card--> 'ota.bin'");
    return ESP_OK;
}

// void node_ota_update_send(void *vpParam){
//     wifi_sta_list_t sta_list;

//     // Get the list of connected stations
//     ESP_ERROR_CHECK(esp_wifi_ap_get_sta_list(&sta_list));
//  for(;;){
//     ESP_LOGI(HTTP_HANDLER_TAG, "INSIDE TASK");

//    for (int i = 0; i < sta_list.num; i++) {
//         char node_addr[100];
//         snprintf(node_addr, sizeof(node_addr)-1, "http://littlelisa-node-%02x-%02x-%02x-%02x-%02x-%02x.local/api/moduleInfo.json",
//              sta_list.sta[i].mac[0], sta_list.sta[i].mac[1], sta_list.sta[i].mac[2], sta_list.sta[i].mac[3], sta_list.sta[i].mac[4], sta_list.sta[i].mac[5]);

//         ESP_LOGI("OTA_PROP_UPDATE", "node %d: %s being sent update", i, node_addr);
//         //post_file_in_chunks(node_addr, OTA_FILENAME);
//         http_client_get_test(node_addr);
//     }
//     vTaskDelete(NULL);
//  }
// }

void node_ota_update_send(void *vpParam)
{

    wifi_sta_list_t sta_list;
    portMUX_TYPE myMutex = portMUX_INITIALIZER_UNLOCKED;
    // Get the list of connected stations
    ESP_ERROR_CHECK(esp_wifi_ap_get_sta_list(&sta_list));
    ESP_LOGI("OTA_UPDATE_PROP", "ensuring sensors tasks paused");
    pauseSensorPipelineTasks();
    // prevent station joining while update gumming up everything while allowing debug
    // site to stay open

    for (;;)
    {
        ESP_LOGD("OTA_PROP_UDATE", "INSIDE TASK");

        for (int i = 1; i <= sta_list.num; i++)
        {
            char node_addr[100];
            ESP_LOGI("OTA_PROP_UDATE", "updating node %d", i);
            vTaskDelay(pdMS_TO_TICKS(3000));
            snprintf(node_addr, sizeof(node_addr) - 1, "http://192.168.0.%d/ota/update",
                     i + 1);
            ESP_LOGI("OTA_PROP_UDATE", "UPDATING_NODE_%d", i);
            ESP_LOGI("OTA_PROP_UPDATE", "node %d: %s being sent update", i, node_addr);
            //   taskENTER_CRITICAL(&myMutex);
            post_file_in_chunks(node_addr, OTA_FILENAME);
            //    taskEXIT_CRITICAL(&myMutex);
            // taskYIE"LD();
            ESP_LOGD("OTA_PROP_UPDATE", "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
        }
        ESP_LOGI("OTA_PROP_UPDATE", "ALL_NODE_UPDATES_COMPLETE");

        if (ota_update_from_sd() == ESP_OK)
        {
            ESP_LOGI("OTA_UPDATE", "OTA complete restarting all nodes");
            for (int i = 1; i <= sta_list.num; i++)
            {
                char node_addr_url[100];
                ESP_LOGI("OTA_PROP_UDATE", "restarting node %d", i);
                snprintf(node_addr_url, sizeof(node_addr_url) - 1, "http://192.168.0.%d/ota/restart",
                         i + 1);
                send_ota_restart(node_addr_url);
            }

            ESP_LOGI("OTA_SD_UPDATE", "resuming sensor pipeline for clean restart");
            resumeSensorPipelineTasks();
            ESP_LOGI("OTA_SD_UPDATE", "REFRESH_DEBUG_PAGE");
            ESP_LOGI("OTA_SD_UPDATE", "OTA update from SD card complete, rebooting...");
            vTaskDelay(pdMS_TO_TICKS(500));
            esp_restart();
        }
        else
        {
            ESP_LOGI("OTA_SD_UPDATE", "OTA on self failed");
            ESP_LOGI("OTA_UPDATE_PROP", "resuming sensors tasks");
            resumeSensorPipelineTasks();
            ota_updating = false;
        }

        // turn wifi back on in case of failure

        vTaskDelete(NULL);
    }
}

esp_err_t env_state_handler(httpd_req_t *req)
{

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "env_state_update requested");

    char buf[10];
    int ret;

    /* Read the data for the request */
    if ((ret = httpd_req_recv(req, buf, MIN(req->content_len, sizeof(buf) - 1))) <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    /* Null-terminate the received data */
    buf[ret] = '\0';

    /* Convert the received string to an integer */
    int state_id = atoi(buf);
    char *state_type = cntrl_state_type_to_string(state_id);
    ESP_LOGW(HTTP_HANDLER_TAG, "Received state change request state_id: %s", state_type);
    free(state_type);
    State_event_t state_event =
        {
            .id = state_id};

    extern SemaphoreHandle_t xStateChangeSemaphore;
    extern QueueHandle_t env_cntrl_queue_handle;
    if (xQueueSend(env_cntrl_queue_handle, &state_event, portMAX_DELAY) == pdPASS)
    {

        ESP_LOGW(HTTP_HANDLER_TAG, "id recieved from put passed to env_cntrl");
    }
    else
    {
        ESP_LOGD(HTTP_HANDLER_TAG, "failed to pass id to env_cntrl que");
        httpd_resp_send_500(req);
        return ESP_FAIL;
    }

    extern int8_t total_relays;

    if (xSemaphoreTake(xStateChangeSemaphore, portMAX_DELAY) == pdTRUE)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "sempahore taken for evn state change");
        char *current_state = env_state_arr_json(total_relays);

        httpd_resp_set_type(req, "application/json");
        httpd_resp_send(req, current_state, HTTPD_RESP_USE_STRLEN);
        free(current_state);
        return ESP_OK;
    }
    else
    {

        httpd_resp_send_500(req);

        return ESP_FAIL;
    }

    /* Send JSON response */
}

esp_err_t env_get_state_handler(httpd_req_t *req)
{
    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    ESP_LOGI(HTTP_HANDLER_TAG, "envState requested");

    extern int8_t total_relays;
    char *current_state = env_state_arr_json(total_relays);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, current_state, HTTPD_RESP_USE_STRLEN);
    free(current_state);
    return ESP_OK;
}

esp_err_t proxyUpdatehandler(httpd_req_t *req)
{

    char end_point[32], mac_addr[32], x_pos[4], y_pos[4], z_pos[4], new_tag[32], zone_num[4];
    char urlBuff[100], host_name_buff[50], sensor_type[25], local_id[4];

    if (httpd_req_get_hdr_value_str(req, "Node-Mac-Addr", mac_addr, sizeof(mac_addr)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-Mac-Addr: %s", mac_addr);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-Mac-Addr not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive mac addr from header");
        return ESP_FAIL;
    }

    if (httpd_req_get_hdr_value_str(req, "Update-Endpoint", end_point, sizeof(end_point)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Update-Endpoint: %s", end_point);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Update-Endpoint not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive end point from header");
        return ESP_FAIL;
    }
    // query_mdns_services();

    snprintf(host_name_buff, sizeof(host_name_buff), "littlelisa-node-%s", mac_addr);
    char ip_addr[30];
    mdns_result_t *results = NULL;
    esp_err_t mdnsErr = mdns_query_ptr("_http", "_tcp", 1000, 10, &results);
    if (mdnsErr)
    {
        ESP_LOGE(HTTP_HANDLER_TAG, "Query failed: %s", esp_err_to_name(mdnsErr));
        return ESP_FAIL;
    }

    if (!results)
    {
        ESP_LOGW(HTTP_HANDLER_TAG, "No results found!");
        return ESP_FAIL;
    }

    mdns_result_t *r = results;

    ESP_LOGI(HTTP_HANDLER_TAG, "count: %d", results->txt_count);
    int found = false;
    while (r)
    {
        if (r->addr == NULL)
        {

            ESP_LOGI(HTTP_HANDLER_TAG, "null address issue... could not find node");
            r = r->next;
        }
        else
        {

            char ip_str[INET_ADDRSTRLEN];
            inet_ntoa_r(r->addr->addr.u_addr.ip4, ip_str, sizeof(ip_str));
            ESP_LOGI(HTTP_HANDLER_TAG, "Service: %s, Host: %s, IP: %s, Port: %u",
                     r->instance_name, r->hostname, ip_str, r->port);

            if (strcmp(r->hostname, host_name_buff) == 0)
            {
                ESP_LOGI(HTTP_HANDLER_TAG, "hostname found ip-> %s", ip_str);
                found = true;
                strcpy(ip_addr, ip_str);
                break;
            }
            else
            {
                r = r->next;
            }
        }
    }
    if (found == false)
    {
        ESP_LOGD(HTTP_HANDLER_TAG, "couldnt find mdns... node may be offline");
        return ESP_FAIL;
    }
    // make url
    snprintf(urlBuff, sizeof(urlBuff), "http://%s:80/api/%s", ip_addr, end_point);
    ESP_LOGI(HTTP_HANDLER_TAG, "url created: %s", urlBuff);
    esp_http_client_config_t config = {
        .url = urlBuff, // Replace with the actual URL
        .method = HTTP_METHOD_PUT,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);

    if (strcmp(end_point, "updateNodePos") == 0)
    {
        if (httpd_req_get_hdr_value_str(req, "Node-Zone-Num", zone_num, sizeof(zone_num)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Node-Zone-Num: %s", zone_num);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Node-Zone-Num not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Node-Zone-Num from header");
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Pos-X", x_pos, sizeof(x_pos)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X: %s", x_pos);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-X from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Pos-Y", y_pos, sizeof(y_pos)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y: %s", y_pos);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Y from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        esp_http_client_set_header(client, "Node-Zone-Num", zone_num);
        esp_http_client_set_header(client, "Pos-Y", y_pos);
        esp_http_client_set_header(client, "Pos-X", x_pos);
    }
    else if (strcmp(end_point, "updateNodeTag") == 0)
    {
        if (httpd_req_get_hdr_value_str(req, "Node-New-Tag", new_tag, sizeof(new_tag)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Node-New-Tag: %s", new_tag);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Node-New-Tag not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Node-New-Tag from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }

        // send data to cluient wait for reponse

        esp_http_client_set_header(client, "Node-New-Tag", new_tag);

        //===============================
        //=================SENSOR UPDATE
        //==============================
    }
    else if (strcmp(end_point, "updateSensorTag") == 0)
    {
        if (httpd_req_get_hdr_value_str(req, "Sensor-New-Tag", new_tag, sizeof(new_tag)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-New-Tag: %s", new_tag);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-New-Tag not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-New-Tag from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Sensor-Type", sensor_type, sizeof(sensor_type)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type: %s", sensor_type);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Type from header");
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Sensor-Local-Id", local_id, sizeof(local_id)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id: %s", local_id);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Local-Id from header");
            return ESP_FAIL;
        }
        // send data to cluient wait for reponse

        esp_http_client_set_header(client, "Sensor-New-Tag", new_tag);
        esp_http_client_set_header(client, "Sensor-Local-Id", local_id);
        esp_http_client_set_header(client, "Sensor-Type", sensor_type);
    }
    else if (strcmp(end_point, "updateSensorPos") == 0)
    {

        if (httpd_req_get_hdr_value_str(req, "Sensor-Type", sensor_type, sizeof(sensor_type)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type: %s", sensor_type);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Type from header");
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Sensor-Local-Id", local_id, sizeof(local_id)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id: %s", local_id);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Local-Id from header");
            return ESP_FAIL;
        }

        if (httpd_req_get_hdr_value_str(req, "Pos-X", x_pos, sizeof(x_pos)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X: %s", x_pos);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-X from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Pos-Y", y_pos, sizeof(y_pos)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y: %s", y_pos);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Y from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        if (httpd_req_get_hdr_value_str(req, "Pos-Z", z_pos, sizeof(z_pos)) == ESP_OK)
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z: %s", z_pos);
        }
        else
        {
            ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z not found");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Z from header");
            esp_http_client_cleanup(client);
            return ESP_FAIL;
        }
        esp_http_client_set_header(client, "Pos-Y", y_pos);
        esp_http_client_set_header(client, "Pos-X", x_pos);
        esp_http_client_set_header(client, "Pos-Z", z_pos);
        esp_http_client_set_header(client, "Sensor-Local-Id", local_id);
        esp_http_client_set_header(client, "Sensor-Type", sensor_type);
    }
    else
    {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "unknown end point from header");
        return ESP_FAIL;
    }

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "HTTP PUT Status = %d",
                 esp_http_client_get_status_code(client));

        const char *resp = "Proxy request successful";
        httpd_resp_send(req, resp, strlen(resp));
    }
    else
    {
        ESP_LOGE(HTTP_HANDLER_TAG, "HTTP PUT request failed: %s", esp_err_to_name(err));
        httpd_resp_send_500(req);
        esp_http_client_cleanup(client);
        return ESP_FAIL;
    }

    // Clean up
    esp_http_client_cleanup(client);

    // Send response
    const char resp[] = "update data  successfully";
    httpd_resp_send(req, resp, strlen(resp));

    return ESP_OK;
}

esp_err_t update_node_pos(httpd_req_t *req)
{
    char x_pos[4], y_pos[4], z_pos[4], zone_num[4];

    if (httpd_req_get_hdr_value_str(req, "Pos-X", x_pos, sizeof(x_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X: %s", x_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-X from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Pos-Y", y_pos, sizeof(y_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y: %s", y_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Y from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Pos-Z", z_pos, sizeof(z_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z: %s", z_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z not found, assuming square pos assigning -1");
        strcpy(z_pos, "-1");
    }
    if (httpd_req_get_hdr_value_str(req, "Node-Zone-Num", zone_num, sizeof(zone_num)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-Zone-Num: %s", zone_num);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-Zone-Numnot found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Node-Zone-Num from header");
        return ESP_FAIL;
    }

    ESP_LOGI(HTTP_HANDLER_TAG, "x_pos: %s, y_pos: %s, z_pos: %s", x_pos, y_pos, z_pos);
    int xPos = atoi(x_pos);
    int yPos = atoi(y_pos);
    int zPos = atoi(z_pos);
    int zoneNum = atoi(zone_num);
    ESP_LOGI(HTTP_HANDLER_TAG, "xPos: %d, yPos: %d, zPos: %d", xPos, yPos, zPos);

    if (xPos <= 0 || yPos <= 0)
    {

        module_info_gt->square_pos[0] = -1;
        module_info_gt->square_pos[1] = -1;
        module_info_gt->zn_rel_pos[0] = 0;
        module_info_gt->zn_rel_pos[1] = 0;
        module_info_gt->zn_rel_pos[2] = 0;
        module_info_gt->zone_num = 0;
    }
    else if (xPos > 0 && yPos > 0 && zPos <= 0)
    {
        module_info_gt->square_pos[0] = xPos;
        module_info_gt->square_pos[1] = yPos;

        module_info_gt->zn_rel_pos[0] = -1;
        module_info_gt->zn_rel_pos[1] = -1;
        module_info_gt->zn_rel_pos[2] = -1;

        module_info_gt->zone_num = zoneNum;
    }
    else
    {
        module_info_gt->square_pos[0] = -1;
        module_info_gt->square_pos[1] = -1;

        module_info_gt->zn_rel_pos[0] = xPos;
        module_info_gt->zn_rel_pos[1] = yPos;
        module_info_gt->zn_rel_pos[2] = zPos;

        module_info_gt->zone_num = zoneNum;
    }

    nvs_set_module(
        module_info_gt->greenhouse_id,
        module_info_gt->zone_num,
        module_info_gt->square_pos,
        module_info_gt->zn_rel_pos,
        module_info_gt->type,
        module_info_gt->location,
        module_info_gt->identity);

    ESP_LOGI(HTTP_HANDLER_TAG, "module location updated from http->nvs updated");
    const char resp[] = "module location updated from http->nvs updated";
    httpd_resp_send(req, resp, strlen(resp));

    return ESP_OK;
}

esp_err_t update_node_tag(httpd_req_t *req)
{
    char new_tag[32];

    if (httpd_req_get_hdr_value_str(req, "Node-New-Tag", new_tag, sizeof(new_tag)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-New-Tag: %s", new_tag);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Node-New-Tag not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Node-New-Tag from header");
        return ESP_FAIL;
    }

    free(module_info_gt->location);
    module_info_gt->location = (char *)malloc(sizeof(char) * (1 + strlen(new_tag)));

    if (module_info_gt->location == NULL)
    {
        ESP_LOGD(HTTP_HANDLER_TAG, "Memory allocation failed setting new tag\n");
        return ESP_ERR_NO_MEM;
    }
    strcpy(module_info_gt->location, new_tag);

    nvs_set_module(
        module_info_gt->greenhouse_id,
        module_info_gt->zone_num,
        module_info_gt->square_pos,
        module_info_gt->zn_rel_pos,
        module_info_gt->type,
        module_info_gt->location,
        module_info_gt->identity);

    ESP_LOGI(HTTP_HANDLER_TAG, "module tag updated from http->nvs updated");
    const char resp[] = "module tag updated from http->nvs updated";
    httpd_resp_send(req, resp, strlen(resp));

    return ESP_OK;
}
esp_err_t update_sensor_tag(httpd_req_t *req)
{
    char new_tag[32], local_id[4], sensor_type[25];
    Sensor_List sensorType;

    if (httpd_req_get_hdr_value_str(req, "Sensor-New-Tag", new_tag, sizeof(new_tag)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-New-Tag: %s", new_tag);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-New-Tag not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive sensor-New-Tag from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Sensor-Local-Id", local_id, sizeof(local_id)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id: %s", local_id);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Local-Id from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Sensor-Type", sensor_type, sizeof(sensor_type)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type: %s", sensor_type);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Type from header");
        return ESP_FAIL;
    }
    if (strcmp(sensor_type, "dht22") == 0)
    {
        sensorType = DHT22;
    }
    else if (strcmp(sensor_type, "soil_moisture") == 0)
    {
        sensorType = SOIL_MOISTURE;
    }
    else if (strcmp(sensor_type, "light") == 0)
    {
        sensorType = LIGHT;
    }
    else if (strcmp(sensor_type, "sound") == 0)
    {
        sensorType = SOUND;
    }
    else if (strcmp(sensor_type, "movement") == 0)
    {
        sensorType = MOVEMENT;
    }
    else
    {
        sensorType = CAMERA;
    }

    int8_t localId = (int8_t)atoi(local_id);

    free(module_info_gt->sensor_config_arr[sensorType]->sensor_loc_arr[localId]);
    module_info_gt->sensor_config_arr[sensorType]->sensor_loc_arr[localId] = (char *)malloc(sizeof(char) * (1 + strlen(new_tag)));

    if (module_info_gt->sensor_config_arr[sensorType]->sensor_loc_arr[localId] == NULL)
    {
        ESP_LOGD(HTTP_HANDLER_TAG, "Memory allocation failed setting new sensor tag\n");
        return ESP_ERR_NO_MEM;
    }
    strcpy(module_info_gt->sensor_config_arr[sensorType]->sensor_loc_arr[localId], new_tag);

    extern nvs_handle_t nvs_sensor_loc_arr_handle;

    save_serialized_sensor_loc_arr_to_nvs(
        serializeModuleSensorConfigArray(
            module_info_gt->sensor_config_arr,
            SENSOR_LIST_TOTAL),
        nvs_sensor_loc_arr_handle,
        NVS_SENSOR_CONFIG_NAMESPACE,
        NVS_SENSOR_CONFIG_ARR_INDEX);

    ESP_LOGI(HTTP_HANDLER_TAG, "sensor tag updated from http->nvs updated");
    const char resp[] = "sensor tag updated from http->nvs updated";
    httpd_resp_send(req, resp, strlen(resp));

    return ESP_OK;
}
esp_err_t update_sensor_pos(httpd_req_t *req)
{
    Sensor_List sensorType;
    char x_pos[4], y_pos[4], z_pos[4], sensor_type[25], local_id[4];

    if (httpd_req_get_hdr_value_str(req, "Pos-X", x_pos, sizeof(x_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X: %s", x_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-X not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-X from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Pos-Y", y_pos, sizeof(y_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y: %s", y_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Y not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Y from header");
        return ESP_FAIL;
    }
    if (httpd_req_get_hdr_value_str(req, "Pos-Z", z_pos, sizeof(z_pos)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z: %s", z_pos);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Pos-Z not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Pos-Z from header");
        return ESP_FAIL;
    }

    if (httpd_req_get_hdr_value_str(req, "Sensor-Local-Id", local_id, sizeof(local_id)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id: %s", local_id);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Local-Id from header");
        return ESP_FAIL;
    }

    if (httpd_req_get_hdr_value_str(req, "Sensor-Type", sensor_type, sizeof(sensor_type)) == ESP_OK)
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Type: %s", sensor_type);
    }
    else
    {
        ESP_LOGI(HTTP_HANDLER_TAG, "Sensor-Local-Id not found");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive Sensor-Local-Id from header");
        return ESP_FAIL;
    }
    if (strcmp(sensor_type, "dht22") == 0)
    {
        sensorType = DHT22;
    }
    else if (strcmp(sensor_type, "soil_moisture") == 0)
    {
        sensorType = SOIL_MOISTURE;
    }
    else if (strcmp(sensor_type, "light") == 0)
    {
        sensorType = LIGHT;
    }
    else if (strcmp(sensor_type, "sound") == 0)
    {
        sensorType = SOUND;
    }
    else if (strcmp(sensor_type, "movement") == 0)
    {
        sensorType = MOVEMENT;
    }
    else
    {
        sensorType = CAMERA;
    }

    ESP_LOGI(HTTP_HANDLER_TAG, "x_pos: %s, y_pos: %s, z_pos: %s", x_pos, y_pos, z_pos);
    int8_t xPos = (int8_t)atoi(x_pos);
    int8_t yPos = (int8_t)atoi(y_pos);
    int8_t zPos = (int8_t)atoi(z_pos);
    int8_t localId = (int8_t)atoi(local_id);

    if (xPos <= 0 || yPos <= 0)
    {

        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][0] = -1;
        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][1] = -1;

        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][0] = 0;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][1] = 0;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][2] = 0;
    }
    else if (xPos > 0 && yPos > 0 && zPos <= 0)
    {

        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][0] = xPos;
        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][1] = yPos;

        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][0] = -1;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][1] = -1;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][2] = -1;
    }
    else
    {

        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][0] = -1;
        module_info_gt->sensor_config_arr[sensorType]->square_pos[localId][1] = -1;

        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][0] = xPos;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][1] = yPos;
        module_info_gt->sensor_config_arr[sensorType]->zn_rel_pos[localId][2] = zPos;
    }

    extern nvs_handle_t nvs_sensor_loc_arr_handle;

    save_serialized_sensor_loc_arr_to_nvs(
        serializeModuleSensorConfigArray(
            module_info_gt->sensor_config_arr,
            SENSOR_LIST_TOTAL),
        nvs_sensor_loc_arr_handle,
        NVS_SENSOR_CONFIG_NAMESPACE,
        NVS_SENSOR_CONFIG_ARR_INDEX);

    ESP_LOGI(HTTP_HANDLER_TAG, "module location updated from http->nvs updated");
    const char resp[] = "module location updated from http->nvs updated";
    httpd_resp_send(req, resp, strlen(resp));

    return ESP_OK;
}