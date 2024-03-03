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


#define NVS_TEMP_SENSOR_LOC_NAMESPACE           "temp_sensor_loc_list"
#define NVS_TEMP_SENSOR_LOC_ARR_INDEX           "temp_sensor_loc_arr"

#define NVS_HUMIDITY_SENSOR_LOC_NAMESPACE       "humidity_sensor_list"
#define NVS_HUMIDITY_SENSOR_LOC_ARR_INDEX       "humidity_sensor_loc_arr"

#define NVS_SOIL_MOISTURE_SENSOR_LOC_NAMESPACE  "soil_moisture_sensor_loc_list"
#define NVS_SOIL_MOISTURE_SENSOR_LOC_ARR_INDEX  "soil_moisture_sensor_loc_arr"

#define NVS_LIGHT_SENSOR_LOC_NAMESPACE          "light_sensor_loc_list"
#define NVS_LIGHT_SENSOR_LOC_ARR_INDEX          "light_sensor_loc_arr_arr"

#define NVS_SOUND_SENSOR_LOC_NAMESPACE          "sound_sensor_loc_list"
#define NVS_SOUND_SENSOR_LOC_ARR_INDEX          "sound_sensor_loc_arr"

#define NVS_MOVEMENT_SENSOR_LOC_NAMESPACE       "movement_sensor_loc_list"
#define NVS_MOVEMENT_SENSOR_LOC_ARR_INDEX       "movement_sensor_loc_arr"

#define NVS_CAMERA_SENSOR_LOC_NAMESPACE         "camera_sensor_loc_list"
#define NVS_CAMERA_SENSOR_LOC_ARR_INDEX         "camera_sensor_arr"

typedef struct Module_info_t{
    char *type;
    char *location;
    int8_t identity;
    int8_t *sensor_arr;
    char **temp_sensor_loc_arr;
    char **humidity_sensor_loc_arr;
    char **soil_moisture_sensor_loc_arr;
    char **light_sensor_loc_Arr;
    char **sound_sensor_loc_arr;
    char **movement_sensor_loc_arr;
    char **camera_sensor_loc_arr;
}Module_info_t;

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

esp_err_t nvs_get_node_arr(int8_t **node_arr, int8_t *arrLength);

void nvs_set_node_arr(const int8_t *node_arr, int8_t arrLength);

esp_err_t nvs_get_sensor_arr(int8_t **sensor_arr, int8_t *arrLength);

void nvs_set_sensor_arr(const int8_t *sensor_arr, int8_t arrLength);

#endif