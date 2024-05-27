/**
 * nvs_service.h
 *
 * Created on: 2024-01-30
 * Author: Catlin Roman
 */
#ifndef NVS_CONFIG_MAIN_NVS_SERVICE_H_
#define NVS_CONFIG_MAIN_NVS_SERVICE_H_

#include "nvs.h"
#include "nvs_flash.h"


// components
#include "module_config.h"
#include "env_cntrl.h"

#define NVS_WIFI_NAMESPACE "wifi"
#define NVS_WIFI_SSID_INDEX "ssid"
#define NVS_WIFI_PWD_INDEX "pwd"

#define NVS_MODULE_NAMESPACE "module_info"

#define NVS_MODULE_GREENHOUSE_ID_INDEX "greenhouse_id"
#define NVS_MODULE_ZONE_NUM_INDEX "zone_num"
#define NVS_MODULE_TYPE_INDEX "module_type"
#define NVS_MODULE_LOCATION_INDEX "module_location"
#define NVS_MODULE_IDENTIFIER_INDEX "module_ident"
#define NVS_MODULE_SQUARE_POS_INDEX "square_pos_arr"
#define NVS_MODULE_ZN_REL_POS_INDEX "zn_rel_pos_arr"

#define NVS_SENSOR_ARR_NAMESPACE "sensor_list"
#define NVS_SENSOR_ARR_INDEX "sensor_arr"
#define NVS_SENSOR_TOTAL_INDEX "sensor_total"

#define NVS_SENSOR_CONFIG_NAMESPACE "s_config_list"
#define NVS_SENSOR_CONFIG_ARR_INDEX "s_config_arr"

#define NVS_ENV_STATE_CONFIG_NAMESPACE "es_config_list"
#define NVS_ENV_STATE_CONFIG_ARR_INDEX "es_config_arr"
#define NVS_ENV_STATE_TOTAL_INDEX "es_config_total"
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
// TODO: decide on structure for sensor list enum, def etc

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
esp_err_t nvs_get_wifi_info(char *curr_saved_wifi_ssid_out, char *curr_saved_wifi_pwd_out);

/**
 * erase nvs flash and thus remove credientials stored
 */
void nvs_erase(void);

esp_err_t nvs_get_module_info(Module_info_t *module_info);

void nvs_set_module(int8_t greenhouse_id, int8_t zone_num, int8_t square_pos[2], int8_t zn_rel_pos[3], char *module_type, char *module_location, char *moduleNum);

esp_err_t nvs_get_sensor_arr(int8_t **sensor_arr, int8_t *arrLength);

void nvs_set_sensor_arr(const int8_t *sensor_arr, int8_t arrLength);

char *serialize_strings(char *strings[], int count);

char **deserialize_strings(const char *serialized, int *count);

esp_err_t save_serialized_sensor_loc_arr_to_nvs(const char *serialized_loc_arr,
                                                nvs_handle_t loc_arr_handle,
                                                char *loc_arr_namespace,
                                                char *loc_arr_index);

char *retrieve_serialized_string_from_nvs(nvs_handle_t loc_arr_handle,
                                          char *loc_arr_namespace,
                                          char *loc_arr_index);

void int8ToString(int8_t num, char *str);

char *serializeModuleSensorConfigArray(Module_sensor_config_t **configs, int numConfigs);

Module_sensor_config_t **deserialize_string(char *serialized_string, int8_t numSensors);
int8_t stringToInt8(const char *str);

char **splits_string(char delim, char *serialized_string, int8_t *numStrings);

void nvs_set_env_state_arr(Env_state_t *state_arr_gt, int8_t arrLength);

esp_err_t nvs_get_env_state_arr(Env_state_t **state_arr, int8_t *arrLength);

#endif /*NVS_CONFIG_NVS_SERVICE_H*/