#include <stdlib.h>
#include <sys/param.h>

#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_http_server.h"
#include "esp_ota_ops.h"
#include "esp_log.h"

#include "sensor_components/DHT22.h"
#include "network_components/http_server.h"
#include "network_components/http_handlers.h"
#include "nvs_components/nvs_service.h"
#include "nvs_components/node_info.c"
#include "nvs_components/module_config.h"
#include "sensor_components/sensor_tasks.h"
#include "sdkconfig.h"

#define SQL_ID_SYNC_VAL 1

// sensor data instances
extern dht22_sensor_t dht22_sensor_arr[CONFIG_SENSOR_TEMP + SQL_ID_SYNC_VAL];

extern int g_fw_update_status;
extern int g_wifi_connect_status;

extern httpd_handle_t http_server_handle;

//new landing page
//embed files: all files in new-landing page
extern const uint8_t index_html_start[]         asm("_binary_index_html_start");
extern const uint8_t index_html_end[]         asm("_binary_index_html_end");

extern const uint8_t plant3_svg_start[]         asm("_binary_plant3_svg_start");
extern const uint8_t plant3_svg_end[]         asm("_binary_plant3_svg_end");


extern const uint8_t index_js_start[]         asm("_binary_index_js_start");
extern const uint8_t index_js_end[]         asm("_binary_index_js_end");


extern const uint8_t index_css_start[]         asm("_binary_index_css_start");
extern const uint8_t index_css_end[]         asm("_binary_index_css_end");



static const char HTTP_HANDLER_TAG [] = "http_handlers";



void register_http_server_handlers(void)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "http_server_configure: Registering URI handlers");

        //register index.html handler
        httpd_uri_t index_html = {
            .uri = "/",
            .method = HTTP_GET,
            .handler = index_html_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_html);

        //register css handler
        httpd_uri_t index_css = {
            .uri = "/assets/index.css",
            .method = HTTP_GET,
            .handler = index_css_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_css);

        //register js handler
        httpd_uri_t index_js = {
            .uri = "/assets/index.js",
            .method = HTTP_GET,
            .handler = index_js_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_js);

        //register icon handler
        httpd_uri_t plant3_svg = {
            .uri = "/plant3.svg",
            .method = HTTP_GET,
            .handler = plant3_svg_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &plant3_svg);

        //register dhtSensor.json handler
        httpd_uri_t dht_sensor_json = {
        .uri = "/api/dhtSensor.json",
            .method = HTTP_GET,
            .handler = get_dht_sensor_readings_json_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &dht_sensor_json);

        //register wifiConnectStatus.json handler
        httpd_uri_t wifi_connect_status = {
            .uri = "/api/wifiConnectStatus.json",
            .method = HTTP_POST,
            .handler = wifi_connect_status_json_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &wifi_connect_status);

        //register wifiConnectInfo.json handler
        httpd_uri_t wifi_connect_info_json = {
            .uri = "/api/wifiConnectInfo.json",
            .method = HTTP_GET,
            .handler = get_wifi_connect_info_json_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &wifi_connect_info_json);

        //register moduleInfo.json handler
            httpd_uri_t module_info_json = {
                .uri = "/api/moduleInfo.json",
                .method = HTTP_GET,
                .handler = get_module_info_json_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &module_info_json);

        /* Register a generic preflight handler */
            httpd_uri_t options_uri = {
                .uri       = "*",
                .method    = HTTP_OPTIONS,
                .handler   = preflight_handler,
                .user_ctx  = NULL
            };
            httpd_register_uri_handler(http_server_handle, &options_uri);

}


esp_err_t index_css_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "index.css requested");

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
    httpd_resp_send(req, (const char *)index_html_start, index_html_end- index_html_start);

    return ESP_OK;
}

esp_err_t index_js_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "index.js requested");

    httpd_resp_set_type(req, "application/javascript");
    httpd_resp_send(req, (const char *)index_js_start, index_js_end - index_js_start);

    return ESP_OK;
}

 esp_err_t plant3_svg_handler(httpd_req_t *req)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "plant3.svg requested");

    httpd_resp_set_type(req, "image/x-con");
    httpd_resp_send(req, (const char *)plant3_svg_start, plant3_svg_end - plant3_svg_start);

    return ESP_OK;
}



esp_err_t get_dht_sensor_readings_json_handler(httpd_req_t *req)
{

    // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");




    ESP_LOGV(HTTP_HANDLER_TAG, "dhtSensor.json requested");
    char * dhtSensorJSON;
    dht22_sensor_t sensor;
    int sensor_choice;
    char log_str [100] = "dht22-";

    char* buf;
    size_t buf_len;
    // First, get the length of the query string
    buf_len = httpd_req_get_url_query_len(req) + 1;
    if (buf_len > 1) {
        buf = malloc(buf_len);
        if(!buf){
            httpd_resp_send_500(req);
            ESP_LOGE(HTTP_HANDLER_TAG, "memory allocation error");
        }
        if(httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
            char ident[3];
            char type[16];

            // Extract 'location' parameter
            if (httpd_query_key_value(buf, "identity", ident, sizeof(ident)) == ESP_OK) {
                int identNum = atoi(ident);

                if (identNum >= 1 && identNum < (CONFIG_SENSOR_TEMP+SQL_ID_SYNC_VAL)){
                    sensor = dht22_sensor_arr[identNum];
                    size_t log_buf_size = sizeof(log_str) - strlen(log_str) - 1;
                    snprintf(log_str + strlen(log_str), log_buf_size, "%d-", identNum);
                }else {
                    ESP_LOGE(HTTP_HANDLER_TAG, "Invalid location parameter");
                    httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Invalid Location Parameter");

                    free(buf);
                    return ESP_FAIL;
                }
            } else {
                ESP_LOGE(HTTP_HANDLER_TAG, "Location parameter not found");
                httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Parameters Not Found");

                free(buf);
                return ESP_FAIL;
            }

            // Extract 'type' parameter
            if (httpd_query_key_value(buf, "type", type, sizeof(type)) == ESP_OK) {
                if (strcmp(type, "temp") == 0){
                    sensor_choice = TEMP;
                    strncat(log_str, "TEMP", 5);
                }else if(strcmp(type, "humidity") == 0) {
                    sensor_choice = HUMIDITY;
                    strncat(log_str, "humidity", 9);
                } else {
                    ESP_LOGE(HTTP_HANDLER_TAG, "Invalid type parameter");
                    httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Invalid Type Parameters");

                    free(buf);
                    return ESP_FAIL;
                }
            } else {
                ESP_LOGE(HTTP_HANDLER_TAG, "Type parameter not found");
                httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "400 Bad Request - Parameters Not Found");

                free(buf);
                return ESP_FAIL;
            }
            strncat(log_str, " JSON requested", 16);
            ESP_LOGV(HTTP_HANDLER_TAG, "%s", log_str);
            dhtSensorJSON= get_DHT22_SENSOR_JSON_String(&sensor, sensor_choice);
            httpd_resp_set_type(req, "application/json");
            httpd_resp_send(req, dhtSensorJSON, strlen(dhtSensorJSON));
            ESP_LOGV(HTTP_HANDLER_TAG,"%s", dhtSensorJSON);
            free(dhtSensorJSON);
        }
        free(buf);
    } else {
        ESP_LOGE(HTTP_HANDLER_TAG, "Query string not found");
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    return ESP_OK;
}

esp_err_t get_module_info_json_handler(httpd_req_t *req){

    ESP_LOGI(HTTP_HANDLER_TAG, "moduleInfo.json requested");

      // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");


    const char *module_json_data = node_info_get_module_info_json();

    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, module_json_data);


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

esp_err_t get_wifi_connect_info_json_handler(httpd_req_t *req)
{
// Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");


    ESP_LOGI(HTTP_HANDLER_TAG, "wifiConnectInfo.json requested");

    char ipInfoJSON[200];
    memset(ipInfoJSON, 0, sizeof(ipInfoJSON));

    char ip[IP4ADDR_STRLEN_MAX];
    char netmask[IP4ADDR_STRLEN_MAX];
    char gw[IP4ADDR_STRLEN_MAX];

    wifi_ap_record_t wifi_data;
    ESP_ERROR_CHECK(esp_wifi_sta_get_ap_info(&wifi_data));
    char *ssid = (char*)wifi_data.ssid;

    esp_netif_ip_info_t ip_info;

    ESP_ERROR_CHECK(esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_STA_DEF"), &ip_info));
    esp_ip4addr_ntoa(&ip_info.ip, ip, IP4ADDR_STRLEN_MAX);
    esp_ip4addr_ntoa(&ip_info.netmask, netmask, IP4ADDR_STRLEN_MAX);
    esp_ip4addr_ntoa(&ip_info.gw, gw, IP4ADDR_STRLEN_MAX);

    sprintf(ipInfoJSON, "{\"ip\":\"%s\",\"netmask\":\"%s\",\"gw\":\"%s\",\"ap\":\"%s\"}", ip, netmask, gw, ssid);


    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, ipInfoJSON, strlen(ipInfoJSON));

    return ESP_OK;
}

esp_err_t preflight_handler(httpd_req_t *req) {
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    httpd_resp_send(req, NULL, 0); // 200 OK with no body
    return ESP_OK;
}
