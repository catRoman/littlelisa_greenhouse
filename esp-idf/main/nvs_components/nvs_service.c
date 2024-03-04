
#include <string.h>

#include "esp_err.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "esp_heap_caps.h"

#include "nvs_service.h"
#include "node_info.h"
#include "module_config.h"

static const char TAG[] = "nvs_service";

/**
 * initiate wifi config structure
*/
nvs_handle_t nvs_wifi_handle;
nvs_handle_t nvs_module_handle;
nvs_handle_t nvs_sensor_arr_handle;
nvs_handle_t nvs_node_arr_handle;
nvs_handle_t nvs_sensor_loc_arr_handle;


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
    if (module_info->type == NULL) {
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
    if (module_info->location == NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module location\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, module_info->location, &module_location_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


     if((err = nvs_get_i8(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, &(module_info->identity))) != ESP_OK){
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

    node_info_log_module_info();
}

esp_err_t nvs_get_sensor_arr(int8_t **sensor_arr, int8_t *arrLength){
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

    *sensor_arr = (int8_t*)malloc(sensor_arr_required_size * sizeof(int8_t));

    if (*sensor_arr == NULL) {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- sensor arr\n");
        return ESP_ERR_NO_MEM;
    }

    if((err = nvs_get_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, *sensor_arr, &sensor_arr_required_size)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


    if((err = nvs_get_i8(nvs_sensor_arr_handle, NVS_SENSOR_TOTAL_INDEX, arrLength)) != ESP_OK){
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }


    nvs_close(nvs_sensor_arr_handle);

    return err;

    }

void nvs_set_sensor_arr(const int8_t *sensor_arr, int8_t arrLength){

    if(nvs_open(NVS_SENSOR_ARR_NAMESPACE, NVS_READWRITE, &nvs_sensor_arr_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==sensor list==} opened");
    }

    ESP_ERROR_CHECK(nvs_set_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, sensor_arr, arrLength));
    ESP_ERROR_CHECK(nvs_set_i8(nvs_sensor_arr_handle, NVS_SENSOR_TOTAL_INDEX, arrLength));

    if (nvs_commit(nvs_sensor_arr_handle) == ESP_OK){
        ESP_LOGI(TAG, "{==sensor list==} changes succeffully commited-> sensor list added");
    }
    nvs_close(nvs_sensor_arr_handle);

    node_info_log_sensor_list();
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


/**
 *
*/

#define SERIAL_DELIMITER ";"

void int8ToString(int8_t num, char *str) {
    sprintf(str, "%d", num);
}
// Serializes an array of Module_sensor_config_t
char* serializeModuleSensorConfigArray(Module_sensor_config_t *configs, int numConfigs) {
    // Assuming each serialized config is less than 256 characters
    // Adjust the size based on your needs
    char *serializedString = malloc(numConfigs * 256);
    if (!serializedString) return NULL;
    serializedString[0] = '\0';

    for (int c = 0; c < numConfigs; c++) {
        // Serialize sensor_loc_arr
        for (int i = 0; configs[c].sensor_loc_arr[i] != NULL; i++) {
            strcat(serializedString, configs[c].sensor_loc_arr[i]);
            strcat(serializedString, ";");
        }

        // Replace last semicolon with pipe
        serializedString[strlen(serializedString) - 1] = '|';

        // Serialize sensor_pin_arr
        char pinBuffer[5]; // Buffer for pin number as string
        for (int i = 0; configs[c].sensor_pin_arr[i] != -1; i++) { // Assuming -1 as end marker
            int8ToString(configs[c].sensor_pin_arr[i], pinBuffer);
            strcat(serializedString, pinBuffer);
            strcat(serializedString, ";");
        }

        // Replace the last semicolon with a newline character to separate configs
        serializedString[strlen(serializedString) - 1] = '\n';
    }

    // Remove the last newline character
    serializedString[strlen(serializedString) - 1] = '\0';

    return serializedString;
}

char** splitString(const char* str, char delimiter, int* count) {
    char **result = 0;
    int count_i = 0;
    char* tmp = (char*)str;
    char* last_comma = 0;
    char delim[2];
    delim[0] = delimiter;
    delim[1] = 0;

    // Count how many elements will be extracted
    while (*tmp) {
        if (delimiter == *tmp) {
            count++;
            last_comma = tmp;
        }
        tmp++;
    }

    // Add space for trailing token
    count_i += last_comma < (str + strlen(str) - 1);

    // Add space for terminating null string
    count++;

    result = malloc(sizeof(char*) * *count);

    if (result) {
        size_t idx = 0;
        char* token = strtok((char*)str, delim);

        while (token) {
            *(result + idx++) = strdup(token);
            token = strtok(0, delim);
        }
        *(result + idx) = 0;
    }

    *count = count_i - 1;
    return result;
}

// Helper function to convert a string to int8_t
int8_t stringToInt8(const char* str) {
    return (int8_t)atoi(str);
}


// Deserializes a string to an array of Module_sensor_config_t
Module_sensor_config_t* deserializeModuleSensorConfigArray(const char *serialized, int *numConfigs) {
    int configsCount = 0;
    char **configsStrings = splitString(serialized, '\n', &configsCount);
    Module_sensor_config_t *configs = malloc(sizeof(Module_sensor_config_t) * configsCount);
    if (!configs) return NULL;

    for (int i = 0; i < configsCount; i++) {
        int partsCount = 0;
        char **parts = splitString(configsStrings[i], '|', &partsCount);
        if (partsCount != 2) continue; // Error handling

        // Deserialize sensor_loc_arr
        int locCount = 0;
        char **locations = splitString(parts[0], ';', &locCount);
        configs[i].sensor_loc_arr = malloc(sizeof(char*) * (locCount + 1));
        for (int loc = 0; loc < locCount; loc++) {
            configs[i].sensor_loc_arr[loc] = strdup(locations[loc]);
        }
        configs[i].sensor_loc_arr[locCount] = NULL;

        // Deserialize sensor_pin_arr
        int pinCount = 0;
        char **pins = splitString(parts[1], ';', &pinCount);
        configs[i].sensor_pin_arr = malloc(sizeof(int8_t) * (pinCount + 1));
        for (int pin = 0; pin < pinCount; pin++) {
            configs[i].sensor_pin_arr[pin] = (int8_t)atoi(pins[pin]);
        }
        configs[i].sensor_pin_arr[pinCount] = -1; // Assuming -1 as end marker

        // Free temporary arrays
        for (int j = 0; j < locCount; j++) free(locations[j]);
        free(locations);
        for (int j = 0; j < pinCount; j++) free(pins[j]);
        free(pins);
        free(parts[0]);
        free(parts[1]);
        free(parts);
    }

    for (int i = 0; i < configsCount; i++) free(configsStrings[i]);
    free(configsStrings);

    *numConfigs = configsCount;
    return configs;
}


esp_err_t save_serialized_sensor_loc_arr_to_nvs(const char* serialized_loc_arr,
    nvs_handle_t loc_arr_handle,
    char* loc_arr_namespace,
    char* loc_arr_index)
    {

    // Open

    esp_err_t err = nvs_open(loc_arr_namespace, NVS_READWRITE, &loc_arr_handle);
    if (err == ESP_OK) {
        // Write
        err = nvs_set_str(loc_arr_handle, loc_arr_index, serialized_loc_arr);
        if (err == ESP_OK) {
            // Commit
            err = nvs_commit(loc_arr_handle);
        }
        // Close
        nvs_close(loc_arr_handle);
    }

    if (err != ESP_OK) {
        // Handle error
        ESP_LOGE(TAG, "Error saving serialized string to NVS- %s", esp_err_to_name(err));

    }

    return err;
}

char* retrieve_serialized_string_from_nvs(nvs_handle_t loc_arr_handle,
        char* loc_arr_namespace,
        char* loc_arr_index) {

    esp_err_t err = nvs_open(loc_arr_namespace, NVS_READONLY, &loc_arr_handle);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Error opening NVS handle - %s", esp_err_to_name(err));
        return NULL;
    }

    // Read the size of the stored string
    size_t required_size = 0;
    err = nvs_get_str(loc_arr_handle, loc_arr_index, NULL, &required_size);
    if (err != ESP_OK) {
        nvs_close(loc_arr_handle);
        printf("Error reading size of serialized string from NVS - %s", esp_err_to_name(err));
        return NULL;
    }

    // Allocate memory for the string
    char* serialized_loc_arr = malloc(required_size);
    if (serialized_loc_arr == NULL) {
        nvs_close(loc_arr_handle);
        ESP_LOGE(TAG, "Failed to allocate memory for serialized string.");
        return NULL;
    }

    // Read the stored string
    err = nvs_get_str(loc_arr_handle, loc_arr_index, serialized_loc_arr, &required_size);
    if (err != ESP_OK) {
        free(serialized_loc_arr);
        nvs_close(loc_arr_handle);
        printf("Error reading serialized string from NVS - %s", esp_err_to_name(err));
        return NULL;
    }

    // Clean up
    nvs_close(loc_arr_handle);

    return serialized_loc_arr; // Caller is responsible for freeing this memory
}