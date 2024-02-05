/*

	DHT22 temperature sensor driver

*/

#ifndef DHT22_H_
#define DHT22_H_

#define DHT_OK 0
#define DHT_CHECKSUM_ERROR -1
#define DHT_TIMEOUT_ERROR -2


#define DHT_INSIDE_GPIO			4
#define DHT_OUTSIDE_GPIO		2




typedef struct dht22_sensor_t {
	int pin_number;
	float temperature;
	float humidity;
	char* TAG;
	char temp_unit;
	char humidity_unit;

} dht22_sensor_t;

/**
 *  Starts DHT22 inside sensor task
 *  start both inside and outside sensors
*/
void DHT22_sensor_task_start(void);
char * get_DHT22_JSON_String(dht22_sensor_t *sensor);

// == function prototypes =======================================

void 	setDHTgpio(int gpio, dht22_sensor_t *sensor_t);
void 	errorHandler(int response, dht22_sensor_t *sensor_t);
int 	readDHT(dht22_sensor_t *sensor_t);
float 	get_humidity(dht22_sensor_t *sensor_t);
float 	get_temperature(dht22_sensor_t *sensor_t);
int 	getSignalLevel( int usTimeOut, bool state, dht22_sensor_t *sensor_t);

#endif
