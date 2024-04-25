
#include "esp_err.h"
#include "sensor_tasks.h"
#include "cJSON.h"
#include "string.h"
#include "esp_log.h"
#include "module_config.h"
#include "esp_now.h"
#include "esp_app_desc.h"
#include "sdkconfig.h"
char *TAG = "SENSOR_HELPER";
extern Module_info_t *module_info_gt;

char *create_sensor_data_json(sensor_data_t *sensor_data_recv)
{
    // temp for logging testing

    const esp_app_desc_t *app_info = esp_app_get_description();

    esp_err_t err = ESP_OK;

    cJSON *root = cJSON_CreateObject();
    cJSON *greenhouse_info = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();
    cJSON *sensor_info = cJSON_CreateObject();
    cJSON *sensor_data = cJSON_CreateObject();

    cJSON_AddItemToObject(root, "greenhouse_info", greenhouse_info);
    // temp for now will retrieve from module info eventually
    cJSON_AddNumberToObject(greenhouse_info, "greenhouse_id", 1);
    cJSON_AddNumberToObject(greenhouse_info, "zone_id", 1);

    cJSON_AddItemToObject(root, "module_info", module_info);
    if (strcmp(module_info_gt->type, "controller") == 0)
    {
        cJSON_AddStringToObject(module_info, "controller_identifier", module_info_gt->identity);
    }
    else
    {
        cJSON_AddStringToObject(module_info, "controller_identifier", CONFIG_ESP_NOW_COMM_RECIEVER_MAC_ADDRESS);
    }
    cJSON_AddStringToObject(module_info, "type", module_info_gt->type);
    cJSON_AddStringToObject(module_info, "firmware_version", app_info->version);
    char timestamp_buffer[34];
    snprintf(timestamp_buffer, sizeof(timestamp_buffer), "%s %s", __DATE__, __TIME__);
    cJSON_AddStringToObject(module_info, "date_compilied", timestamp_buffer);
    cJSON_AddStringToObject(module_info, "identifier", sensor_data_recv->module_id);
    cJSON_AddStringToObject(module_info, "location", module_info_gt->location);
    cJSON_AddNumberToObject(module_info, "sensor_id", sensor_data_recv->local_sensor_id);

    cJSON_AddItemToObject(root, "sensor_info", sensor_info);
    cJSON_AddNumberToObject(sensor_info, "sensor_pin", sensor_data_recv->pin_number);
    cJSON_AddStringToObject(sensor_info, "sensor_type", sensor_type_to_string(sensor_data_recv->sensor_type));

    char *timestamp = ctime(&sensor_data_recv->timestamp);
    timestamp[strcspn(timestamp, "\n")] = '\0';

    cJSON_AddStringToObject(sensor_info, "timestamp", timestamp);
    cJSON_AddStringToObject(sensor_info, "location", sensor_data_recv->location);
    cJSON_AddItemToObject(sensor_info, "data", sensor_data);

    switch (sensor_data_recv->sensor_type)
    {

    case DHT22:

        char value_name[25];
        for (int i = 0; i < sensor_data_recv->total_values; i++)
        {
            switch (sensor_data_recv->sensor_type)
            {
            case DHT22:
                switch (i)
                {
                case 0:
                    snprintf(value_name, 25, "temperature");
                    break;
                case 1:
                    snprintf(value_name, 25, "humidity");
                    break;
                }
                break;
            default:
                snprintf(value_name, 25, "%d", i);
                break;
                // implent other sensors as we go
            }

            cJSON_AddNumberToObject(sensor_data, value_name, sensor_data_recv->value[i]);
        }

        break;
    case SOIL_MOISTURE:
        break;
    case LIGHT:
        break;
    case SOUND:
        break;
    case MOVEMENT:
        break;
    case CAMERA:
        break;
    case SENSOR_LIST_TOTAL:
        ESP_LOGE(TAG, "out of bounds for sensor choice");
        err = ESP_FAIL;
        break;
    }

    char *sensor_data_json = cJSON_Print(root);
    cJSON_Delete(root);

    if (err == ESP_OK)
    {
        ESP_LOGD(TAG, "sensor data json created");
    }
    return sensor_data_json;
}