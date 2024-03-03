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
#include "network_components/esp_now_comm.h"
#include "task_common.h"

#include "module_config.h"
#include "node_info.h"
#include "nvs_service.h"
#include "sensor_components/sensor_tasks.h"

#define MAX_TEMP_SENSORS 5  // Assuming 10 is the maximum you support
#define SQL_ID_SYNC_VAL 1

//COMPLETED - make state in kconfig to allow for nvs update
// check if enable_nvs_update is enabled if it is write config files to nvs by additionally serializing each sensor loc array and adding it to nvs
// add sensor arr ot global mmodule info, get and desialize one list at a time if it exists, store to temp **arr loop through getting string length, adding total length to sum, add \0 allocate memorary
// copy in place to struct
//TODO: create dynamical allocated global struct that has all config data and use in rest of project
/**
 * this allows for ota update based without having to explicitly set each sdkconfig for each different setting
 * k config file will allow for dynamic size arrays in nvs based on config settings for sensor locations
*/
//TODO: update code base to reflect use of using global variable



#ifdef CONFIG_ENABLE_NVS_UPDATE
const bool UPDATE_NVS = true;
#else
const bool UPDATE_NVS = false;
#endif

const char TAG [] = "module_config";

void initiate_config(){


    //set node info and log
    esp_err_t err;


    //TODO: change name to not confuse with temperature/temporary
    Module_info_t temp_info = {0};

    int8_t tempArr[SENSOR_LIST_TOTAL];
    int8_t tempArrLength = 0;

    

    if(UPDATE_NVS){
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


        const int8_t sensor_arr[SENSOR_LIST_TOTAL] = {
                        CONFIG_SENSOR_TEMP,
                        CONFIG_SENSOR_HUMIDITY,
                        CONFIG_SENSOR_SOIL_MOISTURE,
                        CONFIG_SENSOR_LIGHT,
                        CONFIG_SENSOR_SOUND,
                        CONFIG_SENSOR_MOVEMENT,
                        CONFIG_SENSOR_CAMERA,
                        };



        //one more as list start at index 1 with 0=null for sql sync
        //TODO: roll into generic sensor_struct_t and sensor queue
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

        //check for existing module info data change
    

        ESP_LOGI(TAG,"{==nvs info==}\n%s\n", node_info_get_module_info_json());

        //TODO: roll this into sensor queue
        //TODO: since sensor_struct will be generic for all sensors, initiate for all
        //          of the different config_sensors
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
            //node only;
        #elif CONFIG_MODULE_TYPE_CONTROLLER
            //sd and db_init
            spi_sd_card_init();
            //sd_db_init();
        #else
            ESP_LOGE(TAG, "module type not selected, use menuconfig");
        #endif

        //common to both node and controller
        initiate_sensor_queue();
        initiate_sensor_tasks();
        esp_now_comm_start();


    }else{

    }


    

  

}

void initiate_sensor_tasks(){

    for(Sensor_List sensor_type = TEMP; sensor_type < SENSOR_LIST_TOTAL; sensor_type++){
        for(int sensor = 1; sensor < sensor_arr[sensor_type]+SQL_ID_SYNC_VAL; sensor++){
            switch(sensor_type){
                case TEMP:
	                ESP_LOGI(TAG, "Started Internal Temp Sensor: Id: #%d, Location: %s", sensor, dht22_sensor_arr[sensor].TAG);
                    char sensor_task_name[20];
                    //TODO: add internal keyword to taskname
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