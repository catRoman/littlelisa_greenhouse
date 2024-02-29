/**
 * @file		sensor_tasks_comm.h
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-02-26
 *
 */

#ifndef MAIN_SENSOR_TASKS_H_
#define MAIN_SENSOR_TASKS_H_

#include "freertos/FreeRTOS.h"
#include "esp_system.h"

typedef enum Sensor_List{
    TEMP,
    HUMIDITY,
    SOIL_MOISTURE,
    LIGHT,
    SOUND,
    MOVEMENT,
    CAMERA,
    SENSOR_LIST_TOTAL
}Sensor_List;

typedef struct sensor_data_t{
	int pin_number;
    Sensor_List sensor_type;
	float *value;
    int total_values;
	char* location;
	int local_sensor_id;
    int module_id;

} sensor_data_t;

//sensor agnostic as long as data is recieved in strtandard struct definition
typedef enum sensor_event_type
{
    SENSOR_PREPOCESSING, //validation and routing (controller/node)
    SENSOR_ESP_NOW_SEND, //sent in struct
    SENSOR_ESP_NOW_REC, //sent in struct
    SENSOR_POST_PROCESS, //routing, packet addition(based on sensor) and jsonify (controller/node)
    SENSOR_SEND_TO_RAM, //sent in struct
    SENSOR_SEND_TO_SD_DB,   //json? or direct to db
    SENSOR_SEND_TO_SERVER_DB,   //json? or direct to db

} sensor_event_type;

typedef struct sensor_queue_wrapper_t
{
    sensor_event_type eventID;
    sensor_data_t *sensor_data;
    int semphoreCount;
} sensor_queue_wrapper_t;


esp_err_t sensor_queue_start(void);


#endif 
