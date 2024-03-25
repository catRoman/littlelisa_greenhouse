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
    WEBSOCKET_CONNECT_INIT = 0,
    WEBSOCKET_CONNECT_SUCCESS,
    WEBSOCKET_CONNECT_FAIL,
} websocket_server_message_e;

typedef struct frame_data_t {
    httpd_ws_frame_t *ws_pkt;
}websocket_frame_data_t;

/**
 * Structure for the message queue
*/
typedef struct websocket_server_queue_message
{
    int socket_id;
    websocket_server_message_e msgID;
} websocket_server_queue_message_t;



void ws_async_send(void *arg);
esp_err_t trigger_async_send(httpd_handle_t handle, httpd_req_t *req);

void start_websockert_server(void);

esp_err_t ws_echo_handler(httpd_req_t *req);

esp_err_t ws_sensor_handler(httpd_req_t *req);

BaseType_t websocket_server_monitor_send_message(websocket_server_message_e msgID, int socket);

void websocket_server_stop(void);

void websocket_server_start(void);


httpd_handle_t websocket_server_configuration(void);

void websocket_server_monitor(void * xTASK_PARAMETERS);
void websocket_print_client_sockets(void);
void websocket_send_data_queue(void *vpParameter);
esp_err_t register_websocket_server_handlers(void);

void test_frame_change_task(void *vpParameters);
#endif /*WEBSOCKET_SERVER_H*/