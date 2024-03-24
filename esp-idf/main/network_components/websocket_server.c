// Websocket Server responsive to GET request

#include <stdio.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "sys/param.h"
#include "esp_timer.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/event_groups.h"
#include "esp_http_server.h"

#include "network_components/websocket_server.h"
#include "task_common.h"
#include "network_components/wifi_ap_sta.h"
#include "helper.h"

#define MAX_CLIENTS = 20;

//websocket connect status


static int num_websocket_clients = 0;

static List *websocket_clients;



static const char WEBSOCKET_SERVER_TAG[] = "WEBSOCKET_server";
httpd_handle_t websocket_server_handle = NULL;
static TaskHandle_t task_websocket_server_monitor = NULL;
static QueueHandle_t websocket_server_monitor_queue_handle;

void websocket_server_monitor(void * xTASK_PARAMETERS)
{



    websocket_server_queue_message_t msg;
    for(;;)
    {
        if (xQueueReceive(websocket_server_monitor_queue_handle, &msg, portMAX_DELAY))
        {
            switch(msg.msgID)
            {
                case WEBSOCKET_CONNECT_INIT:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_CONNECT_INIT");



                    break;

                case WEBSOCKET_CONNECT_SUCCESS:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_SUCCESS");

                    list_append(websocket_clients, msg.socket_id);
                    num_websocket_clients++;
                    break;

                case WEBSOCKET_CONNECT_FAIL:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_CONNECT_FAIL");

                    int index = list_search(websocket_clients, msg.socket_id);
                    list_remove(websocket_clients, index);
                    num_websocket_clients--;
                    break;

                default:
                    break;
            }
        }
    }
}




httpd_handle_t websocket_server_configuration(void)
{

    //socket list
    websocket_clients = list_create();
    // Generate the default configuration
    httpd_config_t ws_config = HTTPD_DEFAULT_CONFIG();

    // create the message queue
    websocket_server_monitor_queue_handle = xQueueCreate(3, sizeof(websocket_server_queue_message_t));

    vTaskDelay(pdMS_TO_TICKS(100));

    // create websocket server monitor task
    xTaskCreatePinnedToCore(&websocket_server_monitor, "websocket_server_monitor",
        WEBSOCKET_SERVER_MONITOR_STACK_SIZE, NULL, WEBSOCKET_SERVER_MONITOR_PRIORITY, &task_websocket_server_monitor, WEBSOCKET_SERVER_MONITOR_CORE_ID);

    // websocket server config
    ws_config.core_id = WEBSOCKET_SERVER_TASK_CORE_ID;
    ws_config.task_priority = WEBSOCKET_SERVER_TASK_PRIORITY;
    ws_config.stack_size = WEBSOCKET_SERVER_TASK_STACK_SIZE;
    ws_config.server_port = 8080;
    ws_config.ctrl_port = 32769;
    ws_config.max_uri_handlers = 20;
    ws_config.recv_wait_timeout = 10;
    ws_config.send_wait_timeout = 10;

    ESP_LOGI(WEBSOCKET_SERVER_TAG, "http_server_configure: Starting server on port '%d'",
            ws_config.server_port);

    // start the httpd server
    if(httpd_start(&websocket_server_handle, &ws_config)== ESP_OK)
    {
        register_websocket_server_handlers();
        return websocket_server_handle;
    }

    return NULL;
}

void websocket_server_start(void)
{
    if (websocket_server_handle == NULL)
    {
        websocket_server_handle = websocket_server_configuration();
    };
}

void websocket_server_stop(void)
{
    if(websocket_server_handle)
    {
        httpd_stop(websocket_server_handle);
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "websocket_server_stop: stopping websocket server");
        websocket_server_handle = NULL;
    }
    if (task_websocket_server_monitor)
    {
        vTaskDelete(task_websocket_server_monitor);
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "websocket_server_stop: stopping http server monitor");
        task_websocket_server_monitor = NULL;
    }
}

BaseType_t websocket_server_monitor_send_message(websocket_server_message_e msgID, int socket)
{
    websocket_server_queue_message_t msg;
    msg.msgID = msgID;
    msg.socket_id = socket;
    //vTaskDelay(5000 / portTICK_PERIOD_MS);
    return xQueueSend(websocket_server_monitor_queue_handle, &msg, portMAX_DELAY);
}



// The asynchronous response
void generate_async_resp(void *arg)
{
    // Data format to be sent from the server as a response to the client
    char http_string[250];
    char *data_string = "Hello from ESP32 websocket server ...";
    sprintf(http_string, "HTTP/1.1 200 OK\r\nContent-Length: %d\r\n\r\n", strlen(data_string));

    // Initialize asynchronous response data structure
    struct async_resp_arg *resp_arg = (struct async_resp_arg *)arg;
    httpd_handle_t hd = resp_arg->hd;
    int fd = resp_arg->fd;

    // Send data to the client
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "Executing queued work fd : %d", fd);
    httpd_socket_send(hd, fd, http_string, strlen(http_string), 0);
    httpd_socket_send(hd, fd, data_string, strlen(data_string), 0);

    free(arg);
}

/*
 * async send function, which we put into the httpd work queue
 */
void ws_async_send(void *arg)
{
    static const char * data = "Async data";
    struct async_resp_arg *resp_arg = arg;
    httpd_handle_t hd = resp_arg->hd;
    int fd = resp_arg->fd;
    httpd_ws_frame_t ws_pkt;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.payload = (uint8_t*)data;
    ws_pkt.len = strlen(data);
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;

    httpd_ws_send_frame_async(hd, fd, &ws_pkt);
    free(resp_arg);
}

esp_err_t trigger_async_send(httpd_handle_t handle, httpd_req_t *req)
{
    struct async_resp_arg *resp_arg = malloc(sizeof(struct async_resp_arg));
    if (resp_arg == NULL) {
        return ESP_ERR_NO_MEM;
    }
    resp_arg->hd = req->handle;
    resp_arg->fd = httpd_req_to_sockfd(req);
    esp_err_t ret = httpd_queue_work(handle, ws_async_send, resp_arg);
    if (ret != ESP_OK) {
        free(resp_arg);
    }
    return ret;
}


esp_err_t ws_echo_handler(httpd_req_t *req)
{
    if (req->method == HTTP_GET) {
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Handshake done, the new echo websocket connection was opened on socket %d", httpd_req_to_sockfd(req));
        return ESP_OK;
    }
    httpd_ws_frame_t ws_pkt;
    uint8_t *buf = NULL;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;
    /* Set max_len = 0 to get the frame len */
    esp_err_t ret = httpd_ws_recv_frame(req, &ws_pkt, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_recv_frame failed to get frame len with %d", ret);
        return ret;
    }
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "frame len is %d", ws_pkt.len);
    if (ws_pkt.len) {
        /* ws_pkt.len + 1 is for NULL termination as we are expecting a string */
        buf = calloc(1, ws_pkt.len + 1);
        if (buf == NULL) {
            ESP_LOGE(WEBSOCKET_SERVER_TAG, "Failed to calloc memory for buf");
            return ESP_ERR_NO_MEM;
        }
        ws_pkt.payload = buf;
        /* Set max_len = ws_pkt.len to get the frame payload */
        ret = httpd_ws_recv_frame(req, &ws_pkt, ws_pkt.len);
        if (ret != ESP_OK) {
            ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_recv_frame failed with %d", ret);
            free(buf);
            return ret;
        }
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Got packet with message: %s", ws_pkt.payload);
    }
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "Packet type: %d", ws_pkt.type);
    if (ws_pkt.type == HTTPD_WS_TYPE_TEXT &&
        strcmp((char*)ws_pkt.payload,"Trigger async") == 0) {
        free(buf);
        return trigger_async_send(req->handle, req);
    }

    ret = httpd_ws_send_frame(req, &ws_pkt);
    if (ret != ESP_OK) {
        ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_send_frame failed with %d", ret);
    }
    free(buf);
    return ret;
}


esp_err_t ws_sensor_handler(httpd_req_t *req)
{

    websocket_server_monitor_send_message(WEBSOCKET_CONNECT_INIT, -1);

    if (req->method == HTTP_GET) {
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Handshake done, the new sensor websocket connection was opened on secket %d",httpd_req_to_sockfd(req) );
        websocket_server_monitor_send_message(WEBSOCKET_CONNECT_SUCCESS, httpd_req_to_sockfd(req));

    }
    httpd_ws_frame_t ws_pkt;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;




   char * buff = "initial connection test";

   ws_pkt.final = true;
   ws_pkt.fragmented = false;
   ws_pkt.payload = (uint8_t*)buff;
   ws_pkt.len = strlen(buff) + 1;

    esp_err_t ret;

    
        for(int j = 0; j < num_websocket_clients; j++){
        ret = httpd_ws_send_frame_async(req->handle, websocket_clients->items[j], &ws_pkt);
        // ret  = httpd_ws_send_frame(req, &ws_pkt);
        // ret = httpd_ws_send_data(websocket_server_handle, httpd_req_to_sockfd(req), &ws_pkt);
            if (ret != ESP_OK) {
                ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_send_frame failed with %d", ret);
                websocket_server_monitor_send_message(WEBSOCKET_CONNECT_FAIL,httpd_req_to_sockfd(req));
            }else{
                ESP_LOGI(WEBSOCKET_SERVER_TAG, "packet sent to sockt %d",httpd_req_to_sockfd(req));

            }
            return ret;
        }
    return ESP_OK;

    
}


esp_err_t register_websocket_server_handlers(void)
{
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "websocket_server_configure: Registering URI handlers");

    static const httpd_uri_t ws_echo = {
            .uri        = "/ws/echo",
            .method     = HTTP_GET,
            .handler    = ws_echo_handler,
            .user_ctx   = NULL,
            .is_websocket = true
    };
    httpd_register_uri_handler(websocket_server_handle, &ws_echo);

    static const httpd_uri_t ws_sensor = {
        .uri        = "/ws/sensor",
        .method     = HTTP_GET,
        .handler    = ws_sensor_handler,
        .user_ctx   = NULL,
        .is_websocket = true
    };
    httpd_register_uri_handler(websocket_server_handle, &ws_sensor);

    return ESP_OK;
}