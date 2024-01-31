/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */

#include "nvs_flash.h"

#include "wifi_app.h"
#include "DHT22.h"
#include "nvs_service.h"

void app_main(void)
{
    // Initialize NVS
    nvs_initiate();
    
    // Start Wifi
    wifi_app_start();
    

    // start DHT22 Sensor task
    DHT22_task_start();







/*---> old test code for rgb_led.c
    while (true)
    {
        printf("yellow\n");
        rgb_led_wifi_app_started();
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    
        printf("Purple\n");
        rgb_led_http_server_started();
        vTaskDelay(2000 / portTICK_PERIOD_MS);

        printf("Green\n");
        rgb_led_wifi_connected();
        vTaskDelay(4000 / portTICK_PERIOD_MS);

        printf("\n");
     }
*/
}
