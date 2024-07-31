#ifndef ENV_CNTRL_H_
#define ENV_CNTRL_H_

#include <inttypes.h>
#include "esp_err.h"
<<<<<<< HEAD
#define MAX_RELAYS 12
=======
#define MAX_RELAYS 8
#define ENV_CNTRL_SER 26   // Data
#define ENV_CNTRL_SRCLK 25 // clock
#define ENV_CNTRL_RCLK 33  // latch
>>>>>>> landing_page
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
    ENV_CNTRL_OFF = 1,
    ENV_CNTRL_ON = 0,
} EnvCntrlState;

typedef struct Env_state_t
{
    int8_t id;
    int8_t pin;
    EnvCntrlType type;
    EnvRelayPwrSrc pwr_src;
    EnvCntrlState state;
} Env_state_t;

typedef struct State_event
{
    int8_t id;
    // EnvCntrlState state;
} State_event_t;

esp_err_t create_env_state_from_config(Env_state_t *state_arr_gt, int8_t total_relays);

<<<<<<< HEAD
char* env_state_arr_json(int8_t total_relays);
=======
char *env_state_arr_json(int8_t total_relays);
>>>>>>> landing_page

char *cntrl_state_to_string(EnvCntrlState state);
char *relay_pwr_src_to_string(EnvRelayPwrSrc power_src);
char *cntrl_state_type_to_string(EnvCntrlType state_type);
void env_cntrl_task(void *vpParameter);
esp_err_t initiate_env_cntrl(void);

#endif /*ENV_CNTRL_H*/