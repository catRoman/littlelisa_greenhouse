
#include "esp_err.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"

#include "nvs_service.h"

static char TAG[] = "nvs_service";

/**
 * initiate wifi config structure
*/
nvs_handle_t nvs_wifi_handle;




esp_err_t nvs_initiate(void){
    ESP_LOGI(TAG, "NVS INITIATING...");
    esp_err_t err = nvs_flash_init();

    if(err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND){
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }

    if(err == ESP_OK){
        ESP_LOGI(TAG, "NVS INITIATED SUCCESSFULY");
    }
    return err;
}

esp_err_t nvs_get_wifi_info(char **curr_saved_wifi_ssid_out, char **curr_saved_wifi_pwd_out ){
    esp_err_t err;

    if((err = nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t ssid_required_size;

    if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, NULL, &ssid_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    ESP_LOGI(TAG, "ssid_required_size: %d", sizeof(ssid_required_size));

    *curr_saved_wifi_ssid_out = (char *)malloc(sizeof(ssid_required_size));
    if (*curr_saved_wifi_ssid_out == NULL)
    {
        ESP_LOGE(TAG, "ssid memory alloaction error");
        err = ESP_ERR_NO_MEM;
    }
    else
    {
        ESP_LOGI(TAG, "curr_saved_wiifi_ssid_out size: %d", sizeof(*curr_saved_wifi_pwd_out));

        if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, *curr_saved_wifi_ssid_out, &ssid_required_size)) != ESP_OK){
            ESP_LOGW(TAG, "%s", esp_err_to_name(err));
            return err;
        }
        size_t pwd_required_size;
        if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, NULL, &pwd_required_size)) != ESP_OK){
            ESP_LOGW(TAG, "%s", esp_err_to_name(err));
            return err;
        }
        
        *curr_saved_wifi_pwd_out = (char *)malloc(sizeof(pwd_required_size));

        if(*curr_saved_wifi_pwd_out == NULL)
        {
            ESP_LOGE(TAG, "pwd memory allocation error");
            err = ESP_ERR_NO_MEM;
        }
        else
        {
            if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, *curr_saved_wifi_pwd_out, &pwd_required_size)) != ESP_OK){
                ESP_LOGW(TAG, "%s", esp_err_to_name(err));
                return err;
            }
            nvs_close(nvs_wifi_handle);

            return err;
        } 
    }
    return err;
}

void nvs_set_wifi_info(char *new_wifi_ssid, char *new_wifi_pwd){



    if(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "nvs opened");
    }
    ESP_ERROR_CHECK(nvs_set_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, new_wifi_ssid));
    ESP_ERROR_CHECK(nvs_set_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, new_wifi_pwd));
       /**char* pass = NULL;
        char* ssid = NULL;
        esp_err_t nvs_err;
        if((nvs_err = nvs_get_wifi_info(&ssid, &pass)) == ESP_OK){
            ESP_LOGI(TAG, "credientials added-> ssid: %s, pwd: %s", ssid, pass);
            free(ssid);
            free(pass);
        }else{
            ESP_LOGE(TAG, "couldn't get wifi credentials from nvs: %s", esp_err_to_name(nvs_err));
        }
        */
    if (nvs_commit(nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "nvs changes succeffully commited");
    }
    nvs_close(nvs_wifi_handle);
}
void nvs_erase(void){
    esp_err_t err;
    if(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "nvs opened");
    }
     if(nvs_erase_all(nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "nvs credientials erased");
    }
     if((err =nvs_commit(nvs_wifi_handle)) == ESP_OK){
        ESP_LOGI(TAG, "nvs changes commited");
    }else{
        ESP_LOGE(TAG, "couldnt commit changes %s", esp_err_to_name(err));
    }

}