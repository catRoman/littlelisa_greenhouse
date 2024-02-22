/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */
#include <time.h>
#include <sys/time.h>
#include <string.h>

#include "nvs_flash.h"
#include "esp_log.h"

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "network_components/wifi_ap_sta.h"
#include "module_components/DHT22.h"
#include "nvs_components/nvs_service.h"
#include "network_components/sntp.h"
#include "module_components/spi_sd_card.h"
#include "module_components/rtc_DS1302.h"
#include "module_components/ds1302.h"
#include "nvs_components/node_info.h"
#include "network_components/http_server.h"
#include "module_components/led.h"
#include "database_components/sd_card_db.h"

//TODO: esp-now feature
//TODO: kconfig for module config using kconfig files
//TODO config file for all sensors structures and tasks
//TODO: create database - send sensor data to db, and ram
//TODO: db health check for recovery attempts if needed
//TODO: database erro alert -email/led light etc
//TODO: update landing page to retrieve data from db or ram if db down
//TODO: ota firmwar update
//TODO dynamicly add link to all available node landing pages based on connected nodes
//TODO adjust nvs module info storage and module implemntation based on config
//TODO: remove node list from nvs (rely dynamicaly based on connected devices)
//TODO: heartbeat mechanism for esp-now connected nodes (along with active ping?)
//TODO: ACK mechanism for espnow data transmission
//TODO: watchdog timer for nodes transmitting data
//TODO: add device and system information to debug page to monitor device health
//TODO mdns setup to allow for garenteed access to node landing pages




bool REWRITE = false;

SemaphoreHandle_t wifiInitSemephore = NULL;
Module_info_t module_info = {
    .type = "Controller",
    .location = "Power Board",
    .identity = 0
};

/**
 * node identity numbers including self
*/
const int8_t node_arr[1] = {0};

const int8_t sensor_arr[7] = {3,  // temp
                        3,  // humidity
                        0,  // soil moisture
                        0,  // light
                        0,  // sound
                        0,  // movement
                        0,  // cam
                        };


/**
 * freeRTOS function invocation
*/
void app_main(void)
{
    static const char TAG[] = "main_app";

    wifiInitSemephore = xSemaphoreCreateMutex();

    //wifi crediental storage and retrieval
    nvs_initiate();

    //set node info and log
    if(REWRITE == true){
        nvs_set_module(module_info.type, module_info.location, module_info.identity);
        nvs_set_node_arr(&node_arr, 1);
        nvs_set_sensor_arr(&sensor_arr, 7);
    }
    ESP_LOGI(TAG,"{==nvs info==}\n%s\n", node_info_get_module_info_json());



    // Start Wifi
    wifi_start();

    // backup sd database
    spi_sd_card_init();
    //sd_db_init();

    // start DHT22 Sensor task

    vTaskDelay(5000/ portMAX_DELAY);

    DHT22_sensor_task_start();



}