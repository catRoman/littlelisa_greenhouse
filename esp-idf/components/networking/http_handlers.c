#include <stdlib.h>
#include <sys/param.h>

#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_http_server.h"
#include "esp_ota_ops.h"
#include "esp_log.h"
#include "sdkconfig.h"

//my components
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

#define SQL_ID_SYNC_VAL 1

TaskHandle_t myTaskHandle = NULL;


extern Module_info_t *module_info_gt;
extern int g_fw_update_status;
extern int g_wifi_connect_status;

extern httpd_handle_t http_server_handle;

//new landing page
//embed files: all files in new-landing page
extern const uint8_t index_html_start[]         asm("_binary_index_html_start");
extern const uint8_t index_html_end[]         asm("_binary_index_html_end");

extern const uint8_t favicon_png_start[]         asm("_binary_favicon_png_start");
extern const uint8_t favicon_png_end[]         asm("_binary_favicon_png_end");


extern const uint8_t index_js_start[]         asm("_binary_index_js_start");
extern const uint8_t index_js_end[]         asm("_binary_index_js_end");


extern const uint8_t index_css_start[]         asm("_binary_index_css_start");
extern const uint8_t index_css_end[]         asm("_binary_index_css_end");

extern const uint8_t list_svg_start[]         asm("_binary_list_svg_start");
extern const uint8_t list_svg_end[]         asm("_binary_list_svg_end");





static const char HTTP_HANDLER_TAG [] = "http_handlers";



void register_http_server_handlers(void)
{
    ESP_LOGI(HTTP_HANDLER_TAG, "http_server_configure: Registering URI handlers");

        /* Register a generic preflight handler */
            httpd_uri_t options_uri = {
                .uri       = "*",
                .method    = HTTP_OPTIONS,
                .handler   = preflight_handler,
                .user_ctx  = NULL
            };
            httpd_register_uri_handler(http_server_handle, &options_uri);

        //=====================
        // littleLisa Debug content service
        //=====================

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
            .uri = "/index.css",
            .method = HTTP_GET,
            .handler = index_css_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_css);

        //register js handler
        httpd_uri_t index_js = {
            .uri = "/index.js",
            .method = HTTP_GET,
            .handler = index_js_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &index_js);

        //register icon handler
        httpd_uri_t favicon_png = {
            .uri = "/favicon.png",
            .method = HTTP_GET,
            .handler = favicon_png_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &favicon_png);

           //register icon handler
        httpd_uri_t list_svg = {
            .uri = "/icons/list.svg",
            .method = HTTP_GET,
            .handler = list_svg_handler,
            .user_ctx = NULL,
        };
        httpd_register_uri_handler(http_server_handle, &list_svg);

        //end of littlelisa content service

        //==========================
        // littleLisa API
        //=========================


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

        //register wifiStaConnectInfo.json handler
        httpd_uri_t wifi_sta_connect_info_json = {
            .uri = "/api/wifiStaConnectInfo.json",
            .method = HTTP_GET,
            .handler = get_wifi_sta_connect_info_json_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &wifi_sta_connect_info_json);

 //register wifiApConnectInfo.json handler
        httpd_uri_t wifi_ap_connect_info_json = {
            .uri = "/api/wifiApConnectInfo.json",
            .method = HTTP_GET,
            .handler = get_wifi_ap_connect_info_json_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(http_server_handle, &wifi_ap_connect_info_json);


        //register moduleInfo.json handler
            httpd_uri_t module_info_json = {
                .uri = "/api/moduleInfo.json",
                .method = HTTP_GET,
                .handler = get_module_info_json_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &module_info_json);

          //register controllerStaList.json handler
            httpd_uri_t controller_sta_list_json = {
                .uri = "/api/controllerStaList.json",
                .method = HTTP_GET,
                .handler = get_controller_sta_list_json_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &controller_sta_list_json);

     //register uptimeFunk.json handler
            httpd_uri_t uptimeFunk_json = {
                .uri = "/api/uptimeFunk.json",
                .method = HTTP_GET,
                .handler = get_uptime_json_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &uptimeFunk_json);

            //register deviceInfo.json handler
            httpd_uri_t device_info_json = {
                .uri = "/api/deviceInfo.json",
                .method = HTTP_GET,
                .handler = get_device_info_json_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &device_info_json);

    //OTA-handlers

              //register upload handler
            httpd_uri_t upload_ota_sd = {
                .uri = "/ota/upload",
                .method = HTTP_POST,
                .handler = recv_ota_update_save_to_sd_post_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &upload_ota_sd);


              //register upload handler
            httpd_uri_t preform_ota = {
                .uri = "/ota/update",
                .method = HTTP_POST,
                .handler = ota_update_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &preform_ota);

                    //register propgate update handler
            httpd_uri_t propagate_ota_update = {
                .uri = "/ota/update_prop",
                .method = HTTP_POST,
                .handler = propogate_ota_update_handler,
                .user_ctx = NULL
            };
            httpd_register_uri_handler(http_server_handle, &propagate_ota_update);





}
//static debug landing page content serve

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



//api
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

esp_err_t get_module_info_json_handler(httpd_req_t *req){

    ESP_LOGD(HTTP_HANDLER_TAG, "moduleInfo.json requested");

      // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");


    char *module_json_data = node_info_get_module_info_json();

    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, module_json_data);
    free(module_json_data);


    return ESP_OK;
}

esp_err_t get_controller_sta_list_json_handler(httpd_req_t *req){

    ESP_LOGD(HTTP_HANDLER_TAG, "controllerStaList.json requested");

      // Add CORS headers to the response
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");




    wifi_mode_t mode;
    esp_wifi_get_mode(&mode);

    if(mode == WIFI_MODE_APSTA || mode == WIFI_MODE_AP){
        char *controller_sta_list = node_info_get_controller_sta_list_json();
        httpd_resp_set_type(req, "application/json");
        httpd_resp_sendstr(req, controller_sta_list);

        free(controller_sta_list);
    }else{
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









esp_err_t preflight_handler(httpd_req_t *req) {
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    httpd_resp_send(req, NULL, 0); // 200 OK with no body
    return ESP_OK;
}



esp_err_t recv_ota_update_save_to_sd_post_handler(httpd_req_t *req) {

//    spi_sd_card_test();
    if(recv_ota_update_write_to_sd(req) == ESP_OK){
         httpd_resp_sendstr(req, "File uploaded successfully");
    }else{
         httpd_resp_sendstr(req, "Error: File uploaded unsuccessfully");

    }

    return ESP_OK;
}


esp_err_t ota_update_handler(httpd_req_t *req) {





    char ota_buff[1024];  // Buffer size adjusted for chunk size
    int recv_len;
    bool is_req_body_started = false;

    esp_ota_handle_t ota_handle;

    const esp_partition_t *ota_partition = esp_ota_get_next_update_partition(NULL);

    // Initialize OTA update on this partition
    esp_err_t err = esp_ota_begin(ota_partition, OTA_SIZE_UNKNOWN, &ota_handle);
    if (err != ESP_OK) {
        ESP_LOGE("OTA_UPDATE", "esp_ota_begin failed, error=%d", err);
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA begin failed");
        return ESP_FAIL;
    }

    ESP_LOGI("OTA_UPDATE", "Starting OTA...");
    int remaining = req->content_len;

    while ((recv_len = httpd_req_recv(req, ota_buff, sizeof(ota_buff))) > 0) {
        ESP_LOGI("OTA_UPDATE", "data remaining-> %d", remaining);

        if (!is_req_body_started) {
            is_req_body_started = true;
            ESP_LOGI("OTA_UPDATE", "Receiving OTA data...");
        }

        // Write received data to the OTA partition
        if (esp_ota_write(ota_handle, (const void *)ota_buff, recv_len) != ESP_OK) {
        ESP_LOG_BUFFER_HEX("OTA Data", ota_buff, recv_len);
            ESP_LOGE("OTA_UPDATE", "OTA write failed");
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA write failed");
            esp_ota_abort(ota_handle);
            return ESP_FAIL;
        }
        remaining -= recv_len;
    }

    if (recv_len < 0) {
        ESP_LOGE("OTA_UPDATE", "Receive error %d", recv_len);
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Error receiving data");
        esp_ota_abort(ota_handle);
        return ESP_FAIL;
    }

    // Complete the OTA update
    if (esp_ota_end(ota_handle) != ESP_OK) {
        ESP_LOGE("OTA_UPDATE", "OTA end failed");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA end failed");
        return ESP_FAIL;
    }

    // Set the new OTA partition as the boot partition
    if (esp_ota_set_boot_partition(ota_partition) != ESP_OK) {
        ESP_LOGE("OTA_UPDATE", "OTA set boot partition failed");
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "OTA set boot partition failed");
        return ESP_FAIL;
    }

    ESP_LOGI("OTA_UPDATE", "OTA Update Successful. Rebooting...");
    httpd_resp_send(req, "OTA Update Successful. Rebooting in 5 seconds...", HTTPD_RESP_USE_STRLEN);
    vTaskDelay(pdMS_TO_TICKS(5000));
    esp_restart();  // Restart the system to boot from the updated firmware

    return ESP_OK;
}

esp_err_t propogate_ota_update_handler(httpd_req_t *req){
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type, X-Requested-With");


    // //download to sd
    if(recv_ota_update_write_to_sd(req) == ESP_OK){

        httpd_resp_send(req, "OTA update recieved successful. Preforming update to all nodes and controller...", HTTPD_RESP_USE_STRLEN);
    }else{
        httpd_resp_send(req, "Could not download ota update in full, cancelling update",HTTPD_RESP_USE_STRLEN);
        return ESP_FAIL;
    }



    // Loop over each connected station
printf("Free heap size: %lu bytes\n", esp_get_free_heap_size());
BaseType_t taskCreated;
taskCreated = xTaskCreatePinnedToCore(
        node_ota_update_send,
        "node_ota_update_send",
        8000,
        NULL,
        7,
       &myTaskHandle,
        1);
// taskCreated = xTaskCreatePinnedToCore(
//         http_test_task,
//         "test_send",
//         8000,
//         NULL,
//         7,
//        &myTaskHandle,
//         1);

if (taskCreated != pdPASS) {
    printf("Task creation failed!\n");
}


    return ESP_OK;
}

esp_err_t recv_ota_update_write_to_sd(httpd_req_t *req) {

//    spi_sd_card_test();


    const char *file_path = MOUNT_POINT"/ota.bin";


    ESP_LOGI(HTTP_HANDLER_TAG, "{==POST WRITE==} Opening file %s", file_path);
    FILE* fd = fopen(file_path, "w");


    if (fd == NULL) {
        ESP_LOGE("FILE", "Failed to open file for writing");
        return ESP_FAIL;
    }

    // Read the content posted by the browser
    char buf[1024];
    int received;

    // Content length
    int remaining = req->content_len;
    ESP_LOGI(HTTP_HANDLER_TAG, "initial content length -> %d", remaining);
    while (remaining > 0) {
        // Calculate how much data to read
        int to_read = sizeof(buf);
        if (to_read > remaining) {
            to_read = remaining;
        }

        // Read data and write it to the file
        received = httpd_req_recv(req, buf, to_read);
        if (received <= 0) {
            fclose(fd);
            if (received == HTTPD_SOCK_ERR_TIMEOUT) {
                ESP_LOGE(HTTP_HANDLER_TAG, "Socket Timeout");
                return ESP_FAIL;
            }
            ESP_LOGE(HTTP_HANDLER_TAG, "Error in receiving file");
            return ESP_FAIL;
        }

        // Write the received data to the file
        fwrite(buf, 1, received, fd);
        remaining -= received;
        ESP_LOGI(HTTP_HANDLER_TAG, "content remaining-> %d", remaining);
    }
    ESP_LOGI(HTTP_HANDLER_TAG, "recieving finished closing file");
    fclose(fd);

 ESP_LOGI(HTTP_HANDLER_TAG, "File download succesfully to sd card--> 'ota.bin'");

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

void node_ota_update_send(void *vpParam){
    wifi_sta_list_t sta_list;

    // Get the list of connected stations
    ESP_ERROR_CHECK(esp_wifi_ap_get_sta_list(&sta_list));
 for(;;){
    ESP_LOGI(HTTP_HANDLER_TAG, "INSIDE TASK");

   for (int i = 1; i <= sta_list.num; i++) {
        char node_addr[100];
        snprintf(node_addr, sizeof(node_addr)-1, "http://192.168.0.%d/ota/update",
              i+1);

        ESP_LOGI("OTA_PROP_UPDATE", "node %d: %s being sent update", i, node_addr);
        post_file_in_chunks(node_addr, OTA_FILENAME);

    }

ota_update_from_sd();

    vTaskDelete(NULL);
 }
}
