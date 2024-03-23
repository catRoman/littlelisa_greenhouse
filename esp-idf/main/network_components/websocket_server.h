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


void ws_async_send(void *arg);
esp_err_t trigger_async_send(httpd_handle_t handle, httpd_req_t *req);

#endif /*WEBSOCKET_SERVER_H*/