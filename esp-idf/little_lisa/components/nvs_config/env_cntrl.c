#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "sdkconfig.h"
#include "esp_log.h"
#include "esp_err.h"
#include "esp_system.h"
#include "cJSON.h"

// components
#include "env_cntrl.h"
#include "task_common.h"
#include "nvs_service.h"

static const char TAG[] = "env_cntrl";

QueueHandle_t env_cntrl_queue_handle = NULL;
TaskHandle_t env_cntrl_task_handle = NULL;


esp_err_t create_env_state_from_config(Env_state_t *env_cntrl_arr, int8_t total_relays)
{


    for (int i = 0; i < total_relays; i++)
    {
        env_cntrl_arr[i].id = i ;
    }
// relay 1===========================
#ifdef CONFIG_ENV_CNTRL_PIN_1
   env_cntrl_arr[0].pin = CONFIG_ENV_CNTRL_PIN_1;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_1
    env_cntrl_arr[0].type = CONFIG_ENV_CNTRL_TYPE_1;

#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_1
    env_cntrl_arr[0].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_1;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_1
    env_cntrl_arr[0].state = CONFIG_ENV_CNTRL_STATE_1;
#endif

// Relay 2===================
#ifdef CONFIG_ENV_CNTRL_PIN_2
    env_cntrl_arr[1].pin = CONFIG_ENV_CNTRL_PIN_2;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_2
    env_cntrl_arr[1].type = CONFIG_ENV_CNTRL_TYPE_2;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_2
    env_cntrl_arr[1].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_2;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_2
    env_cntrl_arr[1].state = CONFIG_ENV_CNTRL_STATE_2;
#endif

// relay 3==============================
#ifdef CONFIG_ENV_CNTRL_PIN_3
    env_cntrl_arr[2].pin = CONFIG_ENV_CNTRL_PIN_3;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_3
    env_cntrl_arr[2].type = CONFIG_ENV_CNTRL_TYPE_3;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_3
    env_cntrl_arr[2].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_3;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_3
    env_cntrl_arr[2].state = CONFIG_ENV_CNTRL_STATE_3;
#endif

// relay 4==============================
#ifdef CONFIG_ENV_CNTRL_PIN_4
    env_cntrl_arr[3].pin = CONFIG_ENV_CNTRL_PIN_4;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_4
    env_cntrl_arr[3].type = CONFIG_ENV_CNTRL_TYPE_4;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_4
    env_cntrl_arr[3].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_4;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_4
    env_cntrl_arr[3].state = CONFIG_ENV_CNTRL_STATE_4;
#endif

// relay 5==============================
#ifdef CONFIG_ENV_CNTRL_PIN_5
    env_cntrl_arr[4].pin = CONFIG_ENV_CNTRL_PIN_5;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_5
    env_cntrl_arr[4].type = CONFIG_ENV_CNTRL_TYPE_5;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_5
    env_cntrl_arr[4].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_5;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_5
    env_cntrl_arr[4].state = CONFIG_ENV_CNTRL_STATE_5;
#endif

// relay 6==============================
#ifdef CONFIG_ENV_CNTRL_PIN_6
    env_cntrl_arr[5].pin = CONFIG_ENV_CNTRL_PIN_6;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_6
    env_cntrl_arr[5].type = CONFIG_ENV_CNTRL_TYPE_6;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_6
    env_cntrl_arr[5].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_6;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_6
    env_cntrl_arr[5].state = CONFIG_ENV_CNTRL_STATE_6;
#endif

// relay 7==============================
#ifdef CONFIG_ENV_CNTRL_PIN_7
    env_cntrl_arr[6].pin = CONFIG_ENV_CNTRL_PIN_7;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_7
    env_cntrl_arr[6].type = CONFIG_ENV_CNTRL_TYPE_7;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_7
    env_cntrl_arr[6].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_7;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_7
    env_cntrl_arr[6].state = CONFIG_ENV_CNTRL_STATE_7;
#endif

// relay 8==============================
#ifdef CONFIG_ENV_CNTRL_PIN_8
    env_cntrl_arr[7].pin = CONFIG_ENV_CNTRL_PIN_8;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_8
    env_cntrl_arr[7].type = CONFIG_ENV_CNTRL_TYPE_8;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_8
    env_cntrl_arr[7].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_8;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_8
    env_cntrl_arr[7].state = CONFIG_ENV_CNTRL_STATE_8;
#endif

// relay 9==============================
#ifdef CONFIG_ENV_CNTRL_PIN_9
    env_cntrl_arr[8].pin = CONFIG_ENV_CNTRL_PIN_9;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_9
    env_cntrl_arr[8].type = CONFIG_ENV_CNTRL_TYPE_9;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_9
    env_cntrl_arr[8].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_9;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_9
    env_cntrl_arr[8].state = CONFIG_ENV_CNTRL_STATE_9;
#endif

// relay 10==============================
#ifdef CONFIG_ENV_CNTRL_PIN_10
    env_cntrl_arr[9].pin = CONFIG_ENV_CNTRL_PIN_10;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_10
    env_cntrl_arr[9].type = CONFIG_ENV_CNTRL_TYPE_10;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_10
    env_cntrl_arr[9].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_10;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_10
    env_cntrl_arr[9].state = CONFIG_ENV_CNTRL_STATE_10;
#endif

// relay 11==============================
#ifdef CONFIG_ENV_CNTRL_PIN_11
    env_cntrl_arr[10].pin = CONFIG_ENV_CNTRL_PIN_11;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_11
    env_cntrl_arr[10].type = CONFIG_ENV_CNTRL_TYPE_11;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_11
    env_cntrl_arr[10].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_11;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_11
    env_cntrl_arr[10].state = CONFIG_ENV_CNTRL_STATE_11;
#endif

// relay 12==============================
#ifdef CONFIG_ENV_CNTRL_PIN_12
    env_cntrl_arr[11].pin = CONFIG_ENV_CNTRL_PIN_12;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_12
    env_cntrl_arr[11].type = CONFIG_ENV_CNTRL_TYPE_12;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_12
    env_cntrl_arr[11].pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_12;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_12
    env_cntrl_arr[11].state = CONFIG_ENV_CNTRL_STATE_12;
#endif

    return ESP_OK;
}

char *env_state_arr_json(int8_t total_configs)
{

    {
        // name, type,location, sensor arr, sensor config arr

        extern Env_state_t env_state_arr_gt[MAX_RELAYS];

        cJSON *root = cJSON_CreateObject();
        cJSON *config[total_configs];

        for (int i = 0; i < total_configs; i++)
        {
            ESP_LOGE(TAG, "%d", i);
            config[i] = cJSON_CreateObject();
            char buffer[20];
            snprintf(buffer, sizeof(buffer), "relay_%d", (i + 1));
            cJSON_AddItemToObject(root, buffer, config[i]);
            cJSON_AddNumberToObject(config[i], "id", env_state_arr_gt[i].id);
            cJSON_AddNumberToObject(config[i], "pin", env_state_arr_gt[i].pin);
            cJSON_AddStringToObject(config[i], "type", cntrl_state_type_to_string(env_state_arr_gt[i].type));
            cJSON_AddStringToObject(config[i], "pwr_src", relay_pwr_src_to_string(env_state_arr_gt[i].pwr_src));
            cJSON_AddStringToObject(config[i], "state", cntrl_state_to_string(env_state_arr_gt[i].state));
        }

        char *json_string = cJSON_Print(root);

        cJSON_Delete(root);
        return json_string;
    }
}
char *cntrl_state_to_string(EnvCntrlState state)
{
    char *state_string = malloc(sizeof(char) * 4);

    switch (state)
    {
    case ENV_CNTRL_OFF:
        strncpy(state_string, "off", 4);

        break;

    case ENV_CNTRL_ON:
        strncpy(state_string, "on", 3);

        break;
    }
    state_string[4] = '\0';
    return state_string;
}
char *relay_pwr_src_to_string(EnvRelayPwrSrc power_src)
{
    char *power_src_string = malloc(sizeof(char) * 10);

    switch (power_src)
    {
    case POWER_INTERNAL:
        strncpy(power_src_string, "internal", 10);
        break;

    case POWER_EXTERNAL:
        strncpy(power_src_string, "external", 10);
        break;
    }

    power_src_string[10] = '\0';
    return power_src_string;
}
char *cntrl_state_type_to_string(EnvCntrlType state_type)
{
    char *state_type_string = malloc(sizeof(char) * 8);

    switch (state_type)
    {
    case ENV_CNTRL_UNKNOWN:
        strncpy(state_type_string, "unknown", 8);
        break;

    case ENV_CNTRL_WATER:
        strncpy(state_type_string, "water", 6);
        break;

    case ENV_CNTRL_LIGHT:
        strncpy(state_type_string, "light", 7);
        break;

    case ENV_CNTRL_FAN:
        strncpy(state_type_string, "fan", 4);
        break;

    case ENV_CNTRL_HEATER:
        strncpy(state_type_string, "heater", 8);
        break;
    }

    state_type_string[10] = '\0';
    return state_type_string;
}

void env_cntrl_task(void *vpParameter)
{
    extern Env_state_t env_state_arr_gt[MAX_RELAYS];
    extern int8_t total_relays;
    ESP_LOGI(TAG, "env_cntrl task started");
    State_event_t *state_event;

  for (;;)
    {
        if (xQueueReceive(env_cntrl_queue_handle, &state_event, portMAX_DELAY) == pdTRUE)
        {
            ESP_LOGW(TAG, "env_cntrl state change recieved");
            ESP_LOGW(TAG, "current state -> \nid: %d\npin:%d\ntype: %s\n pwr_src: %s\n->state:%s",
            env_state_arr_gt[state_event->id].id,
            env_state_arr_gt[state_event->id].pin,
            cntrl_state_type_to_string(env_state_arr_gt[state_event->id].type),
            relay_pwr_src_to_string(env_state_arr_gt[state_event->id].pwr_src),
            cntrl_state_to_string(env_state_arr_gt[state_event->id].state)
            );
            env_state_arr_gt[state_event->id].state = state_event->state;

             ESP_LOGW(TAG, "new state -> \nid: %d\npin:%d\ntype: %s\n pwr_src: %s\n->state:%s",
            env_state_arr_gt[state_event->id].id,
            env_state_arr_gt[state_event->id].pin,
            cntrl_state_type_to_string(env_state_arr_gt[state_event->id].type),
            relay_pwr_src_to_string(env_state_arr_gt[state_event->id].pwr_src),
            cntrl_state_to_string(env_state_arr_gt[state_event->id].state)
            );
             ESP_LOGW(TAG, "updating nvs");
            nvs_set_env_state_arr(env_state_arr_gt, total_relays);


            taskYIELD();
        }
    }

}

esp_err_t initiate_env_cntrl()
{

    //===========================heap tracing=================
    // #define NUM_RECORDS 100                                    // Adjust this number based on available memory and needed trace duration
    //     static heap_trace_record_t trace_records[NUM_RECORDS]; // Allocate memory for trace records

    //     esp_err_t ret = heap_trace_init_standalone(trace_records, NUM_RECORDS);
    //     if (ret != ESP_OK)
    //     {
    //         printf("Heap trace initialization failed\n");
    //     }

    //===========================================

    ESP_LOGI(TAG, "env_cntrl queue init started");
    esp_log_level_set(TAG, ESP_LOG_INFO);

    env_cntrl_queue_handle = xQueueCreate(10, sizeof(State_event_t));
    if (env_cntrl_queue_handle == NULL)
    {
        ESP_LOGE(TAG, "queue not created");
        return ESP_ERR_NO_MEM;
    }

   BaseType_t task_code;
    task_code = xTaskCreatePinnedToCore(
        env_cntrl_task,
        "evn_state_m",
        ENV_CNTRL_STACK_SIZE,
        NULL,
        ENV_CNTRL_TASK_PRIORITY,
        &env_cntrl_task_handle,
        ENV_CNTRL_TASK_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
        return ESP_ERR_NO_MEM;
    }
return ESP_OK;
}
