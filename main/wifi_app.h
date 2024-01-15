/**
 * @file		wifi_app.h
 * @brief		wifi specific header for application
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 * 
 * includes all base configuration for wifi, enum for wifi messages 
 * and netif objects for stations and access point
 */

#ifndef MAIN_WIFI_APP_H_
#define MAIN_WIFI_APP_H_

#include "esp_netif.h"
#include "freertos/FreeRTOS.h"
#include "esp_wifi.h"

// WiFi application settings
#define WIFI_AP_SSID                "Little Lisa-Greenhouse1"      // AP name
#define WIFI_AP_PASSWORD            "Westgate4@"      // AP password
#define WIFI_AP_CHANNEL             1               // AP channel
#define WIFI_AP_SSID_HIDDEN         0               // 0 is visable
#define WIFI_AP_MAX_CONNECTIONS     5               // max allowable clients
#define WIFI_AP_BEACON_INTERVAL     100             // ap beacon: 100ms recommended default
#define WIFI_AP_IP                  "192.168.0.1"   // AP default ip
#define WIFI_AP_GATEWAY             "192.168.0.1"   // AP default gateway(same as IP)
#define WIFI_AP_NETMASK             "255.255.255.0" // AP Netmask
#define WIFI_AP_BANDWIDTH           WIFI_BW_HT20    // AP Bandwidth 20 MHz
#define WIFI_STA_POWER_SAVE         WIFI_PS_NONE    // disable modem sleep (minimize data transfer latency in reral time)
#define MAX_SSID_LENGTH             32              // IEEE standard maximum
#define MAX_PASSWORD_LENGTH         64              // IEEE standard
#define MAX_CONNECTION_RETRIES      5               // retry number on disconnect maximum

//  netif object for the station and access point
extern esp_netif_t* esp_netif_sta;
extern esp_netif_t* esp_netif_ap;

/**
 * Message Ids for the WiFi application task
 * @note Expand this based on application requirments
*/
typedef enum wifi_app_message
{
    WIFI_APP_MSG_START_HTTP_SERVER = 0,
    WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER,
    WIFI_APP_MSG_STA_CONNECTED_GOT_IP,
    WIFI_APP_MSG_STA_DISCONNECTED,

} wifi_app_message_e;
/**
 * Structure for the message queue
 * @note Expand this based on application requirments, e.g. add another type and parameter as required
*/
typedef struct wifi_app_queue_message_t
{
    wifi_app_message_e msgID;
} wifi_app_queue_message_t;

/**
 * Sends a message to the queue
 * @note msgID message ID from the wifi_app_message_e enum
 * @return pdTRUE if an item was succesfull sent to the queue, otherwise pdFALSE
 * @note Expand the parameter list based on application requirments, e.g. how youve explanded the wifi_app_queue_message_t
*/
BaseType_t wifi_app_send_message(wifi_app_message_e msgID);

/**
 * Start the WiFi freeRTOS task
*/
void wifi_app_start(void);

/**
 * Gets the wifi configuration
 * @return wifi_config_t*
*/
wifi_config_t* wifi_app_get_wifi_config(void);

#endif /* MAIN_WIFI_APP_H_ */