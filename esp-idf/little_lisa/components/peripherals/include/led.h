/**
 * rgb_led.h
 *
 * Created on: 2024-01-08
 * Author: Catlin Roman
 */

#ifndef PERIPHERALS_RGB_LED_H_
#define PERIPHERALS_RGB_LED_H_

// NODE LED GPIO
#define LED_YELLOW_GPIO 13
#define LED_GREEN_GPIO 14
#define LED_BLUE_GPIO 27
// CNTRL
#define LED_STATUS_SER 13
#define LED_STATUS_RCLK 14
#define LED_STATUS_SRCLK 27
#define LED_YELLOW_MASK 0x01
#define LED_GREEN_MASK 0x02
#define LED_BLUE_MASK 0x04
#define LED_RED_MASK 0x08

// pin set
#define ON 1
#define OFF 0

/**
 * Color to indicate http server app started
 */
void led_http_server_started(void);

/**
 * Color to indicate that ESP32 is connected to an access point
 * */
void led_sensor_transmission(void);

void led_wifi_connected_as_sta(void);
void led_wifi_disconnected_as_sta(void);
/**
 * initialize led
 */
void node_yellow_led_init();

/**
 * initialize led
 */
void node_blue_led_init();

/**
 * initialize led
 */
void node_green_led_init();

void cntrl_led_init();
void node_led_init();
void led_db_transmission(void);

#endif