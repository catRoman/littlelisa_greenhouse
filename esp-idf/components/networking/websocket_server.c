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

//components
#include "websocket_server.h"
#include "task_common.h"
#include "wifi_ap_sta.h"
#include "helper.h"

#define MAX_CLIENTS 20

//websocket connect status


static int num_websocket_sensor_clients = 0;
static int num_websocket_log_clients = 0;

static List *websocket_sensor_clients;
static List *websocket_log_clients;



static const char WEBSOCKET_SERVER_TAG[] = "WEBSOCKET_SERVER";
httpd_handle_t websocket_server_handle = NULL;
static TaskHandle_t task_websocket_server_monitor = NULL;
static QueueHandle_t websocket_server_monitor_queue_handle;

QueueHandle_t websocket_send_sensor_data_queue_handle;
TaskHandle_t websocket_send_sensor_data_task_handle = NULL;

QueueHandle_t websocket_send_log_data_queue_handle;
TaskHandle_t websocket_send_log_data_task_handle = NULL;

TaskHandle_t test_frame_change_task_handle = NULL;








//===============================================================================================
//===============================================================================================
//======================================ESP_LOG DATA WEBSOCKET===============================
//===============================================================================================
//===============================================================================================
//===============================================================================================



// Structure to hold websocket context
typedef struct {
    httpd_handle_t handle;
    int sockfd;
    int is_logging_to_websocket; // Flag to check where to log
} websocket_log_ctx_t;

// Global instance of websocket context
websocket_log_ctx_t g_websocket_ctx = {0};

// Custom log handler that can redirect logs to websocket
int websocket_log_handler(const char* fmt, va_list args) {
    char log_buffer[512];
    vsnprintf(log_buffer, sizeof(log_buffer), fmt, args);

    // Check if the logging to websocket is enabled
    if (g_websocket_ctx.is_logging_to_websocket && g_websocket_ctx.handle) {
        // Send log over websocket with pause

        trigger_async_log_send(g_websocket_ctx.handle, g_websocket_ctx.sockfd, log_buffer);
    }
    vprintf(fmt, args);
    return 0;
}

// Utility function to start logging over websocket
void start_logging_to_websocket(httpd_handle_t handle, int sockfd) {
    g_websocket_ctx.handle = handle;
    g_websocket_ctx.sockfd = sockfd;
    g_websocket_ctx.is_logging_to_websocket = 1;
    esp_log_set_vprintf(websocket_log_handler);
}

// Utility function to stop logging over websocket
void stop_logging_to_websocket() {
    g_websocket_ctx.is_logging_to_websocket = 0;
    // Reset to default logger if needed
    esp_log_set_vprintf(vprintf);
}

void ws_async_log_send(void *arg) {
    struct async_resp_arg *resp_arg = (struct async_resp_arg *)arg;
    httpd_handle_t hd = resp_arg->hd;
    int fd = resp_arg->fd;
    const char *data = resp_arg->message;  // Use the passed message

    httpd_ws_frame_t ws_pkt;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.payload = (uint8_t*)data;
    ws_pkt.len = strlen(data);
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;

    httpd_ws_send_frame_async(hd, fd, &ws_pkt);

    free(resp_arg->message);  // Free the dynamically allocated message
    free(resp_arg);
    resp_arg = NULL;
}

esp_err_t trigger_async_log_send(httpd_handle_t handle, int sockfd, const char *message) {
    struct async_resp_arg *resp_arg = malloc(sizeof(struct async_resp_arg));
    if (!resp_arg) {
        return ESP_ERR_NO_MEM;
    }
    resp_arg->hd = handle;
    resp_arg->fd = sockfd;
    resp_arg->message = strdup(message);
    if (!resp_arg->message) {
        free(resp_arg);
        return ESP_ERR_NO_MEM;
    }

    esp_err_t ret = httpd_queue_work(handle, ws_async_log_send, resp_arg);
    if (ret != ESP_OK) {
        free(resp_arg->message);
        free(resp_arg);
    }
    return ret;
}

esp_err_t ws_log_handler(httpd_req_t *req)
{
    if (req->method == HTTP_GET) {
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Handshake done, the log data websocket connection was opened on socket %d", httpd_req_to_sockfd(req));



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

 if (ws_pkt.type == HTTPD_WS_TYPE_CLOSE || ws_pkt.len == 0) {
        ESP_LOGI("WEBSOCKET", "Received close frame.");
        // Optionally send a close frame back
        httpd_ws_frame_t close_pkt = {
            .type = HTTPD_WS_TYPE_CLOSE,
            .payload = NULL,
            .len = 0
        };
        httpd_ws_send_frame(req, &close_pkt);
        // Perform any additional cleanup needed
        return ESP_OK;
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
   if (ws_pkt.type == HTTPD_WS_TYPE_TEXT && strcmp((char*)ws_pkt.payload, "start log") == 0) {
    free(buf);
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "Log output set to listen for websocket handle...");
    start_logging_to_websocket(req->handle, httpd_req_to_sockfd(req));
    return ESP_OK;
} else if (ws_pkt.type == HTTPD_WS_TYPE_TEXT && strcmp((char*)ws_pkt.payload, "stop log") == 0) {
    free(buf);
    stop_logging_to_websocket();
    return ESP_OK;
}
    free(buf);
    return ret;

}

//===============================================================================================
//===============================================================================================
//===============================================================================================
//===============================================================================================
//===============================================================================================
//===============================================================================================
//===============================================================================================






void websocket_server_monitor(void * xTASK_PARAMETERS)
{
    websocket_server_queue_message_t msg;
    for(;;)
    {
        if (xQueueReceive(websocket_server_monitor_queue_handle, &msg, portMAX_DELAY))
        {
            switch(msg.msgID)
            {
                case WEBSOCKET_SENSOR_CONNECT_INIT:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_SENSOR_CONNECT_INIT");

                    break;

                case WEBSOCKET_SENSOR_CONNECT_SUCCESS:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_SENSOR_SUCCESS");

                    list_append(websocket_sensor_clients, msg.socket_id);
                    num_websocket_sensor_clients++;
                    break;

                case WEBSOCKET_SENSOR_CONNECT_FAIL:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_SENSOR_CONNECT_FAIL: socket %d disconnected", msg.socket_id);

                    int sensor_index = list_search(websocket_sensor_clients, msg.socket_id);
                    list_remove(websocket_sensor_clients, sensor_index);
                    num_websocket_sensor_clients--;
                    break;

                 case WEBSOCKET_LOG_CONNECT_INIT:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_LOG_CONNECT_INIT");

                    break;

                case WEBSOCKET_LOG_CONNECT_SUCCESS:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_LOG_SUCCESS");

                    list_append(websocket_log_clients, msg.socket_id);
                    num_websocket_log_clients++;
                    //esp_log_set_vprintf(esp_log_handler);
                    break;

                case WEBSOCKET_LOG_CONNECT_FAIL:
                    ESP_LOGI(WEBSOCKET_SERVER_TAG, "WEBSOCKET_LOG_CONNECT_FAIL: socket %d disconnected", msg.socket_id);

                    int log_index = list_search(websocket_log_clients, msg.socket_id);
                    list_remove(websocket_log_clients, log_index);
                    num_websocket_log_clients--;
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
    websocket_sensor_clients = list_create();
    websocket_log_clients = list_create();
    // Generate the default configuration
    httpd_config_t ws_config = HTTPD_DEFAULT_CONFIG();

    // create the message queue
    websocket_server_monitor_queue_handle = xQueueCreate(3, sizeof(websocket_server_queue_message_t));

    //send sensor data queue
    websocket_send_sensor_data_queue_handle = xQueueCreate(MAX_CLIENTS, sizeof(websocket_frame_data_t));


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

        xTaskCreatePinnedToCore(
            websocket_send_sensor_data_queue,
            "ws_sensor_queue",
            WEBSOCKET_SEND_SENSOR_DATA_STACK_SIZE,
            NULL,
            WEBSOCKET_SEND_SENSOR_DATA_PRIORITY,
            &websocket_send_sensor_data_task_handle,
            WEBSOCKET_SEND_SENSOR_DATA_CORE_ID );

       // xTaskCreatePinnedToCore(test_frame_change_task, "test_frame_change", 4096, NULL, 5, &test_frame_change_task_handle, 1);
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
    resp_arg=NULL;
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
        resp_arg=NULL;
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
            buf=NULL;
            return ret;
        }
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Got packet with message: %s", ws_pkt.payload);
    }
    ESP_LOGI(WEBSOCKET_SERVER_TAG, "Packet type: %d", ws_pkt.type);
    if (ws_pkt.type == HTTPD_WS_TYPE_TEXT &&
        strcmp((char*)ws_pkt.payload,"trigger async") == 0) {
        free(buf);
        buf=NULL;
        return trigger_async_send(req->handle, req);
    }
      ret = httpd_ws_send_frame(req, &ws_pkt);
    if (ret != ESP_OK) {
        ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_send_frame for echo ws failed with %d", ret);
    }


    free(buf);
    buf=NULL;
    return ret;
}


esp_err_t ws_sensor_handler(httpd_req_t *req)
{

    websocket_server_monitor_send_message(WEBSOCKET_SENSOR_CONNECT_INIT, -1);

    if (req->method == HTTP_GET) {
        ESP_LOGI(WEBSOCKET_SERVER_TAG, "Handshake done, the new sensor websocket connection was opened on secket %d",httpd_req_to_sockfd(req) );
        websocket_server_monitor_send_message(WEBSOCKET_SENSOR_CONNECT_SUCCESS, httpd_req_to_sockfd(req));
        return ESP_OK;
    }

//   httpd_ws_frame_t ws_pkt;
//     uint8_t *buf = NULL;
//     memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
//     ws_pkt.type = HTTPD_WS_TYPE_TEXT;
//     /* Set max_len = 0 to get the frame len */
//     esp_err_t ret = httpd_ws_recv_frame(req, &ws_pkt, 0);
//     if (ret != ESP_OK) {
//         ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_recv_frame failed to get frame len with %d", ret);
//         return ret;
//     }

//  if (ws_pkt.type == HTTPD_WS_TYPE_CLOSE || ws_pkt.len == 0) {
//         ESP_LOGI("WEBSOCKET", "Received close frame.");
//         // Optionally send a close frame back
//         httpd_ws_frame_t close_pkt = {
//             .type = HTTPD_WS_TYPE_CLOSE,
//             .payload = NULL,
//             .len = 0
//         };
//         httpd_ws_send_frame(req, &close_pkt);
//         // Perform any additional cleanup needed
//         return ESP_OK;
//     }



//     ESP_LOGI(WEBSOCKET_SERVER_TAG, "frame len is %d", ws_pkt.len);
//     if (ws_pkt.len) {
//         /* ws_pkt.len + 1 is for NULL termination as we are expecting a string */
//         buf = calloc(1, ws_pkt.len + 1);
//         if (buf == NULL) {
//             ESP_LOGE(WEBSOCKET_SERVER_TAG, "Failed to calloc memory for buf");
//             return ESP_ERR_NO_MEM;
//         }
//         ws_pkt.payload = buf;
//         /* Set max_len = ws_pkt.len to get the frame payload */
//         ret = httpd_ws_recv_frame(req, &ws_pkt, ws_pkt.len);
//         if (ret != ESP_OK) {
//             ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_recv_frame failed with %d", ret);
//             free(buf);
//             return ret;
//         }
//         ESP_LOGI(WEBSOCKET_SERVER_TAG, "Got packet with message: %s", ws_pkt.payload);
//     }
//     ESP_LOGI(WEBSOCKET_SERVER_TAG, "Packet type: %d", ws_pkt.type);


//  free(buf);
//    return ret;
return ESP_FAIL;

}


void websocket_send_sensor_data_queue(void *vpParameter){

    websocket_frame_data_t ws_frame_data;

    for(;;){
        if(xQueueReceive(websocket_send_sensor_data_queue_handle, &ws_frame_data, portMAX_DELAY)){
            for(int j = 0; j < num_websocket_sensor_clients; j++){
                ESP_LOGD(WEBSOCKET_SERVER_TAG, "sending sensor data to socket %d/%d -> socket # %d", (j+1),num_websocket_sensor_clients, websocket_sensor_clients->items[j] );

            esp_err_t ret = httpd_ws_send_frame_async(websocket_server_handle, websocket_sensor_clients->items[j], ws_frame_data.ws_pkt);

            // ret  = httpd_ws_send_frame(req, &ws_pkt);
            // ret = httpd_ws_send_data(websocket_server_handle, httpd_req_to_sockfd(req), &ws_pkt);
                if (ret != ESP_OK) {
                    ESP_LOGE(WEBSOCKET_SERVER_TAG, "httpd_ws_send_frame for sensor ws failed with %d", ret);
                    websocket_server_monitor_send_message(WEBSOCKET_SENSOR_CONNECT_FAIL,websocket_sensor_clients->items[j]);

                }else{
                    ESP_LOGD(WEBSOCKET_SERVER_TAG, "packet sent to sockt %d",websocket_sensor_clients->items[j]);
                }
            }
            free(ws_frame_data.ws_pkt->payload);
           //free frame payload json data?
        }
        taskYIELD();
    }

}

void websocket_print_client_sockets(int num_ws_clients, List *ws_clients){
    for(int i = 0; i < num_ws_clients; i++){
        printf("socket %d: %d", i, ws_clients->items[i]);
    }
    printf("\n");

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


    static const httpd_uri_t ws_log = {
            .uri        = "/ws/log",
            .method     = HTTP_GET,
            .handler    = ws_log_handler,
            .user_ctx   = NULL,
            .is_websocket = true
    };
    httpd_register_uri_handler(websocket_server_handle, &ws_log);

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