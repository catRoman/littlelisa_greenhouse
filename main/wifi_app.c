/**
 * @file		wifi_app.c
 * @brief		implemntaion of  wifi system on esp
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 * 
 */

#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"

#include "esp_err.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "lwip/netdb.h"

#include "rgb_led.h"
#include "task_common.h"
#include "wifi_app.h"

// Tag used for ESP serial console messages
static const char TAG [] = "wifi_app";

// Queue handle used to manipulate the main queue of events
static QueueHandle_t wifi_app_queue_handle;

// netif objects for the station and access point
esp_netif_t* esp_netif_sta = NULL;
esp_netif_t* esp_netif_ap = NULL;

/**
 * Initalizes the TCP stack and default wifi configuration
*/
static void wifi_app_default_wifi_init(void)
{
    // Intialize the TCP Stack
    ESP_ERROR_CHECK(esp_netif_init());

    // Default Wifi config - operations must be in this order
    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    esp_netif_sta = esp_netif_create_default_wifi_sta();
    esp_netif_ap = esp_netif_create_default_wifi_ap();
}

/**
 * Configure the WiFi acces point settings and assigns the static Ip to the softAP
*/
static void  wifi_app_soft_ap_config(void)
{
    // SoftAP - WiFi access point configuration
    wifi_config_t ap_config = 
    {
        .ap = {
            .ssid = WIFI_AP_SSID,
            .ssid_len = strlen(WIFI_AP_SSID),
            .password = WIFI_AP_PASSWORD,
            .channel = WIFI_AP_CHANNEL,
            .ssid_hidden = WIFI_AP_SSID_HIDDEN,
            .authmode = WIFI_AUTH_WPA2_PSK,
            .max_connection = WIFI_AP_MAX_CONNECTIONS,
            .beacon_interval = WIFI_AP_BEACON_INTERVAL,
        },
    };

    // Configure DHCP for the AP
    esp_netif_ip_info_t ap_ip_info;
    memset(&ap_ip_info, 0x00, sizeof(ap_ip_info));
    esp_netif_dhcps_stop(esp_netif_ap);                                              ///> must call this first
    inet_pton(AF_INET, WIFI_AP_IP, &ap_ip_info.ip);                                  ///> assign ap static ip, gw and netmask
    inet_pton(AF_INET, WIFI_AP_GATEWAY, &ap_ip_info.gw);
    inet_pton(AF_INET, WIFI_AP_NETMASK, &ap_ip_info.netmask);
    ESP_ERROR_CHECK(esp_netif_set_ip_info(esp_netif_ap, &ap_ip_info));              ///> statically configure the network interface
    ESP_ERROR_CHECK(esp_netif_dhcps_start(esp_netif_ap));                           ///> start the ap dhcp server (for connecting stations eg. mobile device)
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));                                 ///> Setting the mode as access point / station mode
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_AP, &ap_config));               ///> set our configuration
    ESP_ERROR_CHECK(esp_wifi_set_bandwidth(ESP_IF_WIFI_AP, WIFI_AP_BANDWIDTH));     ///> Our default bandwidth 20 MHz
    ESP_ERROR_CHECK(esp_wifi_set_ps(WIFI_STA_POWER_SAVE));                          ///> Power save sett to none

}

/**
 * Wifi application event handler
 * @param arg data, aside from event data that is passed the handler when it is called
 * @param evet_base the base id of the event to the register the handler for
 * @param event_id the id for the event to register the handler for
 * @param event_data event data
*/
static void wifi_app_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT)
    {
        switch (event_id)
        {
            case WIFI_EVENT_AP_START:
                ESP_LOGI(TAG, "WIFI_EVENT_AP_START");
                break;

            case WIFI_EVENT_AP_STOP:
                ESP_LOGI(TAG, "WIFI_EVENT_AP_STOP");
                break;


            case WIFI_EVENT_AP_STACONNECTED:
                ESP_LOGI(TAG, "WIFI_EVENT_AP_STACONNECTED");
                break;
            
            case WIFI_EVENT_AP_STADISCONNECTED:
                ESP_LOGI(TAG, "WIFI_EVENT_AP_STADISCONNECT");
                break;
            
            case WIFI_EVENT_STA_START:
                ESP_LOGI(TAG, "WIFI_EVENT_STA_START");
                break;
            
            case WIFI_EVENT_STA_STOP:
                ESP_LOGI(TAG, "WIFI_EVENT_STA_STOP");
                break;

            case WIFI_EVENT_STA_CONNECTED:
                ESP_LOGI(TAG, "WIFI_EVENT_STA_CONNECTED");
                break;

            case WIFI_EVENT_STA_DISCONNECTED:
                ESP_LOGI(TAG, "WIFI_EVENT_STA_DISCONNECTED");
                break;
            
            default:
                break;
        }
    }
    else if (event_base == IP_EVENT)
    {
        switch (event_id)
        {
            case IP_EVENT_STA_GOT_IP:
                ESP_LOGI(TAG, "IP_EVENT_STA_GOT_IP");
                break;
        }
    }
}

/**
 * Initializes the wifi application event handler for WiFi and IP events
*/
static void wifi_app_event_handler_init(void)
{
    // Event loop for the Wifi driver
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // cevent handler for the connection
    esp_event_handler_instance_t instance_wifi_event;
    esp_event_handler_instance_t instance_ip_event;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_app_event_handler, NULL, &instance_wifi_event));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_app_event_handler, NULL, &instance_ip_event));
}


/**
 * Main Task for the WiFi application
 * @param pvParameters parameter which can be passed to the task
*/
static void wifi_app_task(void *pvParameters)
{
     wifi_app_queue_message_t msg;

     // Initalize the event handler
     wifi_app_event_handler_init();

     // Initialize the TCP/IP stack and WiFi config
     wifi_app_default_wifi_init();

     // Soft AP config
     wifi_app_soft_ap_config();

     // Start WiFi
     ESP_ERROR_CHECK(esp_wifi_start());

     // Send first event message
     wifi_app_send_message(WIFI_APP_MSG_START_HTTP_SERVER);

     for(;;)
     {
        if (xQueueReceive(wifi_app_queue_handle, &msg, portMAX_DELAY))
        {
            switch (msg.msgID)
            {
                case WIFI_APP_MSG_START_HTTP_SERVER:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_START_HTTP_SERVER");

                    // http_server_start();
                    rgb_led_http_server_started();
                    
                    break;

                case WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER");

                    break;
                
                case WIFI_APP_MSG_STA_CONNECTED_GOT_IP:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_STA_CONNECTED_GOT_IP");
                    rgb_led_wifi_connected();

                    break;

                default:
                    break;

            }
        }
     }
}

 
BaseType_t wifi_app_send_message(wifi_app_message_e msgID)
{
    wifi_app_queue_message_t msg;
    msg.msgID = msgID;
    return xQueueSend(wifi_app_queue_handle, &msg, portMAX_DELAY);
}

void wifi_app_start(void)
{
    ESP_LOGI(TAG, "STARTING WIFI APPLICATION"); // log to serial console

    // start wifi started led
    rgb_led_wifi_app_started();

    // Disable default wifi logging messages (for breviety in serial console)
    esp_log_level_set("wifi", ESP_LOG_NONE);

    // Create a message queue
    wifi_app_queue_handle = xQueueCreate(3, sizeof(wifi_app_queue_message_t));

    // Start the Wifif application
    xTaskCreatePinnedToCore(&wifi_app_task, "wifi_app_task", WIFI_APP_TASK_STACK_SIZE, NULL, WIFI_APP_TASK_PRIORITY, NULL, WIFI_APP_TASK_CORE_ID);

}



