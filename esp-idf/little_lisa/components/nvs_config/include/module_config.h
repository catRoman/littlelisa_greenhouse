
#ifndef NVS_CONFIG_MODULE_CONFIG_H
#define NVS_CONFIG_MODULE_CONFIG_H
#include <inttypes.h>

#include "sensor_tasks.h"

typedef struct Module_sensor_config_t
{
    int8_t (*zn_rel_pos)[3];
    int8_t (*square_pos)[2];
    char **sensor_loc_arr;
    int8_t *sensor_pin_arr;

    int8_t total_sensor;
} Module_sensor_config_t;

typedef struct Module_info_t
{
    char *type;
    char *location;
    char *identity;
    int8_t greenhouse_id;
    int8_t zone_num;
    int8_t zn_rel_pos[3];
    int8_t square_pos[2];
    int8_t *sensor_arr;
    Module_sensor_config_t **sensor_config_arr;

} Module_info_t;

esp_err_t initiate_sensor_tasks(void);

void initiate_config(void);

Module_sensor_config_t *createModuleSensorConfig(int8_t (*zn_rel_pos)[3],
                                                 int8_t (*square_pos)[2], char **locations, int8_t *pins, int numLocations);

void freeModuleSensorConfig(Module_sensor_config_t *config);

Module_info_t *create_module_from_config(char *type,
                                         int8_t greenhouse_id,
                                         int8_t zone_num,
                                         int8_t zn_rel_pos[3],
                                         int8_t square_pos[2],
                                         char *location,
                                         int8_t *sensor_arr,
                                         Module_sensor_config_t **sensor_config_arr);

Module_info_t *create_module_from_NVS(void);

void freeModuleInfo(Module_info_t *info);

#endif /*NVS_CONFIG_MODULE_CONFIG_H*/