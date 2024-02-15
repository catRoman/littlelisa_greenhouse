
#include "esp_err.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "esp_heap_caps.h"

#include "nvs_service.h"

static char TAG[] = "nvs_service";

/**
 * initiate wifi config structure
*/
nvs_handle_t nvs_wifi_handle;
nvs_handle_t nvs_module_handle;
nvs_handle_t nvs_sensor_arr_handle;
nvs_handle_t nvs_node_arr_handle;


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

esp_err_t nvs_get_wifi_info(char *curr_saved_wifi_ssid_out, char *curr_saved_wifi_pwd_out ){
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


    ESP_LOGI(TAG, "curr_saved_wiifi_ssid_out size: %d", sizeof(curr_saved_wifi_pwd_out));

    if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, curr_saved_wifi_ssid_out, &ssid_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t pwd_required_size;

    if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, NULL, &pwd_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    
    if((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, curr_saved_wifi_pwd_out, &pwd_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    nvs_close(nvs_wifi_handle);

    return err;
    
    }

void nvs_set_wifi_info(char *new_wifi_ssid, char *new_wifi_pwd){

    if(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==set info==} opened");
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
        ESP_LOGI(TAG, "{==set_info==} changes succeffully commited");
    }
    nvs_close(nvs_wifi_handle);
}

esp_err_t nvs_get_module_info(Module_info_t *module_info){
    esp_err_t err;

    if((err = nvs_open(NVS_MODULE_NAMESPACE, NVS_READWRITE, &nvs_module_handle)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t module_type_required_size;
  


    if((err = nvs_get_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, NULL, &module_type_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    module_info->type = malloc(module_type_required_size);
    if (module_info->type = NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module type\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, module_info->type, &module_type_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t module_location_required_size;

    if((err = nvs_get_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, NULL, &module_location_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    module_info->location = malloc(module_location_required_size);
    if (module_info->location = NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module location\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, module_info->location, &module_loction_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


     if((err = nvs_get_i8(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, module_info->identiy)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    nvs_close(nvs_module_handle);

    return err;
    
    }

void nvs_set_module(char *module_type, char *module_location, int8_t moduleNum){

    if(nvs_open(NVS_MODULE_NAMESPACE, NVS_READWRITE, &nvs_module_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==module type==} opened");
    }
    ESP_ERROR_CHECK(nvs_set_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, module_type));
    ESP_ERROR_CHECK(nvs_set_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, module_location));
    ESP_ERROR_CHECK(nvs_set_i8(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, moduleNum));
   
    if (nvs_commit(nvs_module_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==module set==} changes succeffully commited-> module set to %s, unit num: %d", module_type, moduleNum);
    }
    nvs_close(nvs_module_handle);
}

esp_err_t nvs_get_node_arr(int8_t *node_arr, int8_t *arrLength){
    esp_err_t err;

    if((err = nvs_open(NVS_NODE_ARR_NAMESPACE, NVS_READWRITE, &nvs_node_arr_handle)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t node_arr_required_size;
  


    if((err = nvs_get_blob(nvs_node_arr_handle, NVS_NODE_ARR_INDEX, NULL, &node_arr_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    node_arr = malloc(node_arr_required_size);

    if (node_arr = NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- node arr\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_blob(nvs_node_arr_handle, NVS_NODE_ARR_INDEX, node_arr, &node_arr_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


    if((err = nvs_get_i8(nvs_node_arr_handle, NVS_NODE_TOTAL_INDEX, &arrLength)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    nvs_close(nvs_node_arr_handle);

    return err;
    
    }

void nvs_set_node_arr(const uint8_t *node_arr, int8_t arrLength){

    if(nvs_open(NVS_NODE_ARR_NAMESPACE, NVS_READWRITE, &nvs_node_arr_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==node list==} opened");
    }
    ESP_ERROR_CHECK(nvs_set_i8(nvs_node_arr_handle, NVS_NODE_TOTAL_INDEX, arrLength));
    ESP_ERROR_CHECK(nvs_set_blob(nvs_node_arr_handle, NVS_NODE_ARR_INDEX, node_arr, arrLength));
   
    if (nvs_commit(nvs_node_arr_handle) == ESP_OK){
        char node_list[arrLength * 3]; //todo: change to something smarter
        node_list[0] = '[';
        for(int i = 0; i <= arrLength; i++){
            node_list[i] = node_arr[i];
            if(i < arrLength){
                node_list[i + 1] = ' ';
            }else{
                node_list[i] = '\0';
            }
        }
        ESP_LOGI(TAG, "{==node list==} changes succeffully commited-> node list set to \n%s,\n with a total num of nodes: %d", node_list, arrLength);
    }
    nvs_close(nvs_node_arr_handle);
}

esp_err_t nvs_get_sensor_arr(int8_t *sensor_arr, int8_t *arrLength){
    esp_err_t err;

    if((err = nvs_open(NVS_SENSOR_ARR_NAMESPACE, NVS_READWRITE, &nvs_sensor_arr_handle)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t sensor_arr_required_size;
  


    if((err = nvs_get_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, NULL, &sensor_arr_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    sensor_arr = malloc(sensor_arr_required_size);

    if (sensor_arr = NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- sensor arr\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, sensor_arr, &sensor_arr_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


    if((err = nvs_get_i8(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, &arrLength)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    nvs_close(nvs_sensor_arr_handle);

    return err;
    
    }


void nvs_set_sensor_arr(const uint8_t *sensor_arr, int8_t arrLength){

    if(nvs_open(NVS_SENSOR_ARR_NAMESPACE, NVS_READWRITE, &nvs_sensor_arr_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==sensor list==} opened");
    }
    ESP_ERROR_CHECK(nvs_set_i8(nvs_sensor_arr_handle, NVS_SENSOR_TOTAL_INDEX, arrLength));
    ESP_ERROR_CHECK(nvs_set_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, sensor_arr, arrLength));
   
    if (nvs_commit(nvs_sensor_arr_handle) == ESP_OK){
        char sensor_list[arrLength * 3]; //todo: change to something smarter
        sensor_list[0] = '[';
        for(int i = 0; i <= arrLength; i++){
            sensor_list[i] = i;
            sensor_list[i + 1] = sensor_arr[i];
            if(i < arrLength){
                sensor_list[i + 2] = ' ';
            }else{
                sensor_list[i] = '\0';
            }
        }
        ESP_LOGI(TAG, "{==sensor list==} changes succeffully commited-> sensor list set to \n%s,\n with a total num of sensors: %d", sensor_list, arrLength);
    }
    nvs_close(nvs_sensor_arr_handle);
}


void nvs_erase(void){
    esp_err_t err;
    if(nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==nvs_erase==} opened");
    }
     if(nvs_erase_all(nvs_wifi_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==nvs_erase==} credientials erased");
    }
     if((err =nvs_commit(nvs_wifi_handle)) == ESP_OK){
        ESP_LOGI(TAG, "{==nvs_erase} changes succesfully commited");
    }else{
        ESP_LOGE(TAG, "{==nvs_erase==} couldnt commit changes %s", esp_err_to_name(err));
    }

}