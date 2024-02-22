

esp_err_t index_Cjz8_SRG_css_handler(httpd_req_t *req);

esp_err_t index_Brmxup6R_js_handler(httpd_req_t *req);

 esp_err_t plant3_svg_handler(httpd_req_t *req);

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
esp_err_t get_wifi_connect_info_json_handler(httpd_req_t *req);

/* Generic Preflight Request Handler */
esp_err_t preflight_handler(httpd_req_t *req);

/**
 * regester http serevr handler requests
*/
void register_http_server_handlers(void);
