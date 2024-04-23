
#include "esp_err.h"
#include "sensor_tasks.h"
#include "cJSON.h"
#include "string.h"
#include "esp_log.h"

char *TAG = "SENSOR_HELPER";

char *create_sensor_data_json(sensor_data_t *sensor_data_recv)
{
    // temp for logging testing
    esp_err_t err = ESP_OK;

    cJSON *root = cJSON_CreateObject();
    cJSON *module_info = cJSON_CreateObject();
    cJSON *sensor_info = cJSON_CreateObject();
    cJSON *sensor_data = cJSON_CreateObject();

    cJSON_AddItemToObject(root, "module_info", module_info);
    cJSON_AddStringToObject(module_info, "module_id", sensor_data_recv->module_id);
    cJSON_AddNumberToObject(module_info, "local_sensor_id", sensor_data_recv->local_sensor_id);
    cJSON_AddNumberToObject(sensor_info, "module_pin", sensor_data_recv->pin_number);

    cJSON_AddItemToObject(root, "sensor_data", sensor_info);
    cJSON_AddStringToObject(sensor_info, "sensor_type", sensor_type_to_string(sensor_data_recv->sensor_type));

    char *timestamp = ctime(&sensor_data_recv->timestamp);
    timestamp[strcspn(timestamp, "\n")] = '\0';

    cJSON_AddStringToObject(sensor_info, "timestamp", timestamp);
    cJSON_AddStringToObject(sensor_info, "location", sensor_data_recv->location);
    cJSON_AddItemToObject(sensor_info, "sensor_data", sensor_data);

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
                    snprintf(value_name, 25, "temp");
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