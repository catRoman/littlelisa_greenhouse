#include <stdio.h>
#include <time.h>
#include <sys/time.h>
#include <stdbool.h>

#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <esp_sntp.h>
#include <esp_log.h>

#include "ds1302.h"

#include "rtc_DS1302.h"
#include "esp_sntp.h"

extern time_t now;
extern struct tm timeinfo;

static const char TAG [] = "rtc_DS1302";

ds1302_t rtc_device = {
    .ce_pin = RTC_DS1302_RST_GPIO,
    .io_pin = RTC_DS1302_DATA_GPIO,
    .sclk_pin = RTC_DS1302_SCLK_GPIO
};

void rtc_DS1302_task(void *vpParameters)
{
    //check if sntp is connected
    //if it is sync every hour
    //if it isnt synce system time with current time

    ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));

    while (1)
    {
        if(timeinfo.tm_year < (2024 - 1900) || timeinfo.tm_year > 2024  || sntp_get_sync_status() == SNTP_SYNC_STATUS_RESET ){

            ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &timeinfo));
            now = mktime(&timeinfo);
            ESP_LOGI(TAG, "system time set using rtc service to %s", ctime(&now));
            vTaskDelay(5000 / portTICK_PERIOD_MS);
        }
    }
}
void rtc_DS1302_init(void){

    ESP_ERROR_CHECK(ds1302_init(&rtc_device));
    ESP_ERROR_CHECK(ds1302_start(&rtc_device, true));
    xTaskCreate(rtc_DS1302_task, "rtc_ds1302", configMINIMAL_STACK_SIZE * 8, NULL, 5, NULL);

}
