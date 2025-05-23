/**
 * @file		wifi_app.h
 * @brief		wifi specific header for application
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-02-17
 *
 * includes all base configuration for wifi, enum for wifi messages
 * and netif objects for stations and access point
 */

#ifndef NETWORKING_WIFI_AP_STA_H_
#define NETWORKING_WIFI_AP_STA_H

#include <stdbool.h>
#include "esp_mac.h"
/**
 *  Network configurations set via project configuration menu.
 */
// for ap mode
#ifdef CONFIG_ESP_ENABLE_AP_MODE
#define ESP_ENABLE_AP_MODE CONFIG_ESP_ENABLE_AP_MODE
#else
#define ESP_ENABLE_AP_MODE false
#endif

#ifdef CONFIG_ESP_AP_MODE_HIDE_SSID
#define ESP_AP_MODE_HIDE_SSID CONFIG_ESP_AP_MODE_HIDE_SSID
#else
#define ESP_AP_MODE_HIDE_SSID false
#endif

#ifdef CONFIG_ESP_WIFI_AP_MODE_SSID
#define ESP_WIFI_AP_MODE_SSID CONFIG_ESP_WIFI_AP_MODE_SSID
#endif

#ifdef CONFIG_ESP_WIFI_AP_MODE_PASSWORD
#define ESP_WIFI_AP_MODE_PASSWORD CONFIG_ESP_WIFI_AP_MODE_PASSWORD
#endif

#ifdef CONFIG_ESP_WIFI_AP_MODE_CHANNEL
#define ESP_WIFI_AP_MODE_CHANNEL CONFIG_ESP_WIFI_AP_MODE_CHANNEL
#endif

#ifdef CONFIG_ESP_MAX_AP_STA_MODE_CONN
#define MAX_AP_STA_MODE_CONN CONFIG_ESP_MAX_AP_STA_MODE_CONN
#endif

#define WIFI_AP_IP "192.168.0.1"        // AP default ip
#define WIFI_AP_GATEWAY "192.168.0.1"   // AP default gateway(same as IP)
#define WIFI_AP_NETMASK "255.255.255.0" // AP Netmask
#define WIFI_AP_BANDWIDTH WIFI_BW_HT20  // AP Bandwidth 20 MHz

// for sta mode
#ifdef CONFIG_ESP_WIFI_INIT_STA_MODE_SSID
#define ESP_WIFI_INIT_STA_MODE_SSID CONFIG_ESP_WIFI_INIT_STA_MODE_SSID
#endif

#ifdef CONFIG_ESP_WIFI_INIT_STA_MODE_PASSWORD
#define ESP_WIFI_INIT_STA_MODE_PASSWORD CONFIG_ESP_WIFI_INIT_STA_MODE_PASSWORD
#endif

#ifdef CONFIG_MAX_STA_MODE_RETRY_ATTEMPT
#define MAX_STA_MODE_RETRY_ATTEMPT CONFIG_MAX_STA_MODE_RETRY_ATTEMPT
#endif

/**
 * initialize and start wifi
 */
void wifi_init(void *vpParam);
void wifi_start(void);
esp_err_t mdns_start(void);
esp_err_t log_mac_address(esp_mac_type_t mac_type);
void checkWifiConnectionTask(void *vpParams);
void query_mdns_services();
#endif /* NETWORKING_WIFI_APP_H_ */