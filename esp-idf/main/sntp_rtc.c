#include <time.h>
#include <sys/time.h>
#include <stdbool.h>

#include "esp_log.h"
#include "esp_netif_sntp.h"
#include "esp_sntp.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"

#include "sntp_rtc.h"


static const char TAG [] = "sntp/rtc";


// Set timezone for victoria Standard Time


void start_sntp(void){

    extern SemaphoreHandle_t wifiInitSemephore;
    
    xSemaphoreTake(wifiInitSemephore, portMAX_DELAY);


    setenv("TZ", "America/Vancouver", 1);
    tzset();
    
    ESP_LOGI(TAG, "initializing sntp server");

    esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG(SNTP_SERVER);

    esp_netif_sntp_init(&config);


    if (esp_netif_sntp_sync_wait(pdMS_TO_TICKS(10000)) != ESP_OK) {
        ESP_LOGW(TAG, "Failed to update system time within 10s timeout");
    }

    if(esp_sntp_enabled() == true){
        ESP_LOGI(TAG, "SNTP initialized succesfully");
    }
    else{
        ESP_LOGW(TAG, "SNTP not enabled");
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
 
 
    start_sntp();
   
   if(esp_sntp_enabled() == true){
        time_t now;
        char strftime_buf[64];
        struct tm timeinfo;

        time(&now);

        localtime_r(&now, &timeinfo);
        strftime(strftime_buf, sizeof(strftime_buf), "%c", &timeinfo);
        ESP_LOGI(TAG, "The current date/time after sntp is: %s", strftime_buf);
   }


}
