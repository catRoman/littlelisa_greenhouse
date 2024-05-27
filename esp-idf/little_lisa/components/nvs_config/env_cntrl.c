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

static const char TAG[] = "env_cntrl";

esp_err_t create_env_state_from_config(Env_state_t **env_cntrl_arr, int8_t total_relays)
{
    *env_cntrl_arr = (Env_state_t *)malloc(sizeof(Env_state_t) * total_relays);
    if (*env_cntrl_arr == NULL)
    {
        ESP_LOGE(TAG, "Memory allocation failed for env_cnt_arr");
        return ESP_ERR_NO_MEM;
    }
    for (int i = 0; i < total_relays; i++)
    {
        env_cntrl_arr[i]->id = i + 1;
    }
// relay 1===========================
#ifdef CONFIG_ENV_CNTRL_PIN_1
    env_cntrl_arr[0]->pin = CONFIG_ENV_CNTRL_PIN_1;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_1
    env_cntrl_arr[0]->type = CONFIG_ENV_CNTRL_TYPE_1;

#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_1
    env_cntrl_arr[0]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_1;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_1
    env_cntrl_arr[0]->state = CONFIG_ENV_CNTRL_STATE_1;
#endif

// Relay 2===================
#ifdef CONFIG_ENV_CNTRL_PIN_2
    env_cntrl_arr[1]->pin = CONFIG_ENV_CNTRL_PIN_2;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_2
    env_cntrl_arr[1]->type = CONFIG_ENV_CNTRL_TYPE_2;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_2
    env_cntrl_arr[1]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_2;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_2
    env_cntrl_arr[1]->state = CONFIG_ENV_CNTRL_STATE_2;
#endif

// relay 3==============================
#ifdef CONFIG_ENV_CNTRL_PIN_3
    env_cntrl_arr[2]->pin = CONFIG_ENV_CNTRL_PIN_3;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_3
    env_cntrl_arr[2]->type = CONFIG_ENV_CNTRL_TYPE_3;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_3
    env_cntrl_arr[2]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_3;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_3
    env_cntrl_arr[2]->state = CONFIG_ENV_CNTRL_STATE_3;
#endif

// relay 4==============================
#ifdef CONFIG_ENV_CNTRL_PIN_4
    env_cntrl_arr[3]->pin = CONFIG_ENV_CNTRL_PIN_4;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_4
    env_cntrl_arr[3]->type = CONFIG_ENV_CNTRL_TYPE_4;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_4
    env_cntrl_arr[3]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_4;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_4
    env_cntrl_arr[3]->state = CONFIG_ENV_CNTRL_STATE_4;
#endif

// relay 5==============================
#ifdef CONFIG_ENV_CNTRL_PIN_5
    env_cntrl_arr[4]->pin = CONFIG_ENV_CNTRL_PIN_5;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_5
    env_cntrl_arr[4]->type = CONFIG_ENV_CNTRL_TYPE_5;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_5
    env_cntrl_arr[4]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_5;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_5
    env_cntrl_arr[4]->state = CONFIG_ENV_CNTRL_STATE_5;
#endif

// relay 6==============================
#ifdef CONFIG_ENV_CNTRL_PIN_6
    env_cntrl_arr[5]->pin = CONFIG_ENV_CNTRL_PIN_6;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_6
    env_cntrl_arr[5]->type = CONFIG_ENV_CNTRL_TYPE_6;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_6
    env_cntrl_arr[5]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_6;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_6
    env_cntrl_arr[5]->state = CONFIG_ENV_CNTRL_STATE_6;
#endif

// relay 7==============================
#ifdef CONFIG_ENV_CNTRL_PIN_7
    env_cntrl_arr[6]->pin = CONFIG_ENV_CNTRL_PIN_7;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_7
    env_cntrl_arr[6]->type = CONFIG_ENV_CNTRL_TYPE_7;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_7
    env_cntrl_arr[6]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_7;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_7
    env_cntrl_arr[6]->state = CONFIG_ENV_CNTRL_STATE_7;
#endif

// relay 8==============================
#ifdef CONFIG_ENV_CNTRL_PIN_8
    env_cntrl_arr[7]->pin = CONFIG_ENV_CNTRL_PIN_8;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_8
    env_cntrl_arr[7]->type = CONFIG_ENV_CNTRL_TYPE_8;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_8
    env_cntrl_arr[7]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_8;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_8
    env_cntrl_arr[7]->state = CONFIG_ENV_CNTRL_STATE_8;
#endif

// relay 9==============================
#ifdef CONFIG_ENV_CNTRL_PIN_9
    env_cntrl_arr[8]->pin = CONFIG_ENV_CNTRL_PIN_9;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_9
    env_cntrl_arr[8]->type = CONFIG_ENV_CNTRL_TYPE_9;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_9
    env_cntrl_arr[8]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_9;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_9
    env_cntrl_arr[8]->state = CONFIG_ENV_CNTRL_STATE_9;
#endif

// relay 10==============================
#ifdef CONFIG_ENV_CNTRL_PIN_10
    env_cntrl_arr[9]->pin = CONFIG_ENV_CNTRL_PIN_10;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_10
    env_cntrl_arr[9]->type = CONFIG_ENV_CNTRL_TYPE_10;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_10
    env_cntrl_arr[9]->pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_10;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_10
    env_cntrl_arr[9]->state = CONFIG_ENV_CNTRL_STATE_10;
#endif

// relay 11==============================
#ifdef CONFIG_ENV_CNTRL_PIN_11
    env_cntrl_arr[10]->.pin = CONFIG_ENV_CNTRL_PIN_11;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_11
    env_cntrl_arr[10]->.type = CONFIG_ENV_CNTRL_TYPE_11;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_11
    env_cntrl_arr[10]->.pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_11;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_11
    env_cntrl_arr[10]->.state = CONFIG_ENV_CNTRL_STATE_11;
#endif

// relay 12==============================
#ifdef CONFIG_ENV_CNTRL_PIN_12
    env_cntrl_arr[11]->.pin = CONFIG_ENV_CNTRL_PIN_12;
#endif

#ifdef CONFIG_ENV_CNTRL_TYPE_12
    env_cntrl_arr[11]->.type = CONFIG_ENV_CNTRL_TYPE_12;
#endif
#ifdef CONFIG_ENV_CNTRL_EXT_PWR_12
    env_cntrl_arr[11]->.pwr_src = CONFIG_ENV_CNTRL_EXT_PWR_12;
#endif
#ifdef CONFIG_ENV_CNTRL_STATE_12
    env_cntrl_arr[11]->.state = CONFIG_ENV_CNTRL_STATE_12;
#endif

    return ESP_OK;
}

char *env_state_arr_json(int8_t total_configs)
{

    {
        // name, type,location, sensor arr, sensor config arr

        extern Env_state_t *env_state_arr_gt;

        cJSON *root = cJSON_CreateObject();
        cJSON *config[total_configs];

        for (int i = 0; i < total_configs; i++)
        {
            config[i] = cJSON_CreateObject();
            char buffer[10];
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