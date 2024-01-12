/**
 * @file		http_server.h
 * @brief		prototypes for http server.c
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 * 
 */

#ifndef MAIN_HTTP_SERVER_H_
#define MAIN_HTTP_SERVER_H_

#include "freertos/FreeRTOS.h"

#define OTA_UPDATE_PENDING          0
#define OTA_UPDATE_SUCCESSFUL       1
#define OTA_UPDATE_FAILED           -1
/**
 * Messages for the HTTP Monitor
 *
 */
typedef enum http_server_message
{
    HTTP_MSG_WIFI_CONNECT_INIT = 0,
    HTTP_MSG_WIFI_CONNECT_SUCCESS,
    HTTP_MSG_WIFI_CONNECT_FAIL,
    HTTP_MSG_OTA_UPDATE_SUCCESSFUL,
    HTTP_MSG_OTA_UPDATE_FAILED,
} http_server_message_e;

/**
 * Structure for the message queue
*/
typedef struct http_server_queue_message
{
    http_server_message_e msgID;
} http_server_queue_message_t;

/**
 * Sends a message to the queue
 * @param msgID from the http_server_message_e enum
 * @return pdTrue is an item was successfully sent to the queueu, otherwise pdFALSE
 * @note Expand the parameter list based on your requeirments, e.g. how youve expanded the http_server_queue_message_t
*/
BaseType_t http_server_monitor_send_message(http_server_message_e msgID);

/**
 * starts the HTTP Server
*/
void http_server_start(void);

/**
 * stops the HTTP server
*/
void http_server_stop(void);

/**
 * Timer callback function which calls esp_restart upon successfull firmware update
*/
void http_server_fw_update_reset_callback(void *arg);

#endif /* MAIN_HTTP_SERVER_H_ */
