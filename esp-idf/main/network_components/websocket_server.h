#ifndef WEBSOCKET_SERVER_H
#define WEBSOCKET_SERVER_H

#include "esp_http_server.h"

void generate_async_resp(void *arg);

// Asynchronous response data structure
struct async_resp_arg
{
    httpd_handle_t hd; // Server instance
    int fd;            // Session socket file descriptor
};
typedef enum websocket_server_message
{
    WEBSOCKET_MSG_WIFI_CONNECT_INIT = 0,
    WEBSOCKET_MSG_WIFI_CONNECT_SUCCESS,
    WEBSOCKET_MSG_WIFI_CONNECT_FAIL,
} websocket_server_message_e;

/**
 * Connection status for wifi
*/
typedef enum websocket_server_wifi_connect_status
{
    WEBSOCKET_NONE = 0,
    WEBSOCKET_WIFI_STATUS_CONNECT_FAILED,
    WEBSOCKET_WIFI_STATUS_CONNECT_SUCCESS,
    WEBSOCKET_WIFI_STATUS_CONNECTING,
} websocket_server_wifi_connect_status_e;

/**
 * Structure for the message queue
*/
typedef struct websocket_server_queue_message
{
    websocket_server_message_e msgID;
} websocket_server_queue_message_t;



void ws_async_send(void *arg);
esp_err_t trigger_async_send(httpd_handle_t handle, httpd_req_t *req);

void start_websockert_server(void);

esp_err_t ws_echo_handler(httpd_req_t *req);

esp_err_t ws_sensor_handler(httpd_req_t *req);

BaseType_t websocket_server_monitor_send_message(websocket_server_message_e msgID);

void websocket_server_stop(void);

void websocket_server_start(void);


httpd_handle_t websocket_server_configuration(void);

void websocket_server_monitor(void * xTASK_PARAMETERS);


esp_err_t register_websocket_server_handlers(void);
#endif /*WEBSOCKET_SERVER_H*/