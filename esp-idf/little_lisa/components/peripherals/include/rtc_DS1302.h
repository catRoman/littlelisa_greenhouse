/**
 * rtc_DS1302.h
 *
 * driver for the hw-203 module using the ds1302
 *
 * Created on: 2024-02-04
 * Author: Catlin Roman
 */

#ifndef PERIPHERALS_RTC_DS1302_H_
#define PERIPHERALS_RTC_DS1302_H_

#include <stdbool.h>
#include "esp_err.h"

/**
 * set of compatable pins
 */
#define RTC_DS1302_RST_GPIO 4
#define RTC_DS1302_DATA_GPIO 21
#define RTC_DS1302_SCLK_GPIO 22

/**
 * GPIO pin struct needed for initialization
 */
typedef struct
{
    int rst_pin;
    int data_pin;
    int sclk_pin;
} rtc_ds1302_t;

/**
 * pin states
 */
typedef enum
{
    LOW,
    HIGH,
    TRI_STATE
} PinState;

/**
 * state of oscilator
 */
typedef enum
{
    SLEEPING,
    RUNNING
} OscillatorStatus;

extern OscillatorStatus status;

/**
 * used for defining which type of data I/O
 * method to use
 */
typedef enum
{
    BURST,
    SINGLE
} DataMode;

/**
 * sets the systems current time and date to the that being kept
 * by the ds1302 internal values
 *
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t sync_system_time_with_rtc(void);

/**
 * sets the ds1302 internal clock to the systems current
 * time and date
 *
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *               ....other error handling descriptions
 */
esp_err_t sync_rtc_time_with_system_time(void);

/**
 * writes time and date to ds1302 clock registers for storage
 *
 * @param timeToPass reference to pre populated calender time type used to
 *                   set time/date registers
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t set_rtc_time_stamp(struct tm *timeToPass);

/**
 * reads time and date from ds1302 clock registers
 *
 * @param timeToSet reference to initiated calender time type used to
 *                  store retreived ds1302 time/date
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t set_rtc_time_stamp(struct tm *timeToSet);

/**
 * used to set ds1302 clock halt flag, the oscillator must be running to
 * maintain real time clock data (clock halt is false), otherwise sleep will
 * occur resulting in minimum power consumption (clock halt is true)
 *
 * @param status select the intended mode either RUNNING or SLEEPING
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t set_oscillator_status(OscillatorStatus status);

/**
 * useful for debugging clock tick state
 *
 * @return status of oscillators state used for debugging
 */
OscillatorStatus get_oscillator_status();

/**
 * set write protect
 *
 * @param state true for on, false for off
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t set_write_protection(bool state);

/**
 * set ds1320
 *
 * @param state true for on, false for off
 * @return esp error repsponse for client handling and logging
 *              ESP_OK - time synced
 *              ....other error handling descriptions
 */
esp_err_t set_write_protection(bool state);

/**
 *
 *
 * check voltage --returns true when volate > 2.5 voltsa
 *
 * inputdata --- manipulates pins for data transfer
 *
 * outputdata --- manipulates pins for data transfer
 *
 *
 * setcommandbyte - lower level
 *
 * read_byte
 *
 * write_byte
 *
 * set
 *
 * binaryToBCD -- take a manipulated binary number and convert
 */

void rtc_DS1302_task(void *vpParameters);

void rtc_DS1302_init(void);

#endif