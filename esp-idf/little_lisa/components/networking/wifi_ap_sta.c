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
#include "esp_mac.h"
#include "nvs_flash.h"
#include "lwip/err.h"
#include "lwip/sys.h"
#include "sdkconfig.h"
#include "lwip/netdb.h"
#include "esp_netif.h"

// components
#include "esp_now_comm.h"
#include "nvs_service.h"
#include "websocket_server.h"
#include "mdns.h"
#include "wifi_ap_sta.h"
#include "led.h"
#include "http_server.h"
#include "sntp.h"
#include "task_common.h"
#include "helper.h"
#include "module_config.h"

extern Module_info_t *module_info_gt;

static const char WIFI_TAG[] = "wifi_ap_sta";
static int s_retry_num = 0;
extern int ota_updating;

static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data)
{
    switch (event_id)
    {
    case WIFI_EVENT_AP_STACONNECTED:
        ESP_LOGI(WIFI_TAG, "station joined to module ap");
        if (ota_updating == true)
        {
            wifi_event_ap_staconnected_t *new_device = (wifi_event_ap_staconnected_t *)event_data;
            esp_wifi_deauth_sta(new_device->aid);
            ESP_LOGI(WIFI_TAG, "station joined to module ap- deauthenticated for ota propgated update");
        }
        break;

    case WIFI_EVENT_AP_STADISCONNECTED:
        ESP_LOGI(WIFI_TAG, "station left modules ap");
        break;

    case WIFI_EVENT_STA_START:

        esp_wifi_connect();
        ESP_LOGI(WIFI_TAG, "module joined ap as sta");

        break;

    case WIFI_EVENT_STA_DISCONNECTED:

        ESP_LOGW(WIFI_TAG, "connection lost attempting reconnect....");
        esp_wifi_connect();

        break;

    case IP_EVENT_STA_GOT_IP:
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(WIFI_TAG, "Got IP:" IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_num = 0;

    default:
        break;
    }
}

// void checkWifiConnectionTask(void *vpParams){

//     wifi_ap_record_t ap_info;
//     for(;;){

//     int connection_status = esp_wifi_sta_get_ap_info(&ap_info);
//     if ( connection_status != ESP_OK) {
//        ESP_LOGW(WIFI_TAG, "connection lost attempting reconnect....%s", esp_err_to_name(connection_status));
//        esp_wifi_connect();
//     }

//     vTaskDelay(pdMS_TO_TICKS(5000));
//      taskYIELD();

//     }
// }
esp_netif_t *wifi_init_softap(void)
{
    esp_netif_t *esp_netif_ap = esp_netif_create_default_wifi_ap();

    //   #ifdef CONFIG_ENABLE_NVS_UPDATE

    // wifi_config_t wifi_ap_config = {
    //     .ap = {
    //         .ssid = ESP_WIFI_AP_MODE_SSID,
    //         .ssid_len = strlen(ESP_WIFI_AP_MODE_SSID),
    //         .ssid_hidden = ESP_AP_MODE_HIDE_SSID,
    //         .channel = ESP_WIFI_AP_MODE_CHANNEL,
    //         .password = ESP_WIFI_AP_MODE_PASSWORD,
    //         .max_connection = MAX_AP_STA_MODE_CONN,
    //         .authmode = WIFI_AUTH_WPA_WPA2_PSK
    //     },
    // };
    wifi_config_t wifi_ap_config = {
        .ap = {
            .ssid = "LittleLisa - Greenhouse",
            .ssid_len = strlen("LittleLisa - Greenhouse"),
            .ssid_hidden = 0,
            .channel = 1,
            .password = "Westgate4@",
            .max_connection = 10,
            .authmode = WIFI_AUTH_WPA_WPA2_PSK},
    };
    // #else
    // char *nvs_wifi_ssid = "";
    // char *nvs_wifi_pass = "";

    // ESP_ERROR_CHECK(nvs_get_wifi_info(&nvs_wifi_ssid, &nvs_wifi_pass));

    // wifi_config_t wifi_ap_config = {
    //     .ap = {
    //         .ssid = nvs_wifi_ssid,
    //         .ssid_len = strlen(nvs_wifi_ssid),
    //         .ssid_hidden = ESP_AP_MODE_HIDE_SSID,
    //         .channel = ESP_WIFI_AP_MODE_CHANNEL,
    //         .password = nvs_wifi_pass,
    //         .max_connection = 5,
    //         .authmode = WIFI_AUTH_WPA_WPA2_PSK
    //     },
    // };
    // #endif

    // Configure DHCP for the AP
    esp_netif_ip_info_t ap_ip_info;
    memset(&ap_ip_info, 0x00, sizeof(ap_ip_info));
    esp_netif_dhcps_stop(esp_netif_ap);             ///> must call this first
    inet_pton(AF_INET, WIFI_AP_IP, &ap_ip_info.ip); ///> assign ap static ip, gw and netmask
    inet_pton(AF_INET, WIFI_AP_GATEWAY, &ap_ip_info.gw);
    inet_pton(AF_INET, WIFI_AP_NETMASK, &ap_ip_info.netmask);
    ESP_ERROR_CHECK(esp_netif_set_ip_info(esp_netif_ap, &ap_ip_info)); ///> statically configure the network interface
    ESP_ERROR_CHECK(esp_netif_dhcps_start(esp_netif_ap));              ///> start the ap dhcp server (for connecting stations eg. mobile device)

    // if (strlen(ESP_WIFI_AP_MODE_PASSWORD) == 0) {
    //         wifi_ap_config.ap.authmode = WIFI_AUTH_OPEN;
    //     }

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    // ESP_LOGI(WIFI_TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d",
    //         ESP_WIFI_AP_MODE_SSID, ESP_WIFI_AP_MODE_PASSWORD, ESP_WIFI_AP_MODE_CHANNEL);

    ESP_LOGI(WIFI_TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d",
             "LittleLisa - Greenhouse", "Westgate4@", 1);

    return esp_netif_ap;
}

esp_netif_t *wifi_init_sta(void)
{
    esp_netif_t *esp_netif_sta = esp_netif_create_default_wifi_sta();

    // wifi_config_t wifi_sta_config = {
    //     .sta = {
    //         .ssid = ESP_WIFI_INIT_STA_MODE_SSID,
    //         .password = ESP_WIFI_INIT_STA_MODE_PASSWORD,
    //         .scan_method = WIFI_ALL_CHANNEL_SCAN,
    //         .failure_retry_cnt = MAX_STA_MODE_RETRY_ATTEMPT,
    //     },
    // };

    // wifi_config_t wifi_sta_config;
    char ssid[32];
    char pass[32];

    if (strcmp(module_info_gt->type, "controller") == 0)
    {
        strcpy(ssid, "Bill Nye the WiFi Guy");
        strcpy(pass, "Westgate1");
    }
    else
    {
        strcpy(ssid, "LittleLisa - Greenhouse");
        strcpy(pass, "Westgate4@");
    }

    wifi_config_t wifi_sta_config = {
        .sta = {
            .ssid = "",
            .password = "",
            .scan_method = WIFI_ALL_CHANNEL_SCAN,
            .failure_retry_cnt = 10,
        },
    };

    // // Correct usage of strncpy to avoid buffer overflow
    // wifi_sta_config.sta.ssid = "";

    // wifi_sta_config.sta.scan_method = WIFI_ALL_CHANNEL_SCAN;
    // wifi_sta_config.sta.failure_retry_cnt = 10;

    strncpy((char *)wifi_sta_config.sta.ssid, (const char *)ssid, sizeof(wifi_sta_config.sta.ssid) - 1);
    wifi_sta_config.sta.ssid[sizeof(wifi_sta_config.sta.ssid) - 1] = '\0'; // Ensure null termination

    strncpy((char *)wifi_sta_config.sta.password, (const char *)pass, sizeof(wifi_sta_config.sta.password) - 1);
    wifi_sta_config.sta.password[sizeof(wifi_sta_config.sta.password) - 1] = '\0'; // Ensure null termination

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_sta_config));

    // ESP_LOGI(WIFI_TAG, "wifi_init_sta finished. SSID:%s password:%s",
    //     ESP_WIFI_INIT_STA_MODE_SSID, ESP_WIFI_INIT_STA_MODE_PASSWORD);

    ESP_LOGI(WIFI_TAG, "wifi_init_sta finished. SSID:%s password:%s",
             ssid, pass);

    return esp_netif_sta;
}
// void wifi_start(void){
//     xTaskCreatePinnedToCore(&wifi_init, "wifi_init", WIFI_APP_TASK_STACK_SIZE, NULL, WIFI_APP_TASK_PRIORITY, NULL, WIFI_APP_TASK_CORE_ID);
// }
void wifi_start(void)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // register event handlers

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

    // initialize wifi

    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));
    esp_log_level_set("wifi", ESP_LOG_DEBUG);

    if (strcmp(module_info_gt->type, "controller") == 0)
    {

        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
        ESP_LOGI(WIFI_TAG, "wifi ap and sta mode selected");
        // soft ap
        ESP_LOGI(WIFI_TAG, "wifi soft ap mode init");
        esp_netif_t *esp_netif_ap = wifi_init_softap();

        // sta
        ESP_LOGI(WIFI_TAG, "wifi sta mode init");
        esp_netif_t *esp_netif_sta = wifi_init_sta();

        ESP_ERROR_CHECK(esp_wifi_start());

        esp_netif_set_default_netif(esp_netif_sta);
        led_wifi_app_started();
        log_mac_address(ESP_MAC_WIFI_SOFTAP);
        log_mac_address(ESP_MAC_WIFI_STA);

        mdns_start();
        // esp_now_comm_start();
        //   start http and sntp server
        sntp_service_init();
        http_server_start();
        websocket_server_start();
        led_http_server_started();
    }
    else
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
        ESP_LOGI(WIFI_TAG, "wifi sta only mode selected");

        // sta
        ESP_LOGI(WIFI_TAG, "wifi sta mode init");
        esp_netif_t *esp_netif_sta = wifi_init_sta();

        ESP_ERROR_CHECK(esp_wifi_start());

        esp_netif_set_default_netif(esp_netif_sta);
        led_wifi_app_started();
        log_mac_address(ESP_MAC_WIFI_STA);

        mdns_start();
        // esp_now_comm_start();

        // start http and sntp server
        // sntp_service_init();
        http_server_start();
        led_http_server_started();
        websocket_server_start();

        // vTaskDelay(pdMS_TO_TICKS(5000));
        //  xTaskCreatePinnedToCore(
        // checkWifiConnectionTask,
        // "checkWififConnect",
        // WIFI_RECONNECT_STACK_SIZE,
        // NULL,
        // WIFI_RECONNECT_PRIORITY,
        // NULL,
        // WIFI_RECONNECT_CORE_ID);

        heap_caps_check_integrity_all(true);
    }
}

esp_err_t log_mac_address(esp_mac_type_t mac_type)
{

    char *type;

    if (mac_type == ESP_MAC_WIFI_SOFTAP)
    {
        type = "AP";
    }
    else
    {
        type = "STA";
    }

    uint8_t mac[6];
    // Get MAC address for Wi-Fi Station interface
    esp_err_t mac_ret = esp_read_mac(mac, mac_type);

    if (mac_ret == ESP_OK)
    {

        ESP_LOGI(WIFI_TAG, "%s MAC Address: %02x:%02x:%02x:%02x:%02x:%02x\n", type, mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    }
    else
    {
        ESP_LOGE(WIFI_TAG, "Failed to get MAC address!\n");
    }

    return mac_ret;
}

esp_err_t mdns_start()
{
    extern Module_info_t *module_info_gt;
    esp_err_t err;
    //"littlelisa-controller-ab:3d:45:a4:2d:ed" - example 26 char w/o terminator
    char module_id[50];
    char mac_addr[20];
    strcpy(mac_addr, module_info_gt->identity);
    find_and_replace(mac_addr, ':', '-');

    snprintf(module_id, sizeof(module_id), "%s", mac_addr);
    char mdns_host_name[50] = "littlelisa-";

    size_t current_length = strlen(mdns_host_name);
    size_t remaining_space = sizeof(mdns_host_name) - current_length - 1;

    strncat(mdns_host_name, module_info_gt->type, remaining_space);

    current_length = strlen(mdns_host_name);
    remaining_space = sizeof(mdns_host_name) - current_length - 1;

    strncat(mdns_host_name, "-", remaining_space);

    current_length = strlen(mdns_host_name);
    remaining_space = sizeof(mdns_host_name) - current_length - 1;

    strncat(mdns_host_name, module_id, remaining_space);

    if ((err = mdns_init()) != ESP_OK)
    {
        ESP_LOGE("mdns", "MDNS Init fail: %s", esp_err_to_name(err));
        return err;
    }
    err = mdns_hostname_set(mdns_host_name);
    if (err)
    {
        ESP_LOGE("mdns", "Set hostname failed: %s", esp_err_to_name(err));
        return err;
    }

    ESP_LOGI("mdns", "mdns hostname set to: [%s]", mdns_host_name);

    if (mdns_service_add(NULL, "_http", "_tcp", 80, NULL, 0) != ESP_OK)
    {
        ESP_LOGE("mdns", "Failed to add services: %s", esp_err_to_name(err));
        return err;
    }

    char service_instance[50];
    strcpy(service_instance, mdns_host_name);

    remaining_space = sizeof(service_instance) - strlen(service_instance) - 1;
    strncat(service_instance, " Debug Web Server", remaining_space);

    mdns_service_instance_name_set("_http", "_tcp", service_instance);
    ESP_LOGI("mdns", "%s running", service_instance);

    return ESP_OK;
}