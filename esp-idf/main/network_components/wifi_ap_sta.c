/**
 * @file		wifi_app.c
 * @brief		implemntaion of  wifi system on esp
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 *
 */
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "lwip/err.h"
#include "lwip/sys.h"
#include "sdkconfig.h"

#include "wifi_ap_sta.h"
#include "module_components/led.h"

static const char TAG[] = "wifi_ap_sta";

/**
 *  Network configurations set via project configuration menu.
*/
//for ap mode
#define ESP_ENABLE_AP_MODE              CONFIG_ESP_ENABLE_AP_MODE
#define ESP_WIFI_AP_MODE_SSID           CONFIG_ESP_WIFI_AP_MODE_SSID
#define ESP_WIFI_AP_MODE_PASSWORD       CONFIG_ESP_WIFI_AP_MODE_PASSWORD
#define ESP_WIFI_AP_MODE_CHANNEL        CONFIG_ESP_WIFI_AP_MODE_CHANNEL
#define MAX_AP_STA_MODE_CONN            CONFIG_ESP_MAX_AP_STA_CONN

//for sta mode
#define ESP_WIFI_INIT_STA_MODE_SSID      CONFIG_ESP_WIFI_INIT_STA_MODE_SSID         
#define ESP_WIFI_INIT_STA_MODE_PASS      CONFIG_ESP_WIFI_INIT_STA_MODE_PASS
#define MAX_STA_MODE_RETRY_ATTEMPT       CONFIG_ESP_MAX_STA_MODE_RETRY_MODE_ATTEMPT

static void wifi_event_handler(void* arg, esp_event_base_t event_base,
                                    int32_t event_id, void* event_data)
{
    switch(event_id){
        case WIFI_EVENT_AP_STACONNECTED:
            
            ESP_LOGI(TAG, "station joined");
            
            break;
        case WIFI_EVENT_AP_STADISCONNECTED:
        
            ESP_LOGI(TAG, "station left");

            break;


        default:
            break;
    }
}

void wifi_ap_sta_init(void)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_ap();

    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &wifi_event_handler,
                                                        NULL,
                                                        NULL));

    wifi_config_t wifi_config = {
        .ap = {
            .ssid = ESP_WIFI_SSID,
            .ssid_len = strlen(ESP_WIFI_SSID),
            .channel = ESP_WIFI_CHANNEL,
            .password = ESP_WIFI_PASS,
            .max_connection = MAX_STA_CONN,
            .authmode = WIFI_AUTH_WPA_WPA2_PSK
        },
    };
    if (strlen(ESP_WIFI_PASS) == 0) {
        wifi_config.ap.authmode = WIFI_AUTH_OPEN;
    }

    if(ESP_ENABLE_AP == true){
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_AP));
        ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));
        ESP_ERROR_CHECK(esp_wifi_start());

        ESP_LOGI(TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d",
                ESP_WIFI_SSID, ESP_WIFI_PASS, ESP_WIFI_CHANNEL);
        led_wifi_app_started();
    }
}

