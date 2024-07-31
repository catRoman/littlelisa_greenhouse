/**
 * rgb_led.c
 *
 * created on: 2024-01-08
 * author: Catlin Roman
 */
// TODO: shut off light if service shutdown
#include <stdbool.h>
#include <string.h>

#include "driver/gpio.h"
#include "led.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#define MODULE_TYPE_NODE 0
#define MODULE_TYPE_CNTRL 1

static void shiftOut595N(uint8_t data, int8_t ser_pin, int8_t srclk_pin, int8_t rclk_pin);

static char *TAG = "status_leds";
static uint8_t led_status_bitmask = 0x0;
static int8_t module_type = -1;

void node_blue_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_BLUE_GPIO);
    gpio_set_pull_mode(LED_BLUE_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_BLUE_GPIO, GPIO_MODE_OUTPUT);
}

void node_green_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_GREEN_GPIO);
    gpio_set_pull_mode(LED_GREEN_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_GREEN_GPIO, GPIO_MODE_OUTPUT);
}

void node_yellow_led_init()
{
    esp_rom_gpio_pad_select_gpio(LED_YELLOW_GPIO);
    gpio_set_pull_mode(LED_YELLOW_GPIO, GPIO_PULLDOWN_ONLY);
    gpio_set_direction(LED_YELLOW_GPIO, GPIO_MODE_OUTPUT);
}

void led_wifi_connected_as_sta(void)
{
    if (module_type == MODULE_TYPE_NODE)
    {

        gpio_set_level(LED_YELLOW_GPIO, ON);
    }
    else if (module_type == MODULE_TYPE_CNTRL)
    {
        led_status_bitmask |= LED_YELLOW_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
    }
    else
    {
        ESP_LOGE(TAG, "led status -connect as sta - error module type not set");
    }
}
void led_wifi_disconnected_as_sta(void)
{
    if (module_type == 0)
    {
        gpio_set_level(LED_YELLOW_GPIO, OFF);
    }
    else if (module_type == MODULE_TYPE_CNTRL)
    {
        led_status_bitmask &= ~LED_YELLOW_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
    }
    else
    {
        ESP_LOGE(TAG, "led status -wifi disconnect - error module type not set");
    }
}

void led_http_server_started(void)
{
    if (module_type == MODULE_TYPE_NODE)
    {
        gpio_set_level(LED_GREEN_GPIO, ON);
    }
    else if (module_type == MODULE_TYPE_CNTRL)
    {
        led_status_bitmask |= LED_GREEN_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
    }
    else
    {
        ESP_LOGE(TAG, "led status -http server started-error module type not set");
    }
}

void led_sensor_transmission(void)
{
    if (module_type == MODULE_TYPE_NODE)
    {

        gpio_set_level(LED_BLUE_GPIO, ON);
        vTaskDelay(100 / portTICK_PERIOD_MS);
        gpio_set_level(LED_BLUE_GPIO, OFF);
    }
    else if (module_type == MODULE_TYPE_CNTRL)
    {
        led_status_bitmask |= LED_BLUE_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
        vTaskDelay(100 / portTICK_PERIOD_MS);
        led_status_bitmask &= ~LED_BLUE_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
    }
    else
    {
        ESP_LOGE(TAG, "led status -sensor transmission- error module type not set");
    }
}
void led_db_transmission(void)
{

    if (module_type == MODULE_TYPE_CNTRL)
    {
        led_status_bitmask |= LED_RED_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
        vTaskDelay(100 / portTICK_PERIOD_MS);
        led_status_bitmask &= ~LED_RED_MASK;
        shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);
    }
    else
    {
        ESP_LOGE(TAG, "led status -db transmission- error module type not set");
    }
}
void node_led_init()
{
    module_type = MODULE_TYPE_NODE;
    ESP_LOGI(TAG, "node led init started");
    node_yellow_led_init();
    node_green_led_init();
    node_blue_led_init();
}
void cntrl_led_init()
{
    module_type = MODULE_TYPE_CNTRL;
    ESP_LOGI(TAG, "cntrl led init started");
    esp_log_level_set(TAG, ESP_LOG_INFO);

    ESP_LOGI(TAG, "initializing led pins for led status lights");

    gpio_config_t io_conf;

    io_conf.intr_type = GPIO_INTR_DISABLE;
    io_conf.mode = GPIO_MODE_OUTPUT;
    // io_conf[i].pin_bit_mask = (1ULL << (gpio_num_t)(env_state_arr_gt[i].pin));
    io_conf.pin_bit_mask = ((1ULL << (gpio_num_t)(LED_STATUS_SER)) |
                            (1ULL << (gpio_num_t)(LED_STATUS_SRCLK)) |
                            (1ULL << (gpio_num_t)(LED_STATUS_RCLK)));
    io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    io_conf.pull_up_en = GPIO_PULLUP_DISABLE;
    gpio_config(&io_conf);

    // gpio_set_level(env_state_arr_gt[i].pin, env_state_arr_gt[i].state);
    gpio_set_level(LED_STATUS_SER, 0);
    gpio_set_level(LED_STATUS_SRCLK, 0);
    gpio_set_level(LED_STATUS_RCLK, 0);

    shiftOut595N(led_status_bitmask, LED_STATUS_SER, LED_STATUS_SRCLK, LED_STATUS_RCLK);

    ESP_LOGI(TAG, "All leds initial state-off");
}

static void shiftOut595N(uint8_t data, int8_t ser_pin, int8_t srclk_pin, int8_t rclk_pin)
{
    for (int i = 0; i < 8; i++)
    {
        // Set data pin to the value of the most significant bit
        uint8_t bit_val = (data & (1 << (7 - i))) >> (7 - i);
        // ESP_LOGI("shiftOut", "Bit %d: %d", i, bit_val);
        gpio_set_level(ser_pin, bit_val);
        // Pulse the clock pin
        gpio_set_level(srclk_pin, 1);
        vTaskDelay(1); // Short delay
        gpio_set_level(srclk_pin, 0);
    }
    // Update the latches to reflect the new data
    gpio_set_level(rclk_pin, 1);
    vTaskDelay(1); // Short delay
    gpio_set_level(rclk_pin, 0);
    gpio_set_level(ser_pin, 0);
}
