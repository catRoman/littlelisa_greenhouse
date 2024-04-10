#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "esp_err.h"
#include "cJSON.h"
#include "esp_wifi_types.h"
#include "esp_wifi.h"

//components
#include "node_info.h"
#include "nvs_service.h"
#include "sensor_tasks.h"

static const char NODE_INFO_TAG[] = "node_info";

void node_info_log_module_info(void){
    Module_info_t module_info = {0};
    esp_err_t err;

    err = nvs_get_module_info(&module_info);

    if(err == ESP_OK){
        ESP_LOGI(NODE_INFO_TAG, "Module info-> Type: %s | Location: %s | Identifier: %s", module_info.type, module_info.location, module_info.identity );
    }else{
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }
}

char *node_info_get_controller_sta_list_json(void){
    wifi_sta_list_t node_list;
    ESP_ERROR_CHECK_WITHOUT_ABORT(esp_wifi_ap_get_sta_list(&node_list));


    cJSON *root = cJSON_CreateObject();
    cJSON *sta_list = cJSON_CreateObject();

   cJSON_AddNumberToObject(root, "length", node_list.num);

    cJSON_AddItemToObject(root, "sta_list", sta_list);


    char mac_addr[20];

    for(int i = 0; i < node_list.num; i++){
        snprintf(mac_addr, sizeof(mac_addr), "%02x:%02x:%02x:%02x:%02x:%02x", node_list.sta[i].mac[0], node_list.sta[i].mac[1], node_list.sta[i].mac[2], node_list.sta[i].mac[3], node_list.sta[i].mac[4], node_list.sta[i].mac[5]);
        cJSON_AddNumberToObject(sta_list, mac_addr,
                    node_list.sta->rssi);
    }

    return cJSON_Print(root);

}

char *node_info_get_module_info_json(void){
    //name, type,location, sensor arr, sensor config arr

    extern Module_info_t *module_info_gt;

    cJSON *root = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();

    cJSON *sensor_list = cJSON_CreateObject();


    cJSON_AddStringToObject(module_info, "type", module_info_gt->type);
    cJSON_AddStringToObject(module_info, "location", module_info_gt->location);
    cJSON_AddStringToObject(module_info, "identifier", module_info_gt->identity);

    cJSON_AddItemToObject(root, "module_info", module_info);


    for(int i = 0; i < SENSOR_LIST_TOTAL; i++){
        switch(i){
            case DHT22:
                cJSON_AddNumberToObject(sensor_list, "DHT22", module_info_gt->sensor_arr[i]);
                break;
            case SOIL_MOISTURE:
                cJSON_AddNumberToObject(sensor_list, "soil_moisture", module_info_gt->sensor_arr[i]);
                break;
            case LIGHT:
                cJSON_AddNumberToObject(sensor_list, "light", module_info_gt->sensor_arr[i]);
                break;
            case SOUND:
                cJSON_AddNumberToObject(sensor_list, "sound", module_info_gt->sensor_arr[i]);
                break;
            case MOVEMENT:
                cJSON_AddNumberToObject(sensor_list, "movement", module_info_gt->sensor_arr[i]);
                break;
            case CAMERA:
                cJSON_AddNumberToObject(sensor_list, "cam", module_info_gt->sensor_arr[i]);
                break;
            default:
                cJSON_AddNumberToObject(sensor_list, "unknown", module_info_gt->sensor_arr[i]);
                break;
        }
    }


    cJSON_AddItemToObject(root, "sensor_list", sensor_list);


     cJSON *sensor_type_pin_list;

    for(Sensor_List sensor = DHT22; sensor < SENSOR_LIST_TOTAL; sensor++){
        cJSON *sensor_type_list = cJSON_CreateObject();

        if(module_info_gt->sensor_arr[sensor] > 0){

            sensor_type_pin_list = cJSON_CreateObject();
            for(int i = 1; i <= module_info_gt->sensor_arr[sensor]; i++){
                cJSON_AddNumberToObject(sensor_type_pin_list, module_info_gt->sensor_config_arr[sensor]->sensor_loc_arr[i],
                    module_info_gt->sensor_config_arr[sensor]->sensor_pin_arr[i]);
            }

            cJSON_AddItemToObject(root, sensor_type_to_string(sensor), sensor_type_pin_list);

        }
    }
    return cJSON_Print(root);

}
void node_info_log_sensor_list(void){
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
    if(err == ESP_OK && sensor_list != NULL){
        for(int i = 0; i < sensorLength; i++){
            switch(i){
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
    }else{
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }

}