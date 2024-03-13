
#ifndef MODULE_CONFIG_H
#define MODULE_CONFIG_H
#include "sensor_components/sensor_tasks.h"

typedef struct Module_sensor_config_t{
    char **sensor_loc_arr;
    int8_t *sensor_pin_arr;
    int8_t total_sensor;
}Module_sensor_config_t;

typedef struct Module_info_t{
    char *type;
    char *location;
    int8_t identity;
    int8_t *sensor_arr;
    Module_sensor_config_t sensor_config_arr[SENSOR_LIST_TOTAL];

}Module_info_t;


void initiate_sensor_tasks(void);

void initiate_config(void);

Module_sensor_config_t *createModuleSensorConfig(char **locations, int8_t *pins, int numLocations);

void freeModuleSensorConfig(Module_sensor_config_t *config);

Module_info_t *create_module_from_NVS(void);

void freeModuleInfo(Module_info_t *info);

#endif