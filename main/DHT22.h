/* 

	DHT22 temperature sensor driver

*/

#ifndef DHT22_H_  
#define DHT22_H_

#define DHT_OK 0
#define DHT_CHECKSUM_ERROR -1
#define DHT_TIMEOUT_ERROR -2


#define DHT_INSIDE_GPIO			18
#define DHT_OUTSIDE_GPIO		19




typedef struct dht22_sensor_t {
	int pin_number;
	float temperature;
	float humidity;
	char* TAG;

} dht22_sensor_t;

/**
 *  Starts DHT22 inside sensor task
 *  start both inside and outside sensors
*/
void DHT22_sensor_task_start(void);


// == function prototypes =======================================

void 	setDHTgpio(int gpio, dht22_sensor_t *sensor);
void 	errorHandler(int response, dht22_sensor_t *sensor);
int 	readDHT(dht22_sensor_t *sensor);
float 	getHumidity(dht22_sensor_t *sensor);
float 	getTemperature(dht22_sensor_t *sensor);
int 	getSignalLevel( int usTimeOut, bool state, dht22_sensor_t *sensor);

#endif
