#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "esp_err.h"
#include "cJSON.h"
#include "esp_wifi_types.h"
#include "esp_wifi.h"
#include "esp_timer.h"
#include "esp_system.h"
#include "esp_app_desc.h"
#include "esp_chip_info.h"
#include "esp_idf_version.h"

// components
#include "node_info.h"
#include "nvs_service.h"
#include "sensor_tasks.h"
#include "wifi_ap_sta.h"

// static protypes
static char *get_reset_reason(void);
static char *get_chip_model(esp_chip_info_t *chip_info);

static const char NODE_INFO_TAG[] = "node_info";

void node_info_log_module_info(void)
{
    Module_info_t module_info = {0};
    esp_err_t err;

    err = nvs_get_module_info(&module_info);

    if (err == ESP_OK)
    {
        ESP_LOGI(NODE_INFO_TAG, "Module info-> Type: %s | Location: %s | Identifier: %s", module_info.type, module_info.location, module_info.identity);
    }
    else
    {
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }
}

char *node_info_get_controller_sta_list_json(void)
{
    wifi_sta_list_t node_list;
    ESP_ERROR_CHECK_WITHOUT_ABORT(esp_wifi_ap_get_sta_list(&node_list));

    cJSON *root = cJSON_CreateObject();
    cJSON *sta_list = cJSON_CreateObject();

    cJSON_AddNumberToObject(root, "length", node_list.num);

    cJSON_AddItemToObject(root, "sta_list", sta_list);

    char mac_addr[20];

    for (int i = 0; i < node_list.num; i++)
    {
        snprintf(mac_addr, sizeof(mac_addr), "%02x:%02x:%02x:%02x:%02x:%02x", node_list.sta[i].mac[0], node_list.sta[i].mac[1], node_list.sta[i].mac[2], node_list.sta[i].mac[3], node_list.sta[i].mac[4], node_list.sta[i].mac[5]);
        cJSON_AddNumberToObject(sta_list, mac_addr,
                                node_list.sta->rssi);
    }

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}

char *node_info_get_module_info_json(Module_info_t *module)
{
    // name, type,location, sensor arr, sensor config arr

    cJSON *root = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();

    cJSON *sensor_list = cJSON_CreateObject();
    cJSON *square_pos = cJSON_CreateObject();
    cJSON *zn_rel_pos = cJSON_CreateObject();

    cJSON_AddStringToObject(module_info, "type", module->type);
    cJSON_AddStringToObject(module_info, "location", module->location);
    cJSON_AddStringToObject(module_info, "identifier", module->identity);
    cJSON_AddNumberToObject(module_info, "greenhouse_id", module->greenhouse_id);
    cJSON_AddNumberToObject(module_info, "zone_num", module->zone_num);
    cJSON_AddItemToObject(module_info, "square_pos", square_pos);
    cJSON_AddNumberToObject(square_pos, "x", module->square_pos[0]);
    cJSON_AddNumberToObject(square_pos, "y", module->square_pos[1]);

    cJSON_AddItemToObject(module_info, "zn_rel_pos", zn_rel_pos);
    cJSON_AddNumberToObject(zn_rel_pos, "x", module->zn_rel_pos[0]);
    cJSON_AddNumberToObject(zn_rel_pos, "y", module->zn_rel_pos[1]);
    cJSON_AddNumberToObject(zn_rel_pos, "z", module->zn_rel_pos[2]);

    cJSON_AddItemToObject(root, "module_info", module_info);

    for (Sensor_List sensor = DHT22; sensor < SENSOR_LIST_TOTAL; sensor++)
    {
        cJSON *sensors[module->sensor_arr[sensor]];
        cJSON *square_pos_list[module->sensor_arr[sensor]];
        cJSON *zn_rel_pos_list[module->sensor_arr[sensor]];
        switch (sensor)
        {
        case DHT22:
            cJSON *dht22_sensor_info = cJSON_CreateObject();
            cJSON_AddItemToObject(sensor_list, "DHT22", dht22_sensor_info);
            cJSON_AddNumberToObject(dht22_sensor_info, "total_sensors", module->sensor_arr[sensor]);

            if (module->sensor_arr[sensor] > 0)
            {

                //     {
                for (int i = 0; i < module->sensor_arr[sensor]; i++)
                {
                    sensors[i] = cJSON_CreateObject();
                    square_pos_list[i] = cJSON_CreateObject();
                    zn_rel_pos_list[i] = cJSON_CreateObject();
                    char sensor_name_buff[15];
                    snprintf(sensor_name_buff, sizeof(sensor_name_buff), "sensor_%d", (i + 1));
                    cJSON_AddItemToObject(dht22_sensor_info, sensor_name_buff, sensors[i]);

                    cJSON_AddStringToObject(sensors[i], "location", module->sensor_config_arr[sensor]->sensor_loc_arr[i + 1]);
                    cJSON_AddNumberToObject(sensors[i], "pin", module->sensor_config_arr[sensor]->sensor_pin_arr[i + 1]);

                    cJSON_AddItemToObject(sensors[i], "square_pos", square_pos_list[i]);
                    cJSON_AddNumberToObject(square_pos_list[i], "x", module->sensor_config_arr[sensor]->square_pos[i + 1][0]);
                    cJSON_AddNumberToObject(square_pos_list[i], "y", module->sensor_config_arr[sensor]->square_pos[i + 1][1]);

                    cJSON_AddItemToObject(sensors[i], "zn_rel_pos", zn_rel_pos_list[i]);
                    cJSON_AddNumberToObject(zn_rel_pos_list[i], "x", module->sensor_config_arr[sensor]->zn_rel_pos[i + 1][0]);
                    cJSON_AddNumberToObject(zn_rel_pos_list[i], "y", module->sensor_config_arr[sensor]->zn_rel_pos[i + 1][1]);
                    cJSON_AddNumberToObject(zn_rel_pos_list[i], "z", module->sensor_config_arr[sensor]->zn_rel_pos[i + 1][2]);
                }
            }
            break;
        case SOIL_MOISTURE:
            cJSON_AddNumberToObject(sensor_list, "soil_moisture", module->sensor_arr[sensor]);
            break;
        case LIGHT:
            cJSON_AddNumberToObject(sensor_list, "light", module->sensor_arr[sensor]);
            break;
        case SOUND:
            cJSON_AddNumberToObject(sensor_list, "sound", module->sensor_arr[sensor]);
            break;
        case MOVEMENT:
            cJSON_AddNumberToObject(sensor_list, "movement", module->sensor_arr[sensor]);
            break;
        case CAMERA:
            cJSON_AddNumberToObject(sensor_list, "cam", module->sensor_arr[sensor]);
            break;
        default:
            cJSON_AddNumberToObject(sensor_list, "unknown", module->sensor_arr[sensor]);
            break;
        }
    }

    cJSON_AddItemToObject(root, "sensor_list", sensor_list);

    // cJSON *sensor_type_pin_list;

    // for (Sensor_List sensor = DHT22; sensor < SENSOR_LIST_TOTAL; sensor++)
    // {
    //     // cJSON *sensor_type_list = cJSON_CreateObject();

    //     if (module->sensor_arr[sensor] > 0)
    //     {

    //         sensor_type_pin_list = cJSON_CreateObject();
    //         for (int i = 1; i <= module->sensor_arr[sensor]; i++)
    //         {
    //             cJSON_AddNumberToObject(sensor_type_pin_list, module->sensor_config_arr[sensor]->sensor_loc_arr[i],
    //                                     module->sensor_config_arr[sensor]->sensor_pin_arr[i]);
    //         }

    //         cJSON_AddItemToObject(root, sensor_type_to_string(sensor), sensor_type_pin_list);
    //     }
    // }
    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}
void node_info_log_sensor_list(void)
{
    int8_t *sensor_list = NULL;
    int8_t sensorLength = 0xff;

    esp_err_t err;

    err = nvs_get_sensor_arr(&sensor_list, &sensorLength);

    /**
     * sensor list
     *
     * 0 - temp
     * 1 - humidity
     * 2 - soil moisture
     * 4 - light
     * 5 - sound
     * 6 - movement
     * 7 - cam
     */
    char sensor_info_str[200] = "Sensor List:\n";
    if (err == ESP_OK && sensor_list != NULL)
    {
        for (int i = 0; i < sensorLength; i++)
        {
            switch (i)
            {
            case DHT22:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tDHT22: %d\n", sensor_list[i]);
                break;
            case SOIL_MOISTURE:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tSoil Moisture: %d\n", sensor_list[i]);
                break;
            case LIGHT:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tLight: %d\n", sensor_list[i]);
                break;
            case SOUND:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tSound: %d\n", sensor_list[i]);
                break;
            case MOVEMENT:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tMovement: %d\n", sensor_list[i]);
                break;
            case CAMERA:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tCam: %d\n", sensor_list[i]);
                break;
            default:
                snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tUnknown sensor type: %d", sensor_list[i]);
                break;
            }
        }
        ESP_LOGI(NODE_INFO_TAG, "%s", sensor_info_str);
    }
    else
    {
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }
}

char *node_info_get_uptime_json(void)
{

    // milliseconds
    uint64_t uptimeMS = esp_timer_get_time() / 1000;

    cJSON *root = cJSON_CreateObject();

    cJSON_AddNumberToObject(root, "uptime", uptimeMS);
    cJSON_AddStringToObject(root, "unit", "ms");

    char *uptimeFunk = cJSON_Print(root);
    cJSON_Delete(root);
    return uptimeFunk;
}
//-------------status
// sd card
// sntp
// ws-server
// nvs load

char *node_info_get_status_info_json()
{
    cJSON *root = cJSON_CreateObject();

    // cJSON_AddStringToObject(root, "reset_reason", get_reset_reason());

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}

//-------------Device name

char *node_info_get_device_info_json()
{
    cJSON *root = cJSON_CreateObject();

    // chipinfo
    esp_chip_info_t this_chip_info;
    esp_chip_info(&this_chip_info);

    cJSON *chip_info = cJSON_CreateObject();
    cJSON_AddItemToObject(root, "chip_info", chip_info);
    cJSON_AddNumberToObject(chip_info, "num_cores", this_chip_info.cores);
    char *chip_model = get_chip_model(&this_chip_info);

    cJSON_AddItemToObject(chip_info, "chip_type", cJSON_CreateString(chip_model));
    free(chip_model);

    // app descriptiong
    const esp_app_desc_t *app_info = esp_app_get_description();

    cJSON *app_desc = cJSON_CreateObject();
    cJSON_AddItemToObject(root, "app_info", app_desc);
    cJSON_AddNumberToObject(app_desc, "secure_ver", app_info->secure_version);
    cJSON_AddStringToObject(app_desc, "app_ver", app_info->version);
    cJSON_AddStringToObject(app_desc, "proj_name", app_info->project_name);
    cJSON *compile_info = cJSON_CreateObject();
    cJSON_AddItemToObject(app_desc, "compile_info", compile_info);
    cJSON_AddStringToObject(compile_info, "time", app_info->time);
    cJSON_AddStringToObject(compile_info, "date", app_info->date);
    cJSON_AddStringToObject(compile_info, "idf_ver", app_info->idf_ver);

    //  cJSON_AddStringToObject(root, "reset_reason", get_reset_reason());

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}

//------------network information
// wifi status
// ip address
// mac address
// ssid
// signal strength
// connected devices
// mdns name

char *node_info_get_network_sta_info_json()
{

    // cJSON_AddStringToObject(root, "reset_reason", get_reset_reason());
    char *ipInfoJSON = (char *)malloc(sizeof(char) * 200);
    memset(ipInfoJSON, 0, 200);

    char ip[IP4ADDR_STRLEN_MAX];
    char netmask[IP4ADDR_STRLEN_MAX];
    char gw[IP4ADDR_STRLEN_MAX];

    wifi_ap_record_t wifi_data;
    ESP_ERROR_CHECK(esp_wifi_sta_get_ap_info(&wifi_data));
    char *ssid = (char *)wifi_data.ssid;
    int8_t rssi = wifi_data.rssi;

    esp_netif_ip_info_t ip_info;

    ESP_ERROR_CHECK(esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_STA_DEF"), &ip_info));
    esp_ip4addr_ntoa(&ip_info.ip, ip, IP4ADDR_STRLEN_MAX);
    esp_ip4addr_ntoa(&ip_info.netmask, netmask, IP4ADDR_STRLEN_MAX);
    esp_ip4addr_ntoa(&ip_info.gw, gw, IP4ADDR_STRLEN_MAX);

    cJSON *root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "ip", ip);
    cJSON_AddStringToObject(root, "netmask", netmask);
    cJSON_AddStringToObject(root, "gw", gw);
    cJSON_AddStringToObject(root, "ap", ssid);
    cJSON_AddNumberToObject(root, "rssi", rssi);

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;

    return ipInfoJSON;
}

char *node_info_get_network_ap_info_json()
{

    cJSON *root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "ap_ssid", ESP_WIFI_AP_MODE_SSID);
    cJSON_AddNumberToObject(root, "ap_channel", ESP_WIFI_AP_MODE_CHANNEL);
    cJSON_AddStringToObject(root, "ap_pass", ESP_WIFI_AP_MODE_PASSWORD);
    cJSON_AddNumberToObject(root, "ap_max_connect", MAX_AP_STA_MODE_CONN);

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}
//-----------------system health
// available ram at boot

// memory usage
// heap memory

// heap descirption
// last reset reason

char *node_info_get_system_health_info_json()
{

    cJSON *root = cJSON_CreateObject();
    cJSON *memory_info = cJSON_CreateObject();
    cJSON *life_cycle = cJSON_CreateObject();

    // memory specific
    cJSON_AddItemToObject(root, "memory_info", memory_info);

    cJSON_AddNumberToObject(memory_info, "free_heap", esp_get_free_internal_heap_size());
    cJSON_AddNumberToObject(memory_info, "min_free_heap", esp_get_minimum_free_heap_size());

    // system life
    cJSON_AddItemToObject(root, "life_cycle", life_cycle);

    // uptime
    cJSON *uptime = cJSON_CreateObject();
    cJSON_AddItemToObject(life_cycle, "uptime", uptime);
    cJSON_AddNumberToObject(uptime, "uptime", (esp_timer_get_time() / 1000));
    cJSON_AddStringToObject(uptime, "unit", "ms");

    // reset-reason
    char *reset_reason = get_reset_reason();

    cJSON_AddItemToObject(life_cycle, "reset_reason", cJSON_CreateString(reset_reason));
    free(reset_reason);

    char *json_string = cJSON_Print(root);

    cJSON_Delete(root);
    return json_string;
}

static char *get_reset_reason()
{
    int8_t malloced_str_len = 60;
    char *reset_reason = (char *)malloc(sizeof(char) * malloced_str_len);

    switch (esp_reset_reason())
    {
    case ESP_RST_POWERON:
        strncpy(reset_reason, "Reset due to power-on event.", malloced_str_len - 1);
        break;

    case ESP_RST_EXT:
        strncpy(reset_reason, "Reset by external pin (not applicable for ESP32)", malloced_str_len - 1);
        break;

    case ESP_RST_SW:
        strncpy(reset_reason, "Software reset via esp_restart.", malloced_str_len - 1);
        break;

    case ESP_RST_PANIC:
        strncpy(reset_reason, "Software reset due to exception/panic.", malloced_str_len - 1);
        break;

    case ESP_RST_INT_WDT:
        strncpy(reset_reason, "Reset (software or hardware) due to interrupt watchdog.", malloced_str_len - 1);
        break;

    case ESP_RST_TASK_WDT:
        strncpy(reset_reason, "Reset due to task watchdog.", malloced_str_len - 1);
        break;

    case ESP_RST_WDT:
        strncpy(reset_reason, "Reset due to other watchdogs.", malloced_str_len - 1);
        break;

    case ESP_RST_DEEPSLEEP:
        strncpy(reset_reason, "Reset after exiting deep sleep mode.", malloced_str_len - 1);
        break;

    case ESP_RST_BROWNOUT:
        strncpy(reset_reason, "Brownout reset (software or hardware)", malloced_str_len - 1);
        break;

    case ESP_RST_SDIO:
        strncpy(reset_reason, "Reset over SDIO.", malloced_str_len - 1);
        break;

    default:
        strncpy(reset_reason, "Reset reason can not be determined.", malloced_str_len - 1);
    }

    reset_reason[sizeof(reset_reason) - 1] = '\0';

    return reset_reason;
}

static char *get_chip_model(esp_chip_info_t *chip_info)
{
    int8_t malloced_str_len = 15;
    char *chip_model = (char *)malloc(sizeof(char) * malloced_str_len);

    switch (chip_info->model)
    {

    case CHIP_ESP32:
        strncpy(chip_model, "ESP32", malloced_str_len - 1);
        break;

    case CHIP_ESP32S2:
        strncpy(chip_model, "ESP32-S2", malloced_str_len - 1);
        break;

    case CHIP_ESP32S3:
        strncpy(chip_model, "ESP32-S3", malloced_str_len - 1);
        break;

    case CHIP_ESP32C3:
        strncpy(chip_model, "ESP32-C3", malloced_str_len - 1);
        break;

    case CHIP_ESP32C2:
        strncpy(chip_model, "ESP32-C2", malloced_str_len - 1);
        break;

    case CHIP_ESP32C6:
        strncpy(chip_model, "ESP32-C6", malloced_str_len - 1);
        break;

    case CHIP_ESP32H2:
        strncpy(chip_model, "ESP32-H2", malloced_str_len - 1);
        break;

    case CHIP_ESP32P4:
        strncpy(chip_model, "ESP32-P4.", malloced_str_len - 1);
        break;

    case CHIP_POSIX_LINUX:
        strncpy(chip_model, "POSIX/Linux", malloced_str_len - 1);
        break;
    }

    chip_model[sizeof(chip_model) - 1] = '\0';

    return chip_model;
}
