#include <stdio.h>
#include <stdbool.h>

#include "freertos/FreeRTOS.h"
#include "esp_wifi.h"
#include "esp_system.h"
#include "esp_event.h"
#include "esp_event_loop.h"
#include "nvs_flash.h"
#include "driver/gpio.h"

#include "rgb_led.h"


void app_main(void)
{
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
}
