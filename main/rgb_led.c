/**
 * rgb_led.c
 * 
 * created on: 2024-01-08
 * author: Catlin Roman
*/

#include <stdbool.h>

#include "driver/gpio.h" 
#include "rgb_led.h"


void blue_led_init(){
    gpio_pad_select_gpio(LED_BLUE_GPIO);
    gpio_set_direction(LED_BLUE_GPIO, GPIO_MODE_OUTPUT);
}

void green_led_init(){
    gpio_pad_select_gpio(LED_GREEN_GPIO);
    gpio_set_direction(LED_GREEN_GPIO, GPIO_MODE_OUTPUT);

}

void yellow_led_init(){
    gpio_pad_select_gpio(LED_YELLOW_GPIO);
    gpio_set_direction(LED_YELLOW_GPIO, GPIO_MODE_OUTPUT);
}


void led_wifi_app_started(void)
{
    yellow_led_init();
    gpio_set_level(LED_YELLOW_GPIO, ON);
}

void led_http_server_started(void)
{
    green_led_init();
    gpio_set_level(LED_GREEN_GPIO, ON);
    
}

void led_wifi_connected(void)
{
    blue_led_init();
    gpio_set_level(LED_BLUE_GPIO, ON);
}