/**
 * rgb_led.c
 *
 * created on: 2024-01-08
 * author: Catlin Roman
 */
// TODO: shut off light if service shutdown
#include <stdbool.h>

#include "driver/gpio.h"
#include "led.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void blue_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_BLUE_GPIO);
    gpio_set_pull_mode(LED_BLUE_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_BLUE_GPIO, GPIO_MODE_OUTPUT);
}

void green_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_GREEN_GPIO);
    gpio_set_pull_mode(LED_GREEN_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_GREEN_GPIO, GPIO_MODE_OUTPUT);
}

void yellow_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_YELLOW_GPIO);
    gpio_set_pull_mode(LED_YELLOW_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_YELLOW_GPIO, GPIO_MODE_OUTPUT);
}

void led_wifi_connected_as_sta(void)
{
    yellow_led_init();
    gpio_set_level(LED_YELLOW_GPIO, ON);
}
void led_wifi_disconnected_as_sta(void)
{
    yellow_led_init();
    gpio_set_level(LED_YELLOW_GPIO, OFF);
}

void led_http_server_started(void)
{
    green_led_init();
    gpio_set_level(LED_GREEN_GPIO, ON);
}

void led_sensor_transmission(void)
{
    blue_led_init();
    gpio_set_level(LED_BLUE_GPIO, ON);
    vTaskDelay(100 / portTICK_PERIOD_MS);
    gpio_set_level(LED_BLUE_GPIO, OFF);
}