#ifndef ENV_CNTRL_H_
#define ENV_CNTRL_H_

#include <inttypes.h>
#include "esp_err.h"

typedef enum
{
    UNKNOWN = 0,
    LIGHT = 1,
    WATER = 2,
    FAN = 3,
    HEATER = 4
} EnvCntrlType;

typedef enum
{
    POWER_INTERNAL = 0,
    POWER_EXTERNAL = 1
} EnvRelayPwrSrc;

typedef enum
{
    OFF = 0,
    ON = 1,
} EnvCntrlState;

typedef struct Env_state_t
{
    int8_t id;
    int8_t pin;
    EnvCntrlType type;
    EnvRelayPwrSrc pwr_src;
    EnvCntrlState state;
} Env_state_t;

esp_err_t create_env_state_from_config(Env_state_t **state_arr_gt, int8_t total_relays);

void env_state_arr_json(int8_t total_relays);

#endif /*ENV_CNTRL_H*/