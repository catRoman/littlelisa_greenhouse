/**
 * rgb_led.h
 * 
 * Created on: 2024-01-08
 * Author: Catlin Roman
*/

#ifndef MAIN_RGB_LED_H_
#define MAIN_RGB_LED_H_

// RGB LED GPIO
#define LED_YELLOW_GPIO         23
#define LED_GREEN_GPIO          22
#define LED_BLUE_GPIO           21

// pin set
#define ON          1
#define OFF         0

/**
 * Color to indicate wifi app started
*/
void rgb_led_wifi_app_started(void);

/**
 * Color to indicate http server app started
*/
void rgb_led_http_server_started(void);

/**
 * Color to indicate that ESP32 is connected to an access point
 * */
void rgb_led_wifi_connected(void);

/**
 * initialize led
*/
void yellow_led_init();

/**
 * initialize led
*/
void blue_led_init();

/**
 * initialize led
*/
void green_led_init();



#endif