/**
 * @file		sensor_tasks_comm.h
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-02-26
 *
 */

#ifndef SENSORS_SENSOR_TASKS_H_
#define SENSORS_SENSOR_TASKS_H_

#include <inttypes.h>

#include "freertos/FreeRTOS.h"
#include "esp_system.h"
#include "esp_err.h"
#include "esp_http_client.h"
#include <time.h>

typedef enum Sensor_List
{
    DHT22,
    SOIL_MOISTURE,
    LIGHT,
    SOUND,
    MOVEMENT,
    CAMERA,
    SENSOR_LIST_TOTAL
} Sensor_List;

typedef struct sensor_data_t
{
    int8_t pin_number;
    Sensor_List sensor_type;
    float *value;
    int8_t total_values;
    char *location;
    int8_t local_sensor_id;
    char *module_id;
    time_t timestamp;
    char *module_type;
    char *module_location;
    int8_t sensor_square_pos[2];
    int8_t sensor_zn_rel_pos[3];
    int8_t module_square_pos[2];
    int8_t module_zn_rel_pos[3];

} sensor_data_t;

// sensor agnostic as long as data is recieved in strtandard struct definition
typedef enum sensor_event_type
{
    SENSOR_PREPOCESSING,    // validation and routing (controller/node)
    SENSOR_PREPARE_TO_SEND, // sent in struct
    SENSOR_POST_PROCESSING, // routing, packet addition(based on sensor) and jsonify (controller/node)-timestamp
    SENSOR_SEND_TO_RAM,     // sent in struct
    SENSOR_SEND_TO_SD_DB,   // json? or direct to db
    SENSOR_SEND_TO_SERVER,  // json? or direct to db
    SENSOR_QUEUE_MEM_CLEANUP,
    SENSOR_SEND_TO_WEBSOCKET_SERVER

} sensor_event_type;

typedef struct sensor_queue_wrapper_t
{
    sensor_event_type nextEventID;
    sensor_data_t *sensor_data;
    int semphoreCount;
    int current_send_id;
} sensor_queue_wrapper_t;

esp_err_t initiate_sensor_queue(void);
char *sensor_type_to_string(Sensor_List sensor_type);
void sensor_preprocessing_task(void *pvParameters);
void sensor_prepare_to_send_task(void *pvParameters);
void sensor_post_processing_task(void *pvParameters);
void sensor_send_to_ram_task(void *pvParameters);
void sensor_send_to_sd_db_task(void *pvParameters);
void sensor_send_to_server_db_task(void *pvParameters);
void sensor_queue_mem_cleanup_task(void *pvParameters);
void sensor_send_to_websocket_server_task(void *pvParameters);
esp_http_client_handle_t initialize_http_client(void);

#endif
