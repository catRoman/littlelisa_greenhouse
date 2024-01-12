/**
 * rgb_led.h
 * 
 * Created on: 2024-01-08
 * Author: Catlin Roman
*/

#ifndef MAIN_RGB_LED_H_
#define MAIN_RGB_LED_H_

// RGB LED GPIO
#define RGB_LED_RED_GPIO        34
#define RGB_LED_GREEN_GPIO      35
#define RGB_LED_BLUE_GPIO       32

// RGB LED status colors ---> (red, green, blue)
#define RGB_LED_WIFI_STARTED_COLOR            255, 255, 0 // Yellow
#define RGB_LED_HTTP_SERVER_STARTED_COLOR     128, 0, 128  // Deep Purple 
#define RGB_LED_WIFI_CONNECTED_COLOR          0, 255, 0     // Green

// RGB LED color mix channels
#define RGB_LED_CHANNEL_NUM     3

// RGB LED configuration
typedef struct
{
    int channel;
    int gpio;
    int mode;
    int timer_index;
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