
/**
 * jquery get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_jquery_handler(httpd_req_t *req);

/**
 * sends theindex.html page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_index_html_handler(httpd_req_t *req);

/**
 * app.js get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_app_js_handler(httpd_req_t *req);


/**
 * App.css get handler is requested when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_app_css_handler(httpd_req_t *req);

/**
 * sends the .ico (icon) file  when accessing the web page
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_favicon_ico_handler(httpd_req_t *req);

/**
 * Recieves the .bin file via the web page and handles the firmware update
 * @param req HTTP request for which the uri needs to be handles.
 * @return ESP_OK, otherwise ESP_FAIL if timeout occurs and the update cannot be started
*/
esp_err_t http_server_OTA_update_handler(httpd_req_t *req);

/**
 * OTA status handler responds with the firmware update status after the OTA update is started
 * and responds with the compile time/date when the page is first requested
 * @param req http request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_OTA_status_handler(httpd_req_t *req);


/**
 * DHT outside sensor readings JSON handler responds with DHT22 sensor data
 * @param req http request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_get_dht_sensor_readings_json_handler(httpd_req_t *req);


/**
 * returns nvs inforamtion for modules state for dynamic resource initialization
*/
esp_err_t http_server_get_module_info_json_handler(httpd_req_t *req);


/** Wifi connect.json is invoked after the connect button is pressed and
 * handles recieving the SSID and password entered by the user
 * @param req HTTP request for which the uri needs to handled
 * @return ESP_OK
*/
esp_err_t http_server_wifi_connect_json_handler(httpd_req_t *req);

/**
 *
 * wifiConnectHanedle updates the connection status for the
 * web page
*/
esp_err_t http_server_wifi_connect_status_json_handler(httpd_req_t *req);

/**
 * wifiDisconnect.json handler response by sending a message to the wifi app to disconnect.
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_wifi_disconnect_json_handler(httpd_req_t *req);

/**
 * wiwifConnectINfo.json handler updates the webpage with connection inforation.
 * @param req HTTP request for which the uri needs to be handled
 * @return ESP_OK
*/
esp_err_t http_server_get_wifi_connect_info_json_handler(httpd_req_t *req);

/* Generic Preflight Request Handler */
esp_err_t preflight_handler(httpd_req_t *req);

/**
 * regester http serevr handler requests
*/
void register_http_server_handlers(void);
