#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "esp_err.h"
#include "cJSON.h"

#include "node_info.h"
#include "nvs_service.h"
#include "sensor_components/sensor_tasks.h"

static const char NODE_INFO_TAG[] = "node_info";

void node_info_log_module_info(void){
    Module_info_t module_info = {0};
    esp_err_t err;

    err = nvs_get_module_info(&module_info);

    if(err == ESP_OK){
        ESP_LOGI(NODE_INFO_TAG, "Module info-> Type: %s | Location: %s | Identifier: %d", module_info.type, module_info.location, module_info.identity );
    }else{
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }
}



char *node_info_get_module_info_json(void){

    extern Module_info_t *module_info_gt;

    cJSON *root = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();

    cJSON *sensor_list = cJSON_CreateObject();


    cJSON_AddStringToObject(module_info, "type", module_info_gt->type);
    cJSON_AddStringToObject(module_info, "location", module_info_gt->location);
    cJSON_AddNumberToObject(module_info, "identifier", module_info_gt->identity);

    cJSON_AddItemToObject(root, "module_info", module_info);


    for(int i = 0; i < SENSOR_LIST_TOTAL; i++){
        switch(i){
            case 0:
                cJSON_AddNumberToObject(sensor_list, "temp", module_info_gt->sensor_arr[i]);
                break;
            case 1:
                cJSON_AddNumberToObject(sensor_list, "humidity", module_info_gt->sensor_arr[i]);
                break;
            case 2:
                cJSON_AddNumberToObject(sensor_list, "soil_moisture", module_info_gt->sensor_arr[i]);
                break;
            case 3:
                cJSON_AddNumberToObject(sensor_list, "light", module_info_gt->sensor_arr[i]);
                break;
            case 4:
                cJSON_AddNumberToObject(sensor_list, "sound", module_info_gt->sensor_arr[i]);
                break;
            case 5:
                cJSON_AddNumberToObject(sensor_list, "movement", module_info_gt->sensor_arr[i]);
                break;
            case 6:
                cJSON_AddNumberToObject(sensor_list, "cam", module_info_gt->sensor_arr[i]);
                break;
            default:
                cJSON_AddNumberToObject(sensor_list, "unknown", module_info_gt->sensor_arr[i]);
                break;
        }
    }


    cJSON_AddItemToObject(root, "sensor_list", sensor_list);

     cJSON *sensor_type_list;
     cJSON *sensor_type_pin_list;

    for(Sensor_List sensor = DHT22; sensor < SENSOR_LIST_TOTAL; sensor++){
        sensor_type_list = cJSON_CreateObject();
        char i_str[5];


        for(int i = 0; i < module_info_gt->sensor_arr[sensor]; i++){
            sprintf(i_str, "%d", i);
            cJSON_AddStringToObject(sensor_type_list,i_str,
                module_info_gt->sensor_config_arr[i]->sensor_loc_arr[i]);
        }

        cJSON_AddItemToObject(root, sensor_type_to_string(sensor), sensor_type_list);


        sensor_type_pin_list = cJSON_CreateObject();
        for(int i = 0; i < module_info_gt->sensor_arr[sensor]; i++){
             cJSON_AddNumberToObject(sensor_type_pin_list, i_str,
                module_info_gt->sensor_config_arr[i]->sensor_pin_arr[i]);
        }

        cJSON_AddItemToObject(root, sensor_type_to_string(sensor), sensor_type_pin_list);

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
                case 0:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tTemp: %d\n", sensor_list[i]);
                    break;
                case 1:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tHumidity: %d\n", sensor_list[i]);
                    break;
                case 2:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tSoil Moisture: %d\n", sensor_list[i]);
                    break;
                case 3:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tLight: %d\n", sensor_list[i]);
                    break;
                case 4:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tSound: %d\n", sensor_list[i]);
                    break;
                case 5:
                    snprintf(sensor_info_str + strlen(sensor_info_str), sizeof(sensor_info_str) - strlen(sensor_info_str), "\tMovement: %d\n", sensor_list[i]);
                    break;
                case 6:
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