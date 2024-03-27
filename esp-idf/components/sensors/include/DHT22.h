/*

	DHT22 temperature sensor driver

*/

#ifndef SENSORS_DHT22_H_
#define SENSORS_DHT22_H_

#include "sensor_tasks.h"

#define DHT_OK 0
#define DHT_CHECKSUM_ERROR -1
#define DHT_TIMEOUT_ERROR -2


typedef enum DHT22_value_types{
	TEMP,
	HUMIDITY,
	DHT22_TOTAL_VALUE_TYPES
}DHT22_value_types;



/**
 *  Starts DHT22 inside sensor task
 *  start both inside and outside sensors
*/
void DHT22_sensor_task_start(void);
char * get_DHT22_SENSOR_JSON_String(sensor_data_t *sensor, int sensor_choice);


// == function prototypes =======================================

void 	setDHTgpio(int gpio, sensor_data_t *sensor_t);
void 	errorHandler(int response, sensor_data_t *sensor_t);
int 	readDHT(sensor_data_t *sensor_t);
float 	get_humidity(sensor_data_t *sensor_t);
float 	get_temperature(sensor_data_t *sensor_t);
int 	getSignalLevel( int usTimeOut, bool state, sensor_data_t *sensor_t);
void 	DHT22_task(void *vpParameter);

void dht22_sensor_send_to_sensor_queue(sensor_data_t *sensor_t, int sensor_choice, int send_id);

#endif
