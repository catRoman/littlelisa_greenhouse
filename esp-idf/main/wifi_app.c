/**
 * @file		wifi_app.c
 * @brief		implemntaion of  wifi system on esp
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 *
 */
// FIXME: when wifi connects to new ssid ip adress , netk, gateway show up as 0.0.0.0 untill refresh

#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"

#include "esp_err.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "lwip/netdb.h"
#include "esp_event.h"
#include "nvs.h"

#include "led.h"
#include "http_server.h"
#include "task_common.h"
#include "wifi_app.h"
#include "nvs_service.h"


// Tag used for ESP serial console messages
static const char TAG [] = "wifi_app";

//nvs initial values
// TODO: change back dynamic allocation including methods with char ** param
static char wifi_ssid_from_nvs[50];
static char wifi_pwd_from_nvs[50];

// Used for returning the WiFi configuration
wifi_config_t *wifi_config = NULL;

// used to track the number of retries when a connection attempt fails
static int g_retry_number;

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

                wifi_event_sta_connected_t *wifi_event_sta_connected = (wifi_event_sta_connected_t*)malloc(sizeof(wifi_event_sta_connected_t));
                *wifi_event_sta_connected = *((wifi_event_sta_connected_t*) event_data);

                wifi_app_send_message(WIFI_APP_MSG_STA_CONNECTED_GOT_IP);
                break;

            case WIFI_EVENT_STA_DISCONNECTED:
                ESP_LOGI(TAG, "WIFI_EVENT_STA_DISCONNECTED");

                wifi_event_sta_disconnected_t *wifi_event_sta_disconnected = (wifi_event_sta_disconnected_t*)malloc(sizeof(wifi_event_sta_disconnected_t));
                *wifi_event_sta_disconnected = *((wifi_event_sta_disconnected_t*) event_data);
                printf("WIFI_EVENT_STA_DISCONNECT, reason code %d\n", wifi_event_sta_disconnected->reason);

                if (g_retry_number < MAX_CONNECTION_RETRIES)
                {
                    esp_wifi_connect();
                    g_retry_number ++;
                }
                else
                {
                    wifi_app_send_message(WIFI_APP_MSG_STA_DISCONNECTED);
                }

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

                wifi_app_send_message(WIFI_APP_MSG_STA_CONNECTED_GOT_IP);
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
 * Connects the esp32 to an external ap using the update station configration
*/
static void wifi_app_connect_sta(void)
{
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, wifi_app_get_wifi_config()));
    ESP_ERROR_CHECK(esp_wifi_connect());
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

                    http_server_start();
                    led_http_server_started();

                    break;

                case WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_CONNECTING_FROM_HTTP_SERVER");

                    //attempt a connecting
                    wifi_app_connect_sta();
                    led_wifi_app_started();

                    //set current number of retries to zero
                    g_retry_number = 0;

                    //let the http server know about the connection attempt
                    http_server_monitor_send_message(HTTP_MSG_WIFI_CONNECT_INIT);

                    break;

                case WIFI_APP_MSG_STA_CONNECTED_GOT_IP:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_STA_CONNECTED_GOT_IP");

                    led_wifi_connected();
                    http_server_monitor_send_message(HTTP_MSG_WIFI_CONNECT_SUCCESS);
                    break;

                case WIFI_APP_MSG_USER_REQUESTED_STA_DISCONNECT:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_USER_REQUESTED_STA_DISCONNECTED");

                    g_retry_number = MAX_CONNECTION_RETRIES;
                    ESP_ERROR_CHECK(esp_wifi_disconnect());
                    led_http_server_started(); // TODO: rename status led to a name more meaninful
                    break;

                case WIFI_APP_MSG_STA_DISCONNECTED:
                    ESP_LOGI(TAG, "WIFI_APP_MSG_STA_DISCONNECTED");

                    http_server_monitor_send_message(HTTP_MSG_WIFI_CONNECT_FAIL);
                    //remove credentials from  nvs
                    nvs_erase();
                    break;

                case WIFI_APP_MSG_STA_CONNECTING_FROM_NVS:

                    ESP_LOGI(TAG, "existing wifi ssid found in nvs -> %s", wifi_ssid_from_nvs);
                    memcpy(wifi_config->sta.ssid, wifi_ssid_from_nvs, strlen(wifi_ssid_from_nvs));
                    memcpy(wifi_config->sta.password, wifi_pwd_from_nvs, strlen(wifi_pwd_from_nvs));
                    //free(wifi_ssid_from_nvs);
                    //free(wifi_pwd_from_nvs);

                     wifi_app_connect_sta();
                    led_wifi_app_started();

                    //set current number of retries to zero
                    g_retry_number = 0;

                    //let the http server know about the connection attempt
                    http_server_monitor_send_message(HTTP_MSG_WIFI_CONNECT_INIT);

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

wifi_config_t* wifi_app_get_wifi_config(void)
{
    return wifi_config;
}

void wifi_app_start(void)
{
    ESP_LOGI(TAG, "STARTING WIFI APPLICATION"); // log to serial console

    // start wifi started led
    led_wifi_app_started();

    // Disable default wifi logging messages (for breviety in serial console)
    esp_log_level_set("wifi", ESP_LOG_NONE);

    // Allocating memory for the wifi configuration
    wifi_config = (wifi_config_t*)malloc(sizeof(wifi_init_config_t));
    memset(wifi_config, 0x00, sizeof(wifi_config_t));


    // Create a message queue
    wifi_app_queue_handle = xQueueCreate(3, sizeof(wifi_app_queue_message_t));

    // Start the Wifif application
    xTaskCreatePinnedToCore(&wifi_app_task, "wifi_app_task", WIFI_APP_TASK_STACK_SIZE, NULL, WIFI_APP_TASK_PRIORITY, NULL, WIFI_APP_TASK_CORE_ID);

    //check for wifi credientials in nvs and set


    esp_err_t nvs_err = nvs_get_wifi_info(wifi_ssid_from_nvs, wifi_pwd_from_nvs);

    if(nvs_err == ESP_ERR_NVS_NOT_FOUND || (strcmp(wifi_ssid_from_nvs, "") == 0)){
        ESP_LOGI(TAG, "no existing wifi credientials found in nvs");
    }else if (nvs_err == ESP_OK){
        wifi_app_send_message(WIFI_APP_MSG_STA_CONNECTING_FROM_NVS);
    }else{
        ESP_LOGE(TAG, "error with loading nvs on start: %s", esp_err_to_name(nvs_err));
    }

}
