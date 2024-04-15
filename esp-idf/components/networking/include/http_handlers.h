#ifndef NETWORKING_HTTP_HANDLERS_H
#define NETWORKING_HTTP_HANDLERS_H

#include "esp_err.h"
#include "esp_http_server.h"

esp_err_t index_css_handler(httpd_req_t *req);

esp_err_t index_js_handler(httpd_req_t *req);

 esp_err_t list_svg_handler(httpd_req_t *req);

  esp_err_t favicon_png_handler(httpd_req_t *req);

/**
 * sends theindex.html page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t index_html_handler(httpd_req_t *req);


/**
 * DHT outside sensor readings JSON handler responds with DHT22 sensor data
 * @param req http request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t get_dht_sensor_readings_json_handler(httpd_req_t *req);

/**
 * returns nvs inforamtion for modules state for dynamic resource initialization
*/
esp_err_t get_module_info_json_handler(httpd_req_t *req);

/**
 *
 * wifiConnectHanedle updates the connection status for the
 * web page
*/
esp_err_t wifi_connect_status_json_handler(httpd_req_t *req);

/**
 * wiwifConnectINfo.json handler updates the webpage with connection inforation.
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t get_wifi_sta_connect_info_json_handler(httpd_req_t *req);

/* Generic Preflight Request Handler */
esp_err_t preflight_handler(httpd_req_t *req);

/**
 * regester http serevr handler requests
*/
void register_http_server_handlers(void);

esp_err_t async_get_handler(httpd_req_t *req);

esp_err_t ws_echo_handler(httpd_req_t *req);

esp_err_t ws_sensor_handler(httpd_req_t *req);

esp_err_t get_controller_sta_list_json_handler(httpd_req_t *req);

esp_err_t get_uptime_json_handler(httpd_req_t *req);

esp_err_t get_device_info_json_handler(httpd_req_t *req);

esp_err_t get_wifi_ap_connect_info_json_handler(httpd_req_t *req);

esp_err_t recv_ota_update_save_to_sd_post_handler(httpd_req_t *req);

esp_err_t ota_update_handler(httpd_req_t *req);

char* extract_boundary(const char* content_type);

#endif