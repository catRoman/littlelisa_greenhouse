#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "sdkconfig.h"
#include "esp_log.h"
#include "database_components/sd_card_db.h"
#include "module_components/spi_sd_card.h"
#include "sensor_components/DHT22.h"
#include "task_common.h"

#include "module_config.h"
#include "node_info.h"
#include "nvs_service.h"
#include "sensor_components/sensor_tasks.h"

#define MAX_TEMP_SENSORS 5  // Assuming 10 is the maximum you support
#define SQL_ID_SYNC_VAL 1

//to match sql table id with sensor
const char* dht22_sensor_locations[MAX_TEMP_SENSORS + SQL_ID_SYNC_VAL] = {
    "Intentialy Empty",
    #ifdef CONFIG_SENSOR_TEMP_1_LOCATION
    CONFIG_SENSOR_TEMP_1_LOCATION,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_2_LOCATION
    CONFIG_SENSOR_TEMP_2_LOCATION,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_3_LOCATION
    CONFIG_SENSOR_TEMP_3_LOCATION,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_4_LOCATION
    CONFIG_SENSOR_TEMP_4_LOCATION,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_5_LOCATION
    CONFIG_SENSOR_TEMP_5_LOCATION,
    #endif
};

//to match sql table id with sensor
const int dht22_pin_number[MAX_TEMP_SENSORS + SQL_ID_SYNC_VAL] = {
    0, //initaly empty
    #ifdef CONFIG_SENSOR_TEMP_1_PIN
    CONFIG_SENSOR_TEMP_1_PIN,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_2_PIN
    CONFIG_SENSOR_TEMP_2_PIN,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_3_PIN
    CONFIG_SENSOR_TEMP_3_PIN,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_4_PIN
    CONFIG_SENSOR_TEMP_4_PIN,
    #endif
    #ifdef CONFIG_SENSOR_TEMP_5_PIN
    CONFIG_SENSOR_TEMP_5_PIN,
    #endif
};

const char TAG [] = "module_config";

 const int8_t sensor_arr[SENSOR_LIST_TOTAL] = {CONFIG_SENSOR_TEMP,  
                        CONFIG_SENSOR_HUMIDITY,  
                        CONFIG_SENSOR_SOIL_MOISTURE,  
                        CONFIG_SENSOR_LIGHT,  
                        CONFIG_SENSOR_SOUND,  
                        CONFIG_SENSOR_MOVEMENT, 
                        CONFIG_SENSOR_CAMERA,  
                        };

//one more as list start at index 1 with 0=null for sql sync
dht22_sensor_t dht22_sensor_arr[CONFIG_SENSOR_TEMP + SQL_ID_SYNC_VAL] = {0};

#ifdef CONFIG_MODULE_TYPE_CONTROLLER
    Module_info_t module_info_g = {
        .type = "Controller",
        .location = CONFIG_MODULE_LOCATION,
        .identity = CONFIG_MODULE_IDENTITY
    };
#elif CONFIG_MODULE_TYPE_NODE
    Module_info_t module_info_g = {
            .type = "Node",
            .location = CONFIG_MODULE_LOCATION,
            .identity = CONFIG_MODULE_IDENTITY
        };
#else
    ESP_LOGE(TAG, "module type not selected, use menuconfig");
    Module_info_t module_info_g = {0};
#endif


void initiate_config(){

   
    //set node info and log
    esp_err_t err;

    Module_info_t temp_info = {0};
    
    int8_t tempArr[SENSOR_LIST_TOTAL];
    int8_t tempArrLength = 0;

    //check for existing module info data change
    if((err=nvs_get_module_info(&temp_info)) != ESP_OK){
        ESP_LOGI(TAG, "%s", esp_err_to_name(err));
        nvs_set_module(module_info_g.type, module_info_g.location, module_info_g.identity);
    }else if(err == ESP_OK){
        if((strcmp(temp_info.type, module_info_g.type) == 0) &&
            (strcmp(temp_info.location, module_info_g.location) == 0) &&
            (temp_info.identity == module_info_g.identity)){
                ESP_LOGI(TAG, "nvs module info has not changed since last write");
            }else{
                nvs_set_module(module_info_g.type, module_info_g.location, module_info_g.identity);
            }
    }

    //check for existing senor array data change
    if((err = nvs_get_sensor_arr(&tempArr, &tempArrLength)) != ESP_OK){
        ESP_LOGI(TAG, "%s", esp_err_to_name(err));
        nvs_set_sensor_arr(&sensor_arr, SENSOR_LIST_TOTAL);
    }else if(err == ESP_OK){
        if(tempArrLength != SENSOR_LIST_TOTAL){
            ESP_LOGE(TAG, "nvs retrieved sensor length mismatch");
            
        }else{
            for(int i =0; i < SENSOR_LIST_TOTAL; i++){
                if(tempArr[i] != sensor_arr[i]){
                    nvs_set_sensor_arr(&sensor_arr, SENSOR_LIST_TOTAL);
                    break;
                }
                ESP_LOGI(TAG, "sensor list info has not changed since last write");
            }
        }
    }

    ESP_LOGI(TAG,"{==nvs info==}\n%s\n", node_info_get_module_info_json());

    //starts from 1 to allows for sync with sql data base id eventualy, leaves [0] as null
    for(int i = 1; i <= CONFIG_SENSOR_TEMP; i++){
        dht22_sensor_arr[i].pin_number = dht22_pin_number[i];
        dht22_sensor_arr[i].temperature = 0.0f;
        dht22_sensor_arr[i].temp_unit = "C";
        dht22_sensor_arr[i].humidity = 0.0f;
        dht22_sensor_arr[i].humidity_unit = "%";
        dht22_sensor_arr[i].TAG = malloc(strlen(dht22_sensor_locations[i]) + 1);
        if (dht22_sensor_arr[i].TAG != NULL){
            strcpy(dht22_sensor_arr[i].TAG, dht22_sensor_locations[i]);
        }else{
            ESP_LOGE(TAG, "Error allocation memory for sensor location tag");
        }
        dht22_sensor_arr[i].identifier = i;
    }


    #ifdef CONFIG_MODULE_TYPE_NODE
        initiate_sensor_tasks();
    #elif CONFIG_MODULE_TYPE_CONTROLLER
        //sd and db_init
        spi_sd_card_init();
        //sd_db_init();
        initiate_sensor_tasks();
    #else
        ESP_LOGE(TAG, "module type not selected, use menuconfig");
    #endif
}

void initiate_sensor_tasks(){
    
    for(Sensor_List sensor_type = TEMP; sensor_type < SENSOR_LIST_TOTAL; sensor_type++){
        for(int sensor = 1; sensor < sensor_arr[sensor_type]+SQL_ID_SYNC_VAL; sensor++){
            switch(sensor_type){
                case TEMP:
	                ESP_LOGI(TAG, "Started Temp Sensor: Id: #%d, Location: %s", sensor, dht22_sensor_arr[sensor].TAG);
                    char sensor_task_name[20];
                    snprintf(sensor_task_name, sizeof(sensor_task_name), "temp_sensor_%d", dht22_sensor_arr[sensor].identifier);
                    xTaskCreatePinnedToCore(DHT22_task, sensor_task_name, DHT22_TASK_STACK_SIZE, (void *)&dht22_sensor_arr[sensor], DHT22_TASK_PRIORITY, NULL, DHT22_TASK_CORE_ID);
                    break;
                case HUMIDITY:
                    //current using dht22 which is dual temp/humidity no extra task needed
	                ESP_LOGI(TAG, "Started Humidity Sensor: Id #%d, Location: %s", sensor, dht22_sensor_arr[sensor].TAG);
                    break;
                case SOIL_MOISTURE:
	                ESP_LOGE(TAG, "Trying to access non existant sensor tasks, error in sensor list");
                    break;
                case LIGHT:
	                ESP_LOGE(TAG, "Trying to access non existant sensor tasks, error in sensor list");
                    break;
                case SOUND:
	                ESP_LOGE(TAG, "Trying to access non existant sensor tasks, error in sensor list");
                    break;
                case MOVEMENT:
	                ESP_LOGE(TAG, "Trying to access non existant sensor tasks, error in sensor list");
                    break;
                case CAMERA:
	                ESP_LOGE(TAG, "Trying to access non existant sensor tasks, error in sensor list");
                    break;
                default:
                    ESP_LOGE(TAG, "sensor list length mismatch error");
            }
        }
    }

}