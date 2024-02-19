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



static int s_retry_num = 0;

static void wifi_event_handler(void* arg, esp_event_base_t event_base,
                                    int32_t event_id, void* event_data)
{
    switch(event_id){
        case WIFI_EVENT_AP_STACONNECTED:

            ESP_LOGI(TAG, "station joined to module ap");

            break;
        case WIFI_EVENT_AP_STADISCONNECTED:

            ESP_LOGI(TAG, "station left modules ap");

            break;
        case WIFI_EVENT_STA_START:
            esp_wifi_connect();
            ESP_LOGI(TAG, "module joined ap as sta");
            break;
        case IP_EVENT_STA_GOT_IP:
            ip_event_got_ip_t *event = (ip_event_got_ip_t *) event_data;
            ESP_LOGI(TAG, "Got IP:" IPSTR, IP2STR(&event->ip_info.ip));
            s_retry_num = 0;


        default:
            break;
    }
}

esp_netif_t *wifi_init_softap(void)
{
    esp_netif_t *esp_netif_ap = esp_netif_create_default_wifi_ap();

    wifi_config_t wifi_ap_config = {
        .ap = {
            .ssid = ESP_WIFI_AP_MODE_SSID,
            .ssid_len = strlen(ESP_WIFI_AP_MODE_SSID),
            .ssid_hidden = ESP_AP_MODE_HIDE_SSID,
            .channel = ESP_WIFI_AP_MODE_CHANNEL,
            .password = ESP_WIFI_AP_MODE_PASSWORD,
            .max_connection = MAX_AP_STA_MODE_CONN,
            .authmode = WIFI_AUTH_WPA_WPA2_PSK
        },
    };

    if (strlen(ESP_WIFI_AP_MODE_PASSWORD) == 0) {
            wifi_ap_config.ap.authmode = WIFI_AUTH_OPEN;
        }

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    ESP_LOGI(TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d",
            ESP_WIFI_AP_MODE_SSID, ESP_WIFI_AP_MODE_PASSWORD, ESP_WIFI_AP_MODE_CHANNEL);

    return esp_netif_ap;
}

esp_netif_t *wifi_init_sta(void)
{
    esp_netif_t *esp_netif_sta = esp_netif_create_default_wifi_sta();

    wifi_config_t wifi_sta_config = {
        .sta = {
            .ssid = ESP_WIFI_INIT_STA_MODE_SSID,
            .password = ESP_WIFI_INIT_STA_MODE_PASSWORD,
            .scan_method = WIFI_ALL_CHANNEL_SCAN,
            .failure_retry_cnt = MAX_STA_MODE_RETRY_ATTEMPT,
        },
    };

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_sta_config));

    ESP_LOGI(TAG, "wifi_init_sta finished. SSID:%s password:%s",
        ESP_WIFI_INIT_STA_MODE_SSID, ESP_WIFI_INIT_STA_MODE_PASSWORD);

    return esp_netif_sta;
}



void wifi_init(void)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());


    //register event handlers

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &wifi_event_handler,
                                                        NULL,
                                                        NULL));

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                    IP_EVENT_STA_GOT_IP,
                    &wifi_event_handler,
                    NULL,
                    NULL));

    //initialize wifi

    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));
    esp_log_level_set("wifi", ESP_LOG_NONE);


    if(ESP_ENABLE_AP_MODE == true){

        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
        ESP_LOGI(TAG, "wifi ap and sta mode selected");
        //soft ap
        ESP_LOGI(TAG, "wifi soft ap mode init");
        esp_netif_t *esp_netif_ap = wifi_init_softap();

        //sta
        ESP_LOGI(TAG, "wifi sta mode init");
        esp_netif_t *esp_netif_sta = wifi_init_sta();

        ESP_ERROR_CHECK(esp_wifi_start());


        esp_netif_set_default_netif(esp_netif_sta);
        led_wifi_app_started();
    }else if(ESP_ENABLE_AP_MODE == false){
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
        ESP_LOGI(TAG, "wifi sta only mode selected");

        //sta
        ESP_LOGI(TAG, "wifi sta mode init");
        esp_netif_t *esp_netif_sta = wifi_init_sta();

        ESP_ERROR_CHECK(esp_wifi_start());


        esp_netif_set_default_netif(esp_netif_sta);
        led_wifi_app_started();
    }else{
        ESP_LOGE(TAG, "Error in ap/sta selection mode");
    }
}
