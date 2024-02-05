#include <time.h>
#include <sys/time.h>
#include <stdbool.h>

#include "esp_log.h"
#include "esp_system.h"
#include "esp_netif_sntp.h"
#include "esp_sntp.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include "ds1302.h"

#include "sntp.h"
#include "rtc_DS1302.h"

static const char TAG [] = "sntp";
 esp_sntp_config_t config = {
        .smooth_sync = false,
        .server_from_dhcp = false,
        .wait_for_sync = false,
        .start = true,
        .num_of_servers = 1,
        .servers = {SNTP_SERVER},
    };

time_t now;
struct tm timeinfo;
extern ds1302_t rtc_device;
// Set timezone for victoria Standard Time


void sntp_service_init(void){

    ESP_LOGI(TAG, "initializing sntp server");

    esp_err_t err;

    if((err = esp_netif_sntp_init(&config)) == ESP_OK){
        ESP_LOGI(TAG, "sntp initialized successfully");

    }
    else{
        ESP_LOGW(TAG, "sntp not initalized succesfully-> %s", esp_err_to_name(err));

    }

    if(esp_sntp_enabled() == true){
        ESP_LOGI(TAG, "SNTP enabled");
    }
    else{
        ESP_LOGW(TAG, "SNTP not enabled");
    }




    //time check task here=====
    sntp_server_connection_check();



}

void sntp_sync(void){
    esp_err_t err[3];

    struct tm *time2;
    time_t rtc_time;

    extern SemaphoreHandle_t wifiInitSemephore;
    xSemaphoreTake(wifiInitSemephore, portMAX_DELAY);

      if((err[0] = esp_netif_sntp_start()) == ESP_OK){
            ESP_LOGI(TAG, "SNTP started");

                if(sntp_get_sync_status() == SNTP_SYNC_STATUS_COMPLETED){
                    ESP_LOGI(TAG, "sntp sync complete");
                    ESP_LOGI(TAG, "sync interval set to  %lu", sntp_get_sync_interval());
                    ESP_LOGI(TAG, "current sntp server set to: %s at %s", esp_sntp_getservername(0), ipaddr_ntoa(esp_sntp_getserver(0)));
                    //sync with rtc
                    time(&rtc_time);
                    time2 = localtime(&rtc_time);
                    ESP_LOGI(TAG, "time in %s", ctime(&rtc_time));
                    ESP_ERROR_CHECK(ds1302_init(&rtc_device));
                    ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));
                    ESP_ERROR_CHECK(ds1302_start(&rtc_device, true));
                    ESP_ERROR_CHECK(ds1302_set_time(&rtc_device, time2));
                    ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, time2));
                    rtc_time = mktime(time2);
                    ESP_LOGI(TAG, "{==RTC_DS1302==} set to time retrieved from sntp service: %s", ctime(&rtc_time));

                }
                else if(sntp_get_sync_status() == SNTP_SYNC_STATUS_RESET){
                    ESP_LOGW(TAG, "not synced");
                    if ((err[1] = esp_netif_sntp_sync_wait(pdMS_TO_TICKS(10000))) != ESP_OK) {
                        ESP_LOGW(TAG, "Failed to update system time within 10s timeout");
                        ESP_LOGW(TAG, "%s", esp_err_to_name(err[1]));
                    }
                }
        }
        else{
            ESP_LOGW(TAG, "sntp not started succesfully-> %s", esp_err_to_name(err[0]));
        }

    xSemaphoreGive(wifiInitSemephore);
}
/**
 * test for sntp
*/
void sntp_test(void){

    time_t before;
    char strfbeforetime_buf[64];
    struct tm beforetimeinfo;

    time(&before);

    localtime_r(&before, &beforetimeinfo);
    strftime(strfbeforetime_buf, sizeof(strfbeforetime_buf), "%c", &beforetimeinfo);
    ESP_LOGI(TAG, "The current date/time before sntp is: %s", strfbeforetime_buf);


    sntp_sync();

   if(esp_sntp_enabled() == true){
        char strftime_buf[64];

        setenv("TZ", "America/Vancouver", 1);
        tzset();
        time(&now);

        localtime_r(&now, &timeinfo);
        strftime(strftime_buf, sizeof(strftime_buf), "%c", &timeinfo);
        ESP_LOGI(TAG, "The current date/time after sntp is: %s", strftime_buf);
   }


}

void sntp_system_test_task(void *vpParameter){

    for(;;){
        int status_code = sntp_get_sync_status();

        switch(status_code){
            case SNTP_SYNC_STATUS_COMPLETED:
                ESP_LOGI(TAG, "status: complete");
                break;

            case SNTP_SYNC_STATUS_IN_PROGRESS:
                ESP_LOGW(TAG, "status: in progress");
                break;

            case SNTP_SYNC_STATUS_RESET:
                ESP_LOGW(TAG, "status: not completed");
                break;

            default:
                ESP_LOGE(TAG, "status: unknown status code-> %d", status_code);
                break;
        }

        if(esp_sntp_enabled() == true){
            char strftime_buf[64];


            time(&now);

            localtime_r(&now, &timeinfo);
            strftime(strftime_buf, sizeof(strftime_buf), "%c", &timeinfo);
           // ESP_LOGI(TAG, "sntp enabled: The current date/time after sntp is: %s", strftime_buf);

        }
        vTaskDelay(5000 / portTICK_PERIOD_MS);

    }
}

void sntp_rtc_system_test(){
    ESP_LOGI(TAG, "Starting system time debug task");
    xTaskCreatePinnedToCore(sntp_system_test_task, "sntp_system_test", 4096, NULL, 5,NULL, 1);
}

void sntp_server_connection_check_task(void *vpParameter){

    bool RTC_IS_ON = false;
    for(;;){
        ESP_ERROR_CHECK(ds1302_is_running(&rtc_device, &RTC_IS_ON));

        while (timeinfo.tm_year < (2024 - 1900) || RTC_IS_ON) {
            ESP_LOGI(TAG, "Waiting for system time to be set... ");
            vTaskDelay(5000 / portTICK_PERIOD_MS);
            time(&now);
            localtime_r(&now, &timeinfo);

        }
        ESP_LOGI(TAG, "system time synced with sntp server");
        ESP_LOGI(TAG, "System time set to pacific (-8 from UTC)");

        // sntp_set_timezone(-8 * 3600);
        setenv("TZ", "UTC+8", 1);
        tzset();
        ESP_LOGI(TAG, "The current date/time after sync is: %s", ctime(&now));
        sntp_sync();
        vTaskDelete(NULL);
    }
}


void sntp_server_connection_check(){
    ESP_LOGI(TAG, "starting time check");
    xTaskCreatePinnedToCore(sntp_server_connection_check_task, "sntp_connection_check", 2048, NULL, 5,NULL, 1);
}
