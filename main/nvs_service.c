
#include "esp_err.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "nvs_service.h"



/**
 * initiate wifi config structure
*/
nvs_handle_t nvs_wifi_handle;




esp_err_t nvs_initiate(void){
    esp_err_t err = nvs_flash_init();
    if(err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND){
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    return err;
}

void nvs_get_wifi_info(char **curr_saved_wifi_ssid_out, char **curr_saved_wifi_pwd_out ){

    ESP_ERROR_CHECK(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle));

    size_t required_size;

    ESP_ERROR_CHECK(nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, NULL, &required_size));
    *curr_saved_wifi_ssid_out = malloc(sizeof(required_size));
    
    ESP_ERROR_CHECK(nvs_get_str(nvs_wifi_handle, NVS_WIFI_NAMESPACE, *curr_saved_wifi_ssid_out, &required_size));
    
    
    ESP_ERROR_CHECK(nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, NULL, &required_size));
    *curr_saved_wifi_pwd_out = malloc(sizeof(required_size));
    
    ESP_ERROR_CHECK(nvs_get_str(nvs_wifi_handle, NVS_WIFI_NAMESPACE, *curr_saved_wifi_pwd_out, &required_size));
    nvs_close(nvs_wifi_handle);
}

void nvs_set_wifi_info(char *new_wifi_ssid, char *new_wifi_pwd){

    ESP_ERROR_CHECK(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle));
    ESP_ERROR_CHECK(nvs_set_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, new_wifi_ssid));
    ESP_ERROR_CHECK(nvs_set_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, new_wifi_pwd));

    ESP_ERROR_CHECK(nvs_commit(nvs_wifi_handle));
    nvs_close(nvs_wifi_handle);
}