#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "esp_err.h"
#include "cJSON.h"

#include "node_info.h"
#include "nvs_service.h"

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

void node_info_log_node_list(void){
    int8_t *node_list = NULL;
    int8_t nodeLength = 0xff;

    esp_err_t err;

    err = nvs_get_node_arr(&node_list, &nodeLength);


    char node_info_str[200] = "Node List:\n";
    if(err == ESP_OK && node_list != NULL){
        for(int i = 0; i < nodeLength; i++){
            if(i == 0){
                snprintf(node_info_str + strlen(node_info_str), sizeof(node_info_str) - strlen(node_info_str), "\tLocal-> # %d:\n", node_list[i]);
            }else{
                snprintf(node_info_str + strlen(node_info_str), sizeof(node_info_str) - strlen(node_info_str), "\tNode-> # %d:\n", node_list[i]);

            } //TODO: add node info here
            }
        ESP_LOGI(NODE_INFO_TAG, "%s", node_info_str);
    }else{
        ESP_LOGE(NODE_INFO_TAG, "%s", esp_err_to_name(err));
    }

}

char *node_info_get_module_info_json(void){
    Module_info_t module_info_t = {0};
    int8_t *sensor_arr = NULL;
    
    int8_t sensorArrLength = 0;
    

    ESP_ERROR_CHECK(nvs_get_module_info(&module_info_t));
    ESP_ERROR_CHECK(nvs_get_sensor_arr(&sensor_arr, &sensorArrLength));
    

    
    cJSON *root = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();
    
    cJSON *sensor_list = cJSON_CreateObject();

    cJSON_AddStringToObject(module_info, "type", module_info_t.type);
    cJSON_AddStringToObject(module_info, "location", module_info_t.location);
    cJSON_AddNumberToObject(module_info, "identifier", module_info_t.identity);

    cJSON_AddItemToObject(root, "module_info", module_info);


    for(int i = 0; i < sensorArrLength; i++){
        switch(i){
            case 0:
                cJSON_AddNumberToObject(sensor_list, "temp", sensor_arr[i]);
                break; 
            case 1:
                cJSON_AddNumberToObject(sensor_list, "humidity", sensor_arr[i]);
                break;
            case 2:
                cJSON_AddNumberToObject(sensor_list, "soil_moisture", sensor_arr[i]);
                break;
            case 3:
                cJSON_AddNumberToObject(sensor_list, "light", sensor_arr[i]);
                break;
            case 4:
                cJSON_AddNumberToObject(sensor_list, "sound", sensor_arr[i]);
                break;
            case 5:
                cJSON_AddNumberToObject(sensor_list, "movement", sensor_arr[i]);
                break;
            case 6:
                cJSON_AddNumberToObject(sensor_list, "cam", sensor_arr[i]);
                break;
            default:
                cJSON_AddNumberToObject(sensor_list, "unknown", sensor_arr[i]);
                break;
        }
    }

    cJSON_AddItemToObject(root, "sensor_list", sensor_list);

   

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