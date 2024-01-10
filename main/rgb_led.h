/**
 * rgb_led.h
 * 
 * Created on: 2024-01-08
 * Author: Catlin Roman
*/

#ifndef MAIN_RGB_LED_H_
#define MAIN_RGB_LED_H_

// RGB LED GPIO
#define RGB_LED_RED_GPIO        21
#define RGB_LED_GREEN_GPIO      20
#define RGB_LED_BLUE_GPIO       19

// RGB LED color mix channels
#define RGB_LED_CHANNEL_NUM     3

// RGB LED configuration
typedef struct
{
    int channel;
    int gpio;
    int mode;
    int timeer_index;
} ledc_info_t;


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



#endif