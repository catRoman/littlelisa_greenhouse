/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */

#include "nvs_flash.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "wifi_ap_sta.h"
#include "nvs_service.h"
#include "module_config.h"

//---OTA TODOs-----
// TODO: ota firmwar update

//---ESP_NOW TODO----
// TODO: esp-now feature
// TODO: heartbeat mechanism for esp-now connected nodes (along with active ping?)
// TODO: ACK mechanism for espnow data transmission
// TODO: watchdog timer for nodes transmitting data

//---DATABASE TODO----
// TODO: create database - send sensor data to db, and ram --> 02/22
// TODO: db health check for recovery attempts if needed
// TODO: database erro alert -email/led light etc
// TODO: update landing page to retrieve data from db or ram if db down

//--OTHER TODO----
// TODO: add device and system information to debug page to monitor device health
// TODO dynamicly add link to all available node landing pages based on connected nodes
// TODO check for time sync between nodes and controller on boot and periodically, updating as neccary ?

/*  Device Information:
        Model: The specific model of the ESP device (e.g., ESP8266, ESP32).
        Chip ID: Unique identifier of the chip.
        Flash Chip Size: The size of the flash memory.
        Sketch Size: Size of the current application (sketch) including the space it occupies in flash memory.
        Free Sketch Space: Available space for future sketches.

    Firmware Information:
        Firmware Version: The current version of the firmware running on the device.
        SDK Version: The SDK version used for building the firmware.

    Network Information:
        IP Address: The device's current IP address on the network.
        Subnet Mask: Subnet mask of the network connection.
        Gateway: The network gateway address.
        MAC Address: The device's MAC address.
        SSID: The SSID of the WiFi network the device is connected to.
        Signal Strength (RSSI): WiFi signal strength indicator, useful for positioning the device in areas with strong signal strength.

    Runtime Information:
        Uptime: How long the device has been running since the last reset.
        CPU Frequency: The operating frequency of the CPU.
        Temperature (if supported): The internal temperature of the chip (some ESP32 models support this).

    Memory Information:
        Free Heap Memory: Available dynamic memory which can be useful to check for memory leaks or for determining if the application is close to running out of memory.
        Maximum Allocatable Block Size: Gives an idea about the largest block of memory that can be allocated at once.
        Heap Fragmentation: Indicates the state of the heap memory fragmentation.

    Task & Process Information (mostly for ESP32):
        Task List: A list of running tasks and their state.
        Core Usage: CPU usage per core, if applicable.

    Connectivity Status:
        Wi-Fi Status: Current status of the Wi-Fi connection (connected, attempting to connect, disconnected).
        Connected Devices: Number and possibly the list of devices connected to the ESP if it's acting as an access point.

    I/O Status:
        GPIO Status: Current status (high/low) of General Purpose Input/Output (GPIO) pins.
        ADC Values: Analog-to-Digital Converter values for reading sensors or analog inputs.

    Errors & Logs:
        Recent Errors: Any recent errors that have occurred.
        System Logs: A log buffer showing recent system activities or debug messages.

    Power Information:
        Battery Level: If the device is battery-powered, showing the current battery level or voltage.
        Power Source: The current source of power (USB, battery, external).
*/

//==============================
//  GLOBAL MUTEXS AND SEMAPHORES
//==============================
SemaphoreHandle_t send_id_mutex;

/**
 * freeRTOS function invocation
 */
void app_main(void)
{
    static char TAG[] = "main_app";

    send_id_mutex = xSemaphoreCreateMutex();
    if (send_id_mutex == NULL)
    {
        // Handle error: Failed to create the mutex
        ESP_LOGE(TAG, "-------------------Failed to create send_id mutex!----------------");
        return;
    }
    initiate_config();
    // enviroment controls?
}