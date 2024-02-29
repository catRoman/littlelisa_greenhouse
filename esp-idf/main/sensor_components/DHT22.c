/*------------------------------------------------------------------------------

	DHT22 temperature & humidity sensor_t AM2302 (DHT22) driver for ESP32

	Jun 2017:	Ricardo Timmermann, new for DHT22

	Code Based on Adafruit Industries and Sam Johnston and Coffe & Beer. Please help
	to improve this code.

	This example code is in the Public Domain (or CC0 licensed, at your option.)

	Unless required by applicable law or agreed to in writing, this
	software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	CONDITIONS OF ANY KIND, either express or implied.

	PLEASE KEEP THIS CODE IN LESS THAN 0XFF LINES. EACH LINE MAY CONTAIN ONE BUG !!!

---------------------------------------------------------------------------------*/
#define LOG_LOCAL_LEVEL ESP_LOG_VERBOSE

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "esp_sntp.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/portmacro.h"
#include "esp_system.h"
#include "driver/gpio.h"
#include "cJSON.h"
#include "freertos/semphr.h"
#include "sdkconfig.h"

#include "network_components/esp_now_comm.h"
#include "DHT22.h"
#include "task_common.h"
#include "nvs_components/module_config.h"
#include "sensor_components/sensor_tasks.h"
#include "network_components/esp_now_comm.h"

// == global defines =============================================


static const char TAG [] = "dht22_sensor";
SemaphoreHandle_t xSemaphore = NULL;
static portMUX_TYPE myMutex = portMUX_INITIALIZER_UNLOCKED;



// == get temp & hum =============================================

float get_humidity(dht22_sensor_t *sensor_t) { return sensor_t->humidity; }
float get_temperature(dht22_sensor_t *sensor_t) { return sensor_t->temperature; }


//TODO: once more types of sensors are used turn this generic using void * and call value to sensor specific function
//== Log JSON of data ============================
char * get_DHT22_SENSOR_JSON_String(dht22_sensor_t *sensor_t, int sensor_choice)
{
	time_t currentTime;
	time(&currentTime);

	cJSON *json_data = cJSON_CreateObject();

	cJSON_AddNumberToObject(json_data, "identity", sensor_t->identifier);
	cJSON_AddStringToObject(json_data, "timestamp", ctime(&currentTime));
	cJSON_AddStringToObject(json_data, "location", sensor_t->TAG);
	cJSON_AddNumberToObject(json_data, "pin", sensor_t->pin_number);
	if(sensor_choice == HUMIDITY){
		cJSON_AddNumberToObject(json_data, "value", get_humidity(sensor_t));
		cJSON_AddStringToObject(json_data, "unit", sensor_t->humidity_unit);
	}else if(sensor_choice == TEMP){
		cJSON_AddNumberToObject(json_data, "value", get_temperature(sensor_t));
		cJSON_AddStringToObject(json_data, "unit", sensor_t->temp_unit);
	}

	char *json_string = cJSON_Print(json_data);

	cJSON_Delete(json_data);

	return json_string;

}
 void log_sensor_JSON(dht22_sensor_t *sensor_t, int sensor_choice){
	char * json_string = get_DHT22_SENSOR_JSON_String(sensor_t, sensor_choice);
	ESP_LOGV(TAG, "{==%s==} Logged JSON Data: %s", sensor_t->TAG, json_string);
	free(json_string);
 }

//TODO: rewrite module_config and this to work on sensor types
// thuis tansfering both temp and humidity at once
void dht22_sensor_send_to_sensor_queue(dht22_sensor_t *sensor_t, int sensor_choice){


	//allocate for data_packet
	sensor_data_t *data_packet = (sensor_data_t*)malloc(sizeof(sensor_data_t));

	data_packet->pin_number= sensor_t->pin_number;
	data_packet->total_values = 1;
	data_packet->local_sensor_id = sensor_t->identifier;
	data_packet->module_id = CONFIG_MODULE_IDENTITY;
	data_packet->timestamp = 0;

	//TODO: mem error handling
	data_packet->value = (float *)malloc(data_packet->total_values * sizeof(float));
	data_packet->location = (char*)malloc(strlen(sensor_t->TAG)+1);
	strcpy(data_packet->location, sensor_t->TAG);


	if(sensor_choice == HUMIDITY){
		data_packet->sensor_type = HUMIDITY;
		data_packet->value[0] = get_humidity(sensor_t);
	}else if(sensor_choice == TEMP){
		data_packet->sensor_type = TEMP;
		data_packet->value[0] = get_temperature(sensor_t);
	}

	//sensor queue wrapper mem allocation
	sensor_queue_wrapper_t *queue_packet = (sensor_queue_wrapper_t*)malloc(sizeof(sensor_queue_wrapper_t));

	queue_packet->nextEventID = SENSOR_PREPOCESSING;
	queue_packet->sensor_data = data_packet;
	queue_packet->semphoreCount = 0;


	extern QueueHandle_t sensor_queue_handle;
	if(xQueueSend(sensor_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS){
			ESP_LOGI(TAG, "data recieved from internal sensor and sent to sensor que for processing");
		}else{
			ESP_LOGE(TAG, "data recieved from internal sensor failed to transfer to sensor que");
		}



}




// == error handler ===============================================

void errorHandler(int response, dht22_sensor_t *sensor_t)
{
	switch(response) {

		case DHT_TIMEOUT_ERROR :
			ESP_LOGE( TAG, "{==%s==}: Sensor Timeout\n",sensor_t->TAG);
			break;

		case DHT_CHECKSUM_ERROR:
			ESP_LOGE( TAG, "{==%s==}: CheckSum error\n", sensor_t->TAG );
			break;

		case DHT_OK:
			break;

		default :
			ESP_LOGE( TAG, "{==%s==}: Unknown error\n",  sensor_t->TAG);
	}
}

/*-------------------------------------------------------------------------------
;
;	get next state
;
;	I don't like this logic. It needs some interrupt blocking / priority
;	to ensure it runs in realtime.
;
;--------------------------------------------------------------------------------*/

int getSignalLevel( int usTimeOut, bool state, dht22_sensor_t *sensor_t )
{


	int uSec = 0;

	portENTER_CRITICAL(&myMutex);

	while( gpio_get_level(sensor_t->pin_number)==state ) {

		if( uSec > usTimeOut ){
			portEXIT_CRITICAL(&myMutex);
			return -1;
		}

		++uSec;
		esp_rom_delay_us(1);		// uSec delay
	}
	portEXIT_CRITICAL(&myMutex);
	return uSec;
}

/*----------------------------------------------------------------------------
;
;	read DHT22 sensor_t

copy/paste from AM2302/DHT22 Docu:

DATA: Hum = 16 bits, Temp = 16 Bits, check-sum = 8 Bits

Example: MCU has received 40 bits data from AM2302 as
0000 0010 1000 1100 0000 0001 0101 1111 1110 1110
16 bits RH data + 16 bits T data + check sum

1) we convert 16 bits RH data from binary system to decimal system, 0000 0010 1000 1100 → 652
Binary system Decimal system: RH=652/10=65.2%RH

2) we convert 16 bits T data from binary system to decimal system, 0000 0001 0101 1111 → 351
Binary system Decimal system: T=351/10=35.1°C

When highest bit of temperature is 1, it means the temperature is below 0 degree Celsius.
Example: 1000 0000 0110 0101, T= minus 10.1°C: 16 bits T data

3) Check Sum=0000 0010+1000 1100+0000 0001+0101 1111=1110 1110 Check-sum=the last 8 bits of Sum=11101110

Signal & Timings:

The interval of whole process must be beyond 2 seconds.

To request data from DHT:

1) Sent low pulse for > 1~10 ms (MILI SEC)
2) Sent high pulse for > 20~40 us (Micros).
3) When DHT detects the start signal, it will pull low the bus 80us as response signal,
   then the DHT pulls up 80us for preparation to send data.
4) When DHT is sending data to MCU, every bit's transmission begin with low-voltage-level that last 50us,
   the following high-voltage-level signal's length decide the bit is "1" or "0".
	0: 26~28 us
	1: 70 us

;----------------------------------------------------------------------------*/

#define MAXdhtData 5	// to complete 40 = 5*8 Bits

int readDHT(dht22_sensor_t *sensor_t)
{



int uSec = 0;

uint8_t dhtData[MAXdhtData];
uint8_t byteInx = 0;
uint8_t bitInx = 7;


// instance varables
int DHTgpio = sensor_t->pin_number;
float humidity = sensor_t->humidity;
float temperature = sensor_t->temperature;

	for (int k = 0; k<MAXdhtData; k++)
		dhtData[k] = 0;

	// == Send start signal to DHT sensor_t ===========
	gpio_set_direction( DHTgpio, GPIO_MODE_OUTPUT );

	// pull down for 3 ms for a smooth and nice wake up
	gpio_set_level( DHTgpio, 0 );
	esp_rom_delay_us( 3000 );

	// pull up for 25 us for a gentile asking for data
	gpio_set_level( DHTgpio, 1 );
	esp_rom_delay_us( 30 );

	gpio_set_direction( DHTgpio, GPIO_MODE_INPUT );		// change to input mode

	// == DHT will keep the line low for 80 us and then high for 80us ====

	uSec = getSignalLevel( 80, 0, sensor_t );
	//ESP_LOGV( TAG, "{==%s==} Response = %d",sensor_t->TAG, uSec );
	if( uSec<0 ) return DHT_TIMEOUT_ERROR;

	// -- 80us up ------------------------

	uSec = getSignalLevel( 80, 1 , sensor_t);
	//ESP_LOGV( TAG, "{==%s==} Response = %d",sensor_t->TAG, uSec );
	if( uSec<0 ) return DHT_TIMEOUT_ERROR;

	// == No errors, read the 40 data bits ================

	for( int k = 0; k < 40; k++ ) {

		// -- starts new data transmission with >50us low signal

		uSec = getSignalLevel( 50, 0 , sensor_t);
		//ESP_LOGV( TAG, "{==%s==} Data Read Response = %d",sensor_t->TAG, uSec );
		if( uSec<0 ) return DHT_TIMEOUT_ERROR;

		// -- check to see if after >70us rx data is a 0 or a 1

		uSec = getSignalLevel( 70, 1 , sensor_t);
		//ESP_LOGV( TAG, "{==%s==} Data Read Response 2 = %d",sensor_t->TAG, uSec );
		if( uSec<0 ) return DHT_TIMEOUT_ERROR;

		// add the current read to the output data
		// since all dhtData array where set to 0 at the start,
		// only look for "1" (>28us us)

		if (uSec > 27) {
			dhtData[ byteInx ] |= (1 << bitInx);
			}

		// index to next byte

		if (bitInx == 0) { bitInx = 7; ++byteInx; }
		else bitInx--;
	}

	// == get humidity from Data[0] and Data[1] ==========================

	humidity = dhtData[0];
	humidity *= 0x100;					// >> 8
	humidity += dhtData[1];
	humidity /= 10;						// get the decimal

	// == get temp from Data[2] and Data[3]

	temperature = dhtData[2] & 0x7F;
	temperature *= 0x100;				// >> 8
	temperature += dhtData[3];
	temperature /= 10;

	if( dhtData[2] & 0x80 ) 			// negative temp, brrr it's freezing
		temperature *= -1;

	sensor_t->temperature = temperature;
	sensor_t->humidity = humidity;
	// == verify if checksum is ok ===========================================
	// Checksum is the sum of Data 8 bits masked out 0xFF

	if (dhtData[4] == ((dhtData[0] + dhtData[1] + dhtData[2] + dhtData[3]) & 0xFF))
		return DHT_OK;

	else
		return DHT_CHECKSUM_ERROR;

}


/**
 * DHT22 Sensor task
*/
void DHT22_task(void *vpParameter)
{
	dht22_sensor_t *sensor_t;
	sensor_t = (dht22_sensor_t *)vpParameter;


	gpio_set_direction(sensor_t->pin_number, GPIO_MODE_INPUT);
	esp_rom_delay_us( 100 );
	gpio_set_pull_mode(sensor_t->pin_number, GPIO_PULLUP_ONLY);
	vTaskDelay(pdMS_TO_TICKS(1000));
	esp_log_level_set(TAG, ESP_LOG_INFO);

	for(;;)
	{

		//printf("=== Reading DHT ===\n");
		int ret = readDHT(sensor_t);

		if (ret == DHT_OK){
			log_sensor_JSON(sensor_t, TEMP);
			log_sensor_JSON(sensor_t, HUMIDITY);
			#ifdef CONFIG_MODULE_TYPE_NODE
			send_sensor_struct(sensor_t, HUMIDITY);
			send_sensor_struct(sensor_t, TEMP);
			#endif
			 //TODO: change either the function name or the function for better focus
		}else{
			errorHandler(ret, sensor_t);
		}

		// Wait at least 2 seconds before reading again (as suggested by driver author)
		// The interval of the whole process must be more than 2 seconds

		vTaskDelay(5000 / portTICK_PERIOD_MS);
	}
}
