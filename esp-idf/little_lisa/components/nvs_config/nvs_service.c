
#include <string.h>

#include "esp_err.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "esp_heap_caps.h"

// componenets
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

esp_err_t nvs_initiate(void)
{
    ESP_LOGI(TAG, "NVS INITIATING...");
    esp_err_t err = nvs_flash_init();

    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }

    if (err == ESP_OK)
    {
        ESP_LOGI(TAG, "NVS INITIATED SUCCESSFULY");
    }
    return err;
}

esp_err_t nvs_get_wifi_info(char *curr_saved_wifi_ssid_out, char *curr_saved_wifi_pwd_out)
{
    esp_err_t err;

    if ((err = nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t ssid_required_size;

    if ((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, NULL, &ssid_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    ESP_LOGI(TAG, "ssid_required_size: %d", sizeof(ssid_required_size));

    ESP_LOGI(TAG, "curr_saved_wiifi_ssid_out size: %d", sizeof(curr_saved_wifi_pwd_out));

    if ((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_SSID_INDEX, curr_saved_wifi_ssid_out, &ssid_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t pwd_required_size;

    if ((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, NULL, &pwd_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    if ((err = nvs_get_str(nvs_wifi_handle, NVS_WIFI_PWD_INDEX, curr_saved_wifi_pwd_out, &pwd_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    nvs_close(nvs_wifi_handle);

    return err;
}

void nvs_set_wifi_info(char *new_wifi_ssid, char *new_wifi_pwd)
{

    if (nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK)
    {
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
    if (nvs_commit(nvs_wifi_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==set_info==} changes succeffully commited");
    }
    nvs_close(nvs_wifi_handle);
}

esp_err_t nvs_get_module_info(Module_info_t *module_info)
{
    esp_err_t err;

    if ((err = nvs_open(NVS_MODULE_NAMESPACE, NVS_READWRITE, &nvs_module_handle)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t module_type_required_size;

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, NULL, &module_type_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    // printf("mod info size %d\n", sizeof(module_type_required_size));

    module_info->type = (char *)malloc(module_type_required_size);
    if (module_info->type == NULL)
    {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module type\n");
        return ESP_ERR_NO_MEM;
    }

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, module_info->type, &module_type_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t module_location_required_size;

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, NULL, &module_location_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    module_info->location = malloc(module_location_required_size);
    if (module_info->location == NULL)
    {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module location\n");
        return ESP_ERR_NO_MEM;
    }

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, module_info->location, &module_location_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t module_identity_required_size;

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, NULL, &module_identity_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    module_info->identity = (char *)malloc(module_identity_required_size);
    if (module_info->identity == NULL)
    {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- module identity\n");
        return ESP_ERR_NO_MEM;
    }

    if ((err = nvs_get_str(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, module_info->identity, &module_identity_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    // greenhouse and zone_id

    int8_t greenhouse_id;
    err = nvs_get_i8(nvs_module_handle, NVS_MODULE_GREENHOUSE_ID_INDEX, &greenhouse_id);
    module_info->greenhouse_id = greenhouse_id;

    int8_t zone_id;

    err = nvs_get_i8(nvs_module_handle, NVS_MODULE_ZONE_ID_INDEX, &zone_id);
    module_info->zone_id = zone_id;

    // sqaure pos and sn_rel_pos arrays
    // square_pos
    size_t module_square_pos_required_size;

    if ((err = nvs_get_blob(nvs_module_handle, NVS_MODULE_SQUARE_POS_INDEX, NULL, &module_square_pos_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    if ((err = nvs_get_blob(nvs_module_handle, NVS_MODULE_SQUARE_POS_INDEX, module_info->square_pos, &module_square_pos_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }
    // zn_rel_pos
    size_t module_zn_rel_pos_required_size;

    if ((err = nvs_get_blob(nvs_module_handle, NVS_MODULE_ZN_REL_POS_INDEX, NULL, &module_zn_rel_pos_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    if ((err = nvs_get_blob(nvs_module_handle, NVS_MODULE_ZN_REL_POS_INDEX, module_info->zn_rel_pos, &module_zn_rel_pos_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    nvs_close(nvs_module_handle);

    ESP_LOGI(TAG, "{==module info==} retrieved type, location, idenetity");
    return err;
}

void nvs_set_module(int8_t greenhouse_id, int8_t zone_id, int8_t square_pos[2], int8_t zn_rel_pos[3], char *module_type, char *module_location, char *moduleNum)
{

    if (nvs_open(NVS_MODULE_NAMESPACE, NVS_READWRITE, &nvs_module_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==module type==} opened");
    }
    ESP_ERROR_CHECK(nvs_set_str(nvs_module_handle, NVS_MODULE_TYPE_INDEX, module_type));
    ESP_ERROR_CHECK(nvs_set_str(nvs_module_handle, NVS_MODULE_LOCATION_INDEX, module_location));
    ESP_ERROR_CHECK(nvs_set_str(nvs_module_handle, NVS_MODULE_IDENTIFIER_INDEX, moduleNum));
    ESP_ERROR_CHECK(nvs_set_i8(nvs_module_handle, NVS_MODULE_GREENHOUSE_ID_INDEX, greenhouse_id));
    ESP_ERROR_CHECK(nvs_set_i8(nvs_module_handle, NVS_MODULE_ZONE_ID_INDEX, zone_id));
    ESP_ERROR_CHECK(nvs_set_blob(nvs_module_handle, NVS_MODULE_SQUARE_POS_INDEX, square_pos, sizeof(int8_t) * 2));
    ESP_ERROR_CHECK(nvs_set_blob(nvs_module_handle, NVS_MODULE_ZN_REL_POS_INDEX, zn_rel_pos, sizeof(int8_t) * 3));

    if (nvs_commit(nvs_module_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==module set==} changes succeffully commited-> module set to %s, idenetity: %s", module_type, moduleNum);
    }
    nvs_close(nvs_module_handle);

    node_info_log_module_info();
}

esp_err_t nvs_get_sensor_arr(int8_t **sensor_arr, int8_t *arrLength)
{
    esp_err_t err;

    if ((err = nvs_open(NVS_SENSOR_ARR_NAMESPACE, NVS_READWRITE, &nvs_sensor_arr_handle)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    size_t sensor_arr_required_size;

    if ((err = nvs_get_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, NULL, &sensor_arr_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    *sensor_arr = (int8_t *)malloc(sensor_arr_required_size * sizeof(int8_t));

    if (*sensor_arr == NULL)
    {
        // Handle memory allocation failure
        ESP_LOGE(TAG, "Memory allocation failed- sensor arr\n");
        return ESP_ERR_NO_MEM;
    }

    if ((err = nvs_get_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, *sensor_arr, &sensor_arr_required_size)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    if ((err = nvs_get_i8(nvs_sensor_arr_handle, NVS_SENSOR_TOTAL_INDEX, arrLength)) != ESP_OK)
    {
        ESP_LOGW(TAG, "%s", esp_err_to_name(err));
        return err;
    }

    nvs_close(nvs_sensor_arr_handle);

    return err;
}

void nvs_set_sensor_arr(const int8_t *sensor_arr, int8_t arrLength)
{

    if (nvs_open(NVS_SENSOR_ARR_NAMESPACE, NVS_READWRITE, &nvs_sensor_arr_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==sensor list==} opened");
    }

    ESP_ERROR_CHECK(nvs_set_blob(nvs_sensor_arr_handle, NVS_SENSOR_ARR_INDEX, sensor_arr, arrLength));
    ESP_ERROR_CHECK(nvs_set_i8(nvs_sensor_arr_handle, NVS_SENSOR_TOTAL_INDEX, arrLength));

    if (nvs_commit(nvs_sensor_arr_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==sensor list==} changes succeffully commited-> sensor list added");
    }
    nvs_close(nvs_sensor_arr_handle);

    node_info_log_sensor_list();
}

void nvs_erase(void)
{
    esp_err_t err;
    if (nvs_open(NVS_WIFI_NAMESPACE, NVS_READWRITE, &nvs_wifi_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==nvs_erase==} opened");
    }
    if (nvs_erase_all(nvs_wifi_handle) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==nvs_erase==} credientials erased");
    }
    if ((err = nvs_commit(nvs_wifi_handle)) == ESP_OK)
    {
        ESP_LOGI(TAG, "{==nvs_erase} changes succesfully commited");
    }
    else
    {
        ESP_LOGE(TAG, "{==nvs_erase==} couldnt commit changes %s", esp_err_to_name(err));
    }
}

void int8ToString(int8_t num, char *str)
{
    sprintf(str, "%d", num);
}
// Serializes an array of Module_sensor_config_t
char *serializeModuleSensorConfigArray(Module_sensor_config_t **configs, int numConfigs)
{
    // Assuming each serialized config is less than 256 characters
    // Adjust the size based on your needs
    extern Module_info_t *module_info_gt;

    char *serializedString = malloc(numConfigs * 256);
    if (!serializedString)
        return NULL;
    serializedString[0] = '\0';

    for (int c = 0; c < numConfigs; c++)
    { // loop through sensors
        // Serialize sensor_loc_arr- for each sensor-loop and print location
        for (int i = 0; i <= module_info_gt->sensor_arr[c]; /*sensor list has total num of sensors*/ i++)
        {
            strcat(serializedString, configs[c]->sensor_loc_arr[i]);
            strcat(serializedString, ";");
        }

        // Replace last semicolon with pipe
        serializedString[strlen(serializedString) - 1] = '|';

        // Serialize sensor_pin_arr
        char pinBuffer[5] = {0}; // Buffer for pin number as string
        for (int i = 0; i <= module_info_gt->sensor_arr[c]; i++)
        {

            int8ToString(configs[c]->sensor_pin_arr[i], pinBuffer);
            strcat(serializedString, pinBuffer);
            strcat(serializedString, ";");
        }

        // Replace the last semicolon with a newline character to separate configs
        serializedString[strlen(serializedString) - 1] = '$';
    }

    // Remove the last newline character
    serializedString[strlen(serializedString) - 1] = '\0';

    return serializedString;
}

Module_sensor_config_t **deserialize_string(char *serialized_string, int8_t numSensors)
{

    int8_t outer = 0;
    int8_t inner = 0;
    int8_t final = 0;

    char **serialized_sensor_str_arr = splits_string('$', serialized_string, &outer);
    Module_sensor_config_t **sensor_config_arr = (Module_sensor_config_t **)malloc(sizeof(Module_sensor_config_t) * outer);

    for (int i = 0; i < numSensors; i++)
    {
        // printf("count: %d\n",count[i]);
        //  printf("%s\n", serialized_sensor_str_arr[i]); //prints whole sensor serialized
        sensor_config_arr[i] = (Module_sensor_config_t *)malloc(sizeof(Module_sensor_config_t)); // sensor config struct
        char **serialized_split_loc = splits_string('|', serialized_sensor_str_arr[i], &inner);
        for (int j = 0; j < inner; j++)
        {
            //  printf("\t%s\n", serialized_split_loc[j]); //prints locationcombined with pin num serialized
            char **serialized_split_arr_data = splits_string(';', serialized_split_loc[j], &final);
            if (j == 0)
            {
                sensor_config_arr[i]->sensor_loc_arr = (char **)malloc(sizeof(char *) * final);
                sensor_config_arr[i]->sensor_pin_arr = (int8_t *)malloc(sizeof(int8_t) * final);
                sensor_config_arr[i]->total_sensor = final;
            }
            for (int k = 0; k < final; k++)
            {
                // printf("\t%s\n", serialized_split_arr_data[k]); //prints the values, first loc then pin
                if (j < 1)
                {
                    sensor_config_arr[i]->sensor_loc_arr[k] = (char *)malloc(sizeof(char) * strlen(serialized_split_arr_data[k]) + 1);
                    strcpy(sensor_config_arr[i]->sensor_loc_arr[k], serialized_split_arr_data[k]);
                }
                else
                {
                    sensor_config_arr[i]->sensor_pin_arr[k] = (int8_t)atoi(serialized_split_arr_data[k]);
                }

                free(serialized_split_arr_data[k]);
            }
            free(serialized_split_loc[j]);
            free(serialized_split_arr_data);
        }
        free(serialized_sensor_str_arr[i]);
        free(serialized_split_loc);
    }
    free(serialized_sensor_str_arr);

    return sensor_config_arr;
}
char **splits_string(char delim, char *serialized_string, int8_t *numStrings)
{

    int8_t split_count = 1; // acount fo odd number of string to delim

    for (int i = 0; i < strlen(serialized_string); i++)
    {
        if (serialized_string[i] == delim)
        {
            split_count++;
        }
    }
    *numStrings = split_count;

    char **serialized_sensor_str_arr = (char **)malloc(sizeof(char *) * split_count);
    if (serialized_sensor_str_arr == NULL)
    {
        puts("Memory alloaction error of serialized str arr");
        return NULL;
    }

    // determine string size and alloact memory
    int j = 0, k = 0, start_index = 0;
    for (int i = 0; i < strlen(serialized_string) + 1; i++)
    {
        if (serialized_string[i] == '\0')
        {

            serialized_sensor_str_arr[j] = (char *)malloc(sizeof(char) * (k + 1));

            memcpy(serialized_sensor_str_arr[j], &serialized_string[start_index], (k * sizeof(char)));
            serialized_sensor_str_arr[j][k] = '\0';
        }
        else if (serialized_string[i] == delim)
        {

            serialized_sensor_str_arr[j] = (char *)malloc(sizeof(char) * (k + 1));
            memcpy(serialized_sensor_str_arr[j], &serialized_string[start_index], (k * sizeof(char)));
            serialized_sensor_str_arr[j][k] = '\0';

            start_index += k + 1;
            k = 0;
            j++;
            continue;
        }
        k++;
    }

    return serialized_sensor_str_arr;
}

esp_err_t save_serialized_sensor_loc_arr_to_nvs(const char *serialized_loc_arr,
                                                nvs_handle_t loc_arr_handle,
                                                char *loc_arr_namespace,
                                                char *loc_arr_index)
{

    // Open

    esp_err_t err = nvs_open(loc_arr_namespace, NVS_READWRITE, &loc_arr_handle);
    if (err == ESP_OK)
    {
        // Write
        ESP_LOGI(TAG, "{==sensor loc==} opened");
        err = nvs_set_str(loc_arr_handle, loc_arr_index, serialized_loc_arr);
        if (err == ESP_OK)
        {
            // Commit
            err = nvs_commit(loc_arr_handle);
            ESP_LOGI(TAG, "{==sensor loc==} succesfully commited");
        }
        // Close
        nvs_close(loc_arr_handle);
    }

    if (err != ESP_OK)
    {
        // Handle error
        ESP_LOGE(TAG, "Error saving serialized string to NVS- %s", esp_err_to_name(err));
    }

    return err;
}

char *retrieve_serialized_string_from_nvs(nvs_handle_t loc_arr_handle,
                                          char *loc_arr_namespace,
                                          char *loc_arr_index)
{

    esp_err_t err = nvs_open(loc_arr_namespace, NVS_READONLY, &loc_arr_handle);
    if (err != ESP_OK)
    {
        ESP_LOGE(TAG, "Error opening NVS handle - %s", esp_err_to_name(err));
        return NULL;
    }

    ESP_LOGI(TAG, "{==sensor loc==} opened");
    // Read the size of the stored string
    size_t required_size = 0;
    err = nvs_get_str(loc_arr_handle, loc_arr_index, NULL, &required_size);
    if (err != ESP_OK)
    {
        nvs_close(loc_arr_handle);
        printf("Error reading size of serialized string from NVS - %s", esp_err_to_name(err));
        return NULL;
    }

    // Allocate memory for the string
    char *serialized_loc_arr = malloc(required_size);
    if (serialized_loc_arr == NULL)
    {
        nvs_close(loc_arr_handle);
        ESP_LOGE(TAG, "Failed to allocate memory for serialized string.");
        return NULL;
    }

    // Read the stored string
    err = nvs_get_str(loc_arr_handle, loc_arr_index, serialized_loc_arr, &required_size);
    if (err != ESP_OK)
    {
        free(serialized_loc_arr);
        nvs_close(loc_arr_handle);
        printf("Error reading serialized string from NVS - %s", esp_err_to_name(err));
        return NULL;
    }

    ESP_LOGI(TAG, "{==sensor loc==} succesfully retrieved");
    // Clean up
    nvs_close(loc_arr_handle);

    return serialized_loc_arr; // Caller is responsible for freeing this memory
}