/**
 * nvs_service.h
 *
 * Created on: 2024-01-30
 * Author: Catlin Roman
*/
//TODO: stop nvs erase crediential echo
#ifndef MAIN_NVS_SERVICE_H_
#define MAIN_NVS_SERVICE_H_



#define NVS_WIFI_NAMESPACE      "wifi"
#define NVS_WIFI_SSID_INDEX     "ssid"
#define NVS_WIFI_PWD_INDEX      "pwd"



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


#endif