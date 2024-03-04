/**
 * nvs_service.h
 *
 * Created on: 2024-01-30
 * Author: Catlin Roman
*/
#ifndef MAIN_NVS_SERVICE_H_
#define MAIN_NVS_SERVICE_H_



#define NVS_WIFI_NAMESPACE                      "wifi"
#define NVS_WIFI_SSID_INDEX                     "ssid"
#define NVS_WIFI_PWD_INDEX                      "pwd"

#define NVS_MODULE_NAMESPACE                    "module_info"
#define NVS_MODULE_TYPE_INDEX                   "module_type"
#define NVS_MODULE_LOCATION_INDEX               "module_location"
#define NVS_MODULE_IDENTIFIER_INDEX             "module_ident"

#define NVS_NODE_ARR_NAMESPACE                  "node_list"
#define NVS_NODE_ARR_INDEX                      "node_arr"
#define NVS_NODE_TOTAL_INDEX                    "node_total"

#define NVS_SENSOR_ARR_NAMESPACE                "sensor_list"
#define NVS_SENSOR_ARR_INDEX                    "sensor_arr"
#define NVS_SENSOR_TOTAL_INDEX                  "sensor_total"


#define NVS_SENSOR_CONFIG_NAMESPACE           "sensor_config_list"
#define NVS_SENSOR_CONFIG_ARR_INDEX           "sensor_config_arr"


/**
 *
 * char **temp_sensor_loc_arr;
    int8_t *temp_sensor_pin_arr;
    char **humidity_sensor_loc_arr;
    int8_t *humidity_sensor_pin_arr;
    char **soil_moisture_sensor_loc_arr;
    int8_t *soil_moisture_pin_arr;
    char **light_sensor_loc_Arr;
    int8_t light_sensor_pin_arr;
    char **sound_sensor_loc_arr;
    int8_t sound_sensor_pin_arr;
    char **movement_sensor_loc_arr;
    int8_t movement_sensor_pin_arr;
    char **camera_sensor_loc_arr;
    int8_t camera_sensor_pin_arr;
 *
 *
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
//TODO: decide on structure for sensor list enum, def etc


/**
 * nvs initiate will error checking
*/
esp_err_t nvs_initiate(void);

/**
 * saves the wifi pass and ssid past as a param
*/
void nvs_set_wifi_info(char *new_wifi_ssid, char *new_wifi_pwd);

/**
 * get ehs last saved wifi ssid and pass word outsputs to passed pointers, deals with
 * mem allocation but must be freed by caller
 * */
esp_err_t nvs_get_wifi_info(char *curr_saved_wifi_ssid_out, char *curr_saved_wifi_pwd_out );

/**
 * erase nvs flash and thus remove credientials stored
*/
void nvs_erase(void);


esp_err_t nvs_get_module_info(Module_info_t *module_info);

void nvs_set_module(char *module_type, char *module_location, int8_t moduleNum);

esp_err_t nvs_get_sensor_arr(int8_t **sensor_arr, int8_t *arrLength);

void nvs_set_sensor_arr(const int8_t *sensor_arr, int8_t arrLength);

char* serialize_strings(char* strings[], int count);

char** deserialize_strings(const char* serialized, int* count);

esp_err_t save_serialized_sensor_loc_arr_to_nvs(const char* serialized_loc_arr,
    nvs_handle_t loc_arr_handle,
    char* loc_arr_namespace,
    char* loc_arr_index);

char* retrieve_serialized_string_from_nvs(nvs_handle_t loc_arr_handle,
        char* loc_arr_namespace,
        char* loc_arr_index);\


void int8ToString(int8_t num, char *str);

char* serializeModuleSensorConfigArray(Module_sensor_config_t *configs, int numConfigs);

char** splitString(const char* str, char delimiter, int* count);

int8_t stringToInt8(const char* str);

Module_sensor_config_t* deserializeModuleSensorConfigArray(const char *serialized, int *numConfigs);


#endif