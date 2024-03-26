#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "sdkconfig.h"
#include "esp_log.h"
#include "esp_err.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_mac.h"


//components
#include "module_config.h"
#include "node_info.h"
#include "nvs_service.h"
#include "sensor_tasks.h"
#include "helper.h"
#include "wifi_ap_sta.h"
#include "websocket_server.h"
#include "sd_card_db.h"
#include "spi_sd_card.h"
#include "DHT22.h"
#include "esp_now_comm.h"
#include "wifi_ap_sta.h"
#include "task_common.h"





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

Module_info_t *module_info_gt = NULL;

void initiate_config(){





    //initiate
    nvs_initiate();

    if(UPDATE_NVS){
        #ifdef CONFIG_ENABLE_NVS_UPDATE
        int8_t sensor_arr[SENSOR_LIST_TOTAL] = {
                        CONFIG_SENSOR_DHT22,
                        CONFIG_SENSOR_SOIL_MOISTURE,
                        CONFIG_SENSOR_LIGHT,
                        CONFIG_SENSOR_SOUND,
                        CONFIG_SENSOR_MOVEMENT,
                        CONFIG_SENSOR_CAMERA,
                        };
        #else
        int8_t sensor_arr[SENSOR_LIST_TOTAL] = {0};
    #endif
        //to match sql table id with sensor
        char* dht22_sensor_locations[sensor_arr[DHT22] + SQL_ID_SYNC_VAL];
            dht22_sensor_locations[0]= "DHT22";
            #ifdef CONFIG_SENSOR_DHT22_1_LOCATION
            dht22_sensor_locations[1]= CONFIG_SENSOR_DHT22_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_2_LOCATION
            dht22_sensor_locations[2]= CONFIG_SENSOR_DHT22_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_3_LOCATION
            dht22_sensor_locations[3]= CONFIG_SENSOR_DHT22_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_4_LOCATION
            dht22_sensor_locations[4]= CONFIG_SENSOR_DHT22_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_5_LOCATION
            dht22_sensor_locations[5]= CONFIG_SENSOR_DHT22_5_LOCATION;
            #endif


        //to match sql table id with sensor
        int8_t dht22_sensor_pin_number[sensor_arr[DHT22] + SQL_ID_SYNC_VAL];
            dht22_sensor_pin_number[0] = 0; //initaly empty
            #ifdef CONFIG_SENSOR_DHT22_1_PIN
            dht22_sensor_pin_number[1] = CONFIG_SENSOR_DHT22_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_2_PIN
            dht22_sensor_pin_number[2] = CONFIG_SENSOR_DHT22_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_3_PIN
            dht22_sensor_pin_number[3] = CONFIG_SENSOR_DHT22_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_4_PIN
            dht22_sensor_pin_number[4] = CONFIG_SENSOR_DHT22_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_DHT22_5_PIN
            dht22_sensor_pin_number[5] = CONFIG_SENSOR_DHT22_5_PIN;
            #endif

        Module_sensor_config_t *dht22_sensor_config =
        createModuleSensorConfig(
                dht22_sensor_locations,
                dht22_sensor_pin_number,
                sensor_arr[DHT22]+ SQL_ID_SYNC_VAL);


           //to match sql table id with sensor
        char* soil_moisture_sensor_locations[sensor_arr[SOIL_MOISTURE] + SQL_ID_SYNC_VAL];
            soil_moisture_sensor_locations[0] = "SOIL_MOISTURE";
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_1_LOCATION
            soil_moisture_sensor_locations[1] = CONFIG_SENSOR_SOIL_MOISTURE_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_2_LOCATION
            soil_moisture_sensor_locations[2] = CONFIG_SENSOR_SOIL_MOISTURE_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_3_LOCATION
            soil_moisture_sensor_locations[3] = CONFIG_SENSOR_SOIL_MOISTURE_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_4_LOCATION
            soil_moisture_sensor_locations[4] = CONFIG_SENSOR_SOIL_MOISTURE_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_5_LOCATION
            soil_moisture_sensor_locations[5] = CONFIG_SENSOR_SOIL_MOISTURE_5_LOCATION;
            #endif



        //to match sql table id with sensor
        int8_t soil_moisture_sensor_pin_number[sensor_arr[SOIL_MOISTURE] + SQL_ID_SYNC_VAL];
            soil_moisture_sensor_pin_number[0] = 0; //initaly empty
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_1_PIN
            soil_moisture_sensor_pin_number[1] = CONFIG_SENSOR_SOIL_MOISTURE_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_2_PIN
            soil_moisture_sensor_pin_number[2] = CONFIG_SENSOR_SOIL_MOISTURE_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_3_PIN
            soil_moisture_sensor_pin_number[3] = CONFIG_SENSOR_SOIL_MOISTURE_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_4_PIN
            soil_moisture_sensor_pin_number[4] = CONFIG_SENSOR_SOIL_MOISTURE_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_5_PIN
            soil_moisture_sensor_pin_number[5] = CONFIG_SENSOR_SOIL_MOISTURE_5_PIN;
            #endif


        Module_sensor_config_t *soil_moisture_sensor_config =
        createModuleSensorConfig(
                soil_moisture_sensor_locations,
                soil_moisture_sensor_pin_number,
                sensor_arr[SOIL_MOISTURE]+ SQL_ID_SYNC_VAL);


            //to match sql table id with sensor
        char* light_sensor_locations[sensor_arr[LIGHT] + SQL_ID_SYNC_VAL];
            light_sensor_locations[0] = "LIGHT";
            #ifdef CONFIG_SENSOR_LIGHT_1_LOCATION
            light_sensor_locations[1] = CONFIG_SENSOR_LIGHT_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_2_LOCATION
            light_sensor_locations[2] = CONFIG_SENSOR_LIGHT_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_3_LOCATION
            light_sensor_locations[3] = CONFIG_SENSOR_LIGHT_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_4_LOCATION
            light_sensor_locations[4] = CONFIG_SENSOR_LIGHT_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_5_LOCATION
            light_sensor_locations[5] = CONFIG_SENSOR_LIGHT_5_LOCATION;
            #endif



        //to match sql table id with sensor
        int8_t light_sensor_pin_number[sensor_arr[LIGHT] + SQL_ID_SYNC_VAL];
            light_sensor_pin_number[0] = 0; //initaly empty
            #ifdef CONFIG_SENSOR_LIGHT_1_PIN
            light_sensor_pin_number[1] = CONFIG_SENSOR_LIGHT_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_2_PIN
            light_sensor_pin_number[2] = CONFIG_SENSOR_LIGHT_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_3_PIN
            light_sensor_pin_number[3] = CONFIG_SENSOR_LIGHT_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_4_PIN
            light_sensor_pin_number[4] = CONFIG_SENSOR_LIGHT_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_LIGHT_5_PIN
            light_sensor_pin_number[5] = CONFIG_SENSOR_LIGHT_5_PIN;
            #endif

        Module_sensor_config_t *light_sensor_config =
        createModuleSensorConfig(
                light_sensor_locations,
                light_sensor_pin_number,
                sensor_arr[LIGHT]+ SQL_ID_SYNC_VAL);

            //to match sql table id with sensor
        char* sound_sensor_locations[sensor_arr[SOUND] + SQL_ID_SYNC_VAL];
            sound_sensor_locations[0] = "SOUND";
            #ifdef CONFIG_SENSOR_SOUND_1_LOCATION
            sound_sensor_locations[1] = CONFIG_SENSOR_SOUND_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_2_LOCATION
            sound_sensor_locations[2] = CONFIG_SENSOR_SOUND_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_3_LOCATION
            sound_sensor_locations[3] = CONFIG_SENSOR_SOUND_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_4_LOCATION
            sound_sensor_locations[4] = CONFIG_SENSOR_SOUND_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_5_LOCATION
            sound_sensor_locations[5] = CONFIG_SENSOR_SOUND_5_LOCATION;
            #endif



        //to match sql table id with sensor
        int8_t sound_sensor_pin_number[sensor_arr[SOUND] + SQL_ID_SYNC_VAL];
            sound_sensor_pin_number[0] = 0; //initaly empty
            #ifdef CONFIG_SENSOR_SOUND_1_PIN
            sound_sensor_pin_number[1] = CONFIG_SENSOR_SOUND_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_2_PIN
            sound_sensor_pin_number[2] = CONFIG_SENSOR_SOUND_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_3_PIN
            sound_sensor_pin_number[3] = CONFIG_SENSOR_SOUND_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_4_PIN
            sound_sensor_pin_number[4] = CONFIG_SENSOR_SOUND_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOUND_5_PIN
            sound_sensor_pin_number[5] = CONFIG_SENSOR_SOUND_5_PIN;
            #endif

        Module_sensor_config_t *sound_sensor_config =
        createModuleSensorConfig(
                sound_sensor_locations,
                sound_sensor_pin_number,
                sensor_arr[SOUND]+ SQL_ID_SYNC_VAL);

            //to match sql table id with sensor
        char* movement_sensor_locations[sensor_arr[MOVEMENT] + SQL_ID_SYNC_VAL];
            movement_sensor_locations[0] = "MOVEMENT";
            #ifdef CONFIG_SENSOR_MOVEMENT_1_LOCATION
            movement_sensor_locations[1] = CONFIG_SENSOR_MOVEMENT_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_2_LOCATION
            movement_sensor_locations[2] = CONFIG_SENSOR_MOVEMENT_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_3_LOCATION
            movement_sensor_locations[3] = CONFIG_SENSOR_MOVEMENT_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_4_LOCATION
            movement_sensor_locations[4] = CONFIG_SENSOR_MOVEMENT_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_5_LOCATION
            movement_sensor_locations[5] = CONFIG_SENSOR_MOVEMENT_5_LOCATION;
            #endif



        //to match sql table id with sensor
        int8_t movement_sensor_pin_number[sensor_arr[MOVEMENT] + SQL_ID_SYNC_VAL];
            movement_sensor_pin_number[0] = 0; //intentialy empty
            #ifdef CONFIG_SENSOR_MOVEMENT_1_PIN
            movement_sensor_pin_number[1] = CONFIG_SENSOR_MOVEMENT_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_2_PIN
            movement_sensor_pin_number[2] = CONFIG_SENSOR_MOVEMENT_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_3_PIN
            movement_sensor_pin_number[3] = CONFIG_SENSOR_MOVEMENT_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_4_PIN
            movement_sensor_pin_number[4] = CONFIG_SENSOR_MOVEMENT_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_MOVEMENT_5_PIN
            movement_sensor_pin_number[5] = CONFIG_SENSOR_MOVEMENT_5_PIN;
            #endif

        Module_sensor_config_t *movement_sensor_config =
        createModuleSensorConfig(
                movement_sensor_locations,
                movement_sensor_pin_number,
                sensor_arr[MOVEMENT]+ SQL_ID_SYNC_VAL);

            //to match sql table id with sensor
        char* camera_sensor_locations[sensor_arr[CAMERA] + SQL_ID_SYNC_VAL];
            camera_sensor_locations[0] = "CAMERA";
            #ifdef CONFIG_SENSOR_CAMERA_1_LOCATION
            camera_sensor_locations[1] = CONFIG_SENSOR_CAMERA_1_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_2_LOCATION
            camera_sensor_locations[2] = CONFIG_SENSOR_CAMERA_2_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_3_LOCATION
            camera_sensor_locations[3] = CONFIG_SENSOR_CAMERA_3_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_4_LOCATION
            camera_sensor_locations[4] = CONFIG_SENSOR_CAMERA_4_LOCATION;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_5_LOCATION
            camera_sensor_locations[5] = CONFIG_SENSOR_CAMERA_5_LOCATION;
            #endif



        //to match sql table id with sensor
        int8_t camera_sensor_pin_number[sensor_arr[CAMERA] + SQL_ID_SYNC_VAL];
            camera_sensor_pin_number[0] = 0; //initaly empty
            #ifdef CONFIG_SENSOR_CAMERA_1_PIN
            camera_sensor_pin_number[1] = CONFIG_SENSOR_CAMERA_1_PIN;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_2_PIN
            camera_sensor_pin_number[2] = CONFIG_SENSOR_CAMERA_2_PIN;
            #endif
            #ifdef CONFIG_SENSOR_CAMERA_3_PIN
            camera_sensor_pin_number[3] = CONFIG_SENSOR_CAMERA_3_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_4_PIN
            camera_sensor_pin_number[4] = CONFIG_SENSOR_SOIL_MOISTURE_4_PIN;
            #endif
            #ifdef CONFIG_SENSOR_SOIL_MOISTURE_5_PIN
            camera_sensor_pin_number[5] = CONFIG_SENSOR_SOIL_MOISTURE_5_PIN;
            #endif


        Module_sensor_config_t *camera_sensor_config =
        createModuleSensorConfig(
                camera_sensor_locations,
                camera_sensor_pin_number,
                sensor_arr[CAMERA]+ SQL_ID_SYNC_VAL
                );

        Module_sensor_config_t **sensor_config_arr=(Module_sensor_config_t**)malloc(sizeof(Module_sensor_config_t*)*SENSOR_LIST_TOTAL);

        sensor_config_arr[DHT22] = dht22_sensor_config;
        sensor_config_arr[SOIL_MOISTURE] = soil_moisture_sensor_config;
        sensor_config_arr[LIGHT] = light_sensor_config;
        sensor_config_arr[SOUND] = sound_sensor_config;
        sensor_config_arr[MOVEMENT] = movement_sensor_config;
        sensor_config_arr[CAMERA] = camera_sensor_config;




        //one more as list start at index 1 with 0=null for sql sync

        #ifdef CONFIG_MODULE_TYPE_CONTROLLER


            module_info_gt = create_module_from_config("controller", CONFIG_MODULE_LOCATION, sensor_arr, sensor_config_arr);
        #elif CONFIG_MODULE_TYPE_NODE

            module_info_gt = create_module_from_config("node", CONFIG_MODULE_LOCATION, sensor_arr, sensor_config_arr);


        #else
            ESP_LOGE(TAG, "module type not selected, use menuconfig");
           // *module_info_gt = {0};
        #endif




    //TODO: write to nvs
        extern nvs_handle_t nvs_sensor_loc_arr_handle;
 //for debug
        /*printf("serialized: %s\n", serializeModuleSensorConfigArray(
                sensor_config_arr,
                SENSOR_LIST_TOTAL
            ));
*/

        nvs_set_module(module_info_gt->type,module_info_gt->location,module_info_gt->identity);
        nvs_set_sensor_arr(module_info_gt->sensor_arr,SENSOR_LIST_TOTAL);
        save_serialized_sensor_loc_arr_to_nvs(
            serializeModuleSensorConfigArray(
                sensor_config_arr,
                SENSOR_LIST_TOTAL
            ),
            nvs_sensor_loc_arr_handle,
            NVS_SENSOR_CONFIG_NAMESPACE,
            NVS_SENSOR_CONFIG_ARR_INDEX
        );

    }else{//retrive from nvs only---<--



        module_info_gt = create_module_from_NVS();


    }


        ESP_LOGI(TAG,"{==nvs info==}\n%s\n", node_info_get_module_info_json());
        // Start Wifi
        wifi_start();
        vTaskDelay(pdMS_TO_TICKS(1000));
        if (strcmp(module_info_gt->type, "controller") == 0) {
            ESP_LOGI(TAG, "Starting Controller only services");
            //sd and db_init
            //spi_sd_card_init();
            //sd_db_init();

        } else if(strcmp(module_info_gt->type, "node") == 0){
            ESP_LOGI(TAG, "Starting Node only services");
           //node only;
        }else{
            ESP_LOGE(TAG, "module type not selected, use menuconfig");

        }

        //common to both node and controller
        ESP_LOGI(TAG, "Starting common services");
        initiate_sensor_queue();
        initiate_sensor_tasks();
        esp_now_comm_start();


}

__attribute__((optimize("O0")))
void initiate_sensor_tasks(){

    int8_t total_local_sensors = 0;
    for (int i =0; i < SENSOR_LIST_TOTAL; i++){
        total_local_sensors += module_info_gt->sensor_arr[i];
    }
    sensor_data_t **local_sensor = (sensor_data_t**)malloc(sizeof(sensor_data_t*) * total_local_sensors);

    for(Sensor_List sensor_type = DHT22; sensor_type < SENSOR_LIST_TOTAL; sensor_type++){

        //sensor_id starts from 1 to allows for sync with sql data base id eventualy, leaves [0] as null
        for(int sensor_id = 1; sensor_id < module_info_gt->sensor_arr[sensor_type]+SQL_ID_SYNC_VAL; sensor_id++){
            local_sensor[sensor_id-1] = (sensor_data_t*)malloc(sizeof(sensor_data_t));


                    local_sensor[sensor_id-1]->pin_number = module_info_gt->sensor_config_arr[sensor_type]->sensor_pin_arr[sensor_id];
                    local_sensor[sensor_id-1]->sensor_type = sensor_type;
                    local_sensor[sensor_id-1]->total_values = module_info_gt->sensor_arr[sensor_type];
                    local_sensor[sensor_id-1]->location = (char*)malloc(sizeof(char) * (1 + strlen(module_info_gt->sensor_config_arr[sensor_type]->sensor_loc_arr[sensor_id])));
                    strcpy( local_sensor[sensor_id-1]->location,module_info_gt->sensor_config_arr[sensor_type]->sensor_loc_arr[sensor_id] );

                    local_sensor[sensor_id-1]->local_sensor_id = sensor_id;
                    local_sensor[sensor_id-1]->module_id = (char*)malloc(sizeof(char) * (1 + strlen(module_info_gt->identity)));
                    strcpy(local_sensor[sensor_id-1]->module_id, module_info_gt->identity);

                    local_sensor[sensor_id-1]->timestamp = 0;


            switch(sensor_type){
                case DHT22:


	                ESP_LOGI(TAG, "Started Internal DHT22 Sensor: Id: #%d, Location: %s, Pin: #%d", sensor_id, local_sensor[sensor_id-1]->location, local_sensor[sensor_id-1]->pin_number);
                    char sensor_task_name[20];
                    //TODO: add internal keyword to taskname
                    snprintf(sensor_task_name, sizeof(sensor_task_name), "dht22_sensor_%d", local_sensor[sensor_id-1]->local_sensor_id);
                    xTaskCreatePinnedToCore(DHT22_task, sensor_task_name, DHT22_TASK_STACK_SIZE, (void *)local_sensor[sensor_id -1], DHT22_TASK_PRIORITY, NULL, DHT22_TASK_CORE_ID);
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


Module_sensor_config_t *createModuleSensorConfig(char **locations, int8_t *pins, int numLocations) {
    Module_sensor_config_t *sensor_config = malloc(sizeof(Module_sensor_config_t));
    if (!sensor_config) return NULL;

    // Allocate and initialize sensor_config_arr

    sensor_config->sensor_loc_arr = (char **)malloc(sizeof(char *) * numLocations);
    sensor_config->sensor_pin_arr = (int8_t *)malloc(sizeof(int8_t) * numLocations);
        for(int j = 0; j < numLocations; j++){
            sensor_config->sensor_loc_arr[j] = (char *)malloc(sizeof(char) * (strlen(locations[j]) + 1));
            strcpy(sensor_config->sensor_loc_arr[j], locations[j]);

            sensor_config->sensor_pin_arr[j] = pins[j];
        }

   return sensor_config;
}

// Function to free a Module_sensor_config_t instance
void freeModuleSensorConfig(Module_sensor_config_t *config) {
    if (!config) return;

    // Free each string in sensor_loc_arr
    for (int i = 0; config->sensor_loc_arr && config->sensor_loc_arr[i] != NULL; i++) {
        free(config->sensor_loc_arr[i]);
    }
    free(config->sensor_loc_arr); // Free the array of strings

    free(config->sensor_pin_arr); // Free the array of pins
    free(config); // Free the struct itself
}

// Function to create a Module_info_t instance
Module_info_t *create_module_from_NVS() {
    extern nvs_handle_t nvs_sensor_loc_arr_handle;

    Module_info_t temp_module = {0};
    Module_info_t *created_module;
    nvs_get_module_info(&temp_module);
    int8_t sensor_arr_total = SENSOR_LIST_TOTAL;

    created_module = (Module_info_t *)malloc(sizeof(Module_info_t));
    created_module->type = (char *)malloc(sizeof(char) * (strlen(temp_module.type)+1));
    created_module->location = (char *)malloc(sizeof(char) * (strlen(temp_module.location)+1));
    created_module->sensor_arr = (int8_t *)malloc(sizeof(int8_t) * SENSOR_LIST_TOTAL);


    strcpy(created_module->type, temp_module.type);
    strcpy(created_module->location, temp_module.location);

    created_module->identity = (char *)malloc(sizeof(char) * (strlen(temp_module.identity)+1));
    strcpy(created_module->identity, temp_module.identity);

    ESP_ERROR_CHECK(nvs_get_sensor_arr(&(created_module->sensor_arr), &sensor_arr_total));

    char *deserialized_string =
        retrieve_serialized_string_from_nvs(nvs_sensor_loc_arr_handle,
            NVS_SENSOR_CONFIG_NAMESPACE, NVS_SENSOR_CONFIG_ARR_INDEX);

    //prevent optimizing out string for debug
    ESP_LOGI(TAG, "deserialized string: %s", deserialized_string);

    //allocates memory inside function
    created_module->sensor_config_arr =
        deserialize_string(deserialized_string,
                sensor_arr_total);


    free(temp_module.type);
    free(temp_module.location);
    free(temp_module.identity);


    return created_module;
}


// Function to create a Module_info_t instance
Module_info_t *create_module_from_config(char *type,
        char *location,
        int8_t *sensor_arr,
        Module_sensor_config_t **sensor_config_arr) {

    Module_info_t *created_module;

    //int8_t sensor_arr_total = SENSOR_LIST_TOTAL;

    created_module = (Module_info_t *)malloc(sizeof(Module_info_t));
    created_module->type = (char *)malloc(sizeof(char) * strlen(type)+1);
    created_module->location = (char *)malloc(sizeof(char) * strlen(location)+1);
    created_module->sensor_arr = (int8_t *)malloc(sizeof(int8_t) * SENSOR_LIST_TOTAL);


    strcpy(created_module->type, type);
    strcpy(created_module->location, location);


    int mac_type;
    if(strcmp(type, "node") == 0){
        mac_type = ESP_MAC_WIFI_STA;
    }else{
        mac_type = ESP_MAC_WIFI_SOFTAP;
    }
    uint8_t mac[6];
    // Get MAC address for Wi-Fi Station interface
    esp_err_t mac_ret = esp_read_mac(mac, mac_type);

    char mac_addr_str[20];

    if (mac_ret == ESP_OK) {
        sprintf(mac_addr_str, "%02x:%02x:%02x:%02x:%02x:%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    } else {
        sprintf(mac_addr_str, "unknown");
    }


    created_module->identity = (char*)malloc(sizeof(char) * strlen(mac_addr_str)+1);
    strcpy(created_module->identity, mac_addr_str);


    for(int i = 0; i < SENSOR_LIST_TOTAL; i++){
        created_module->sensor_arr[i] = sensor_arr[i];
    }
    created_module->sensor_config_arr = sensor_config_arr;


    return created_module;
}
