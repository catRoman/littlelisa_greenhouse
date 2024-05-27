#ifndef ENV_CNTRL_H_
#define ENV_CNTRL_H_

#include <inttypes.h>
#include "esp_err.h"

typedef enum
{
    ENV_CNTRL_UNKNOWN = 0,
    ENV_CNTRL_LIGHT = 1,
    ENV_CNTRL_WATER = 2,
    ENV_CNTRL_FAN = 3,
    ENV_CNTRL_HEATER = 4
} EnvCntrlType;

typedef enum
{
    POWER_INTERNAL = 0,
    POWER_EXTERNAL = 1
} EnvRelayPwrSrc;

typedef enum
{
    ENV_CNTRL_OFF = 0,
    ENV_CNTRL_ON = 1,
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

char* env_state_arr_json(int8_t total_relays);

char *cntrl_state_to_string(EnvCntrlState state);
char *relay_pwr_src_to_string(EnvRelayPwrSrc power_src);
char *cntrl_state_type_to_string(EnvCntrlType state_type);

#endif /*ENV_CNTRL_H*/