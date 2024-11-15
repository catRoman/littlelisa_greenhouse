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
#include "sdkconfig.h"

// my components
#include "ds1302.h"
#include "sntp.h"
#include "rtc_DS1302.h"
#include "task_common.h"
#include "module_config.h"

static const char TAG[] = "sntp";
extern Module_info_t *module_info_gt;

//  esp_sntp_config_t config = {
//         .smooth_sync = false,
//         .server_from_dhcp = false,
//         .wait_for_sync = false,
//         .start = true,
//         .num_of_servers = 1,
//         .servers = {SNTP_SERVER},
//     };

struct tm timeinfo;
extern ds1302_t rtc_device;
// Set timezone for victoria Standard Time

void sntp_service_init(void)
{

    esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG(SNTP_SERVER);
    config.sync_cb = update_sntp_cb;
    // rtc setup <== move to own function on refactor
    struct tm time_on_rtc = {0};

    setenv("TZ", "UTC+8", 1);
    tzset();

    bool RTC_IS_ON = true;

    ESP_ERROR_CHECK(ds1302_init(&rtc_device));
    ESP_ERROR_CHECK(ds1302_start(&rtc_device, RTC_IS_ON));

    ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));
    printf("time from rtc: %s", asctime(&time_on_rtc));

    time_t rtc_time_sec = mktime(&time_on_rtc);
    const struct timeval rtc_now = {.tv_sec = rtc_time_sec, .tv_usec = 0};

    if (settimeofday(&rtc_now, NULL) != 0)
    {
        ESP_LOGE(TAG, "Failed to set system time from rtc");
    }
    else
    {
        ESP_LOGI(TAG, "The current date/time on rtc before sync is: %s", ctime(&rtc_time_sec));
    }

    ESP_LOGI(TAG, "initializing sntp server");

    esp_err_t err;

    if ((err = esp_netif_sntp_init(&config)) == ESP_OK)
    {
        ESP_LOGI(TAG, "sntp initialized successfully");
    }
    else
    {
        ESP_LOGW(TAG, "sntp not initalized succesfully-> %s", esp_err_to_name(err));
    }

    if (esp_sntp_enabled() == true)
    {
        ESP_LOGI(TAG, "SNTP enabled");
    }
    else
    {
        ESP_LOGW(TAG, "SNTP not enabled");
    }

    // time check task here=====
    // sntp_server_connection_check();
}
void update_sntp_cb(struct timeval *tv)
{
    struct tm time_on_rtc = {0};
    time_t current_time = tv->tv_sec;

    ESP_LOGI(TAG, "sntp sync complete");
    ESP_LOGI(TAG, "sync interval set to  %lu", sntp_get_sync_interval());
    ESP_LOGI(TAG, "current sntp server set to: %s at %s", esp_sntp_getservername(0), ipaddr_ntoa(esp_sntp_getserver(0)));
    // sync with rtc

    ESP_LOGI(TAG, "current time set to:  %s", ctime(&current_time));

    ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));
    ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));

    // ESP_LOGI(TAG, "{==RTC_DS1302==} previous time retrieved from rtc: %s", asctime(&time_on_rtc));
    ESP_ERROR_CHECK(ds1302_set_time(&rtc_device, localtime(&current_time)));

    ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));
    ESP_LOGI(TAG, "{==RTC_DS1302==} set to time retrieved from sntp service: %s", asctime(&time_on_rtc));
    ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));
    ESP_ERROR_CHECK(ds1302_start(&rtc_device, true));

    // TODO: set syncing task
}
// void sntp_server_connection_check_task(void *vpParameter){

//     struct tm time_on_rtc = {0};

//     setenv("TZ", "UTC+8", 1);
//     tzset();

//     if(strcmp(module_info_gt->type, "controller") == 0){
//         bool RTC_IS_ON = true;

//         ESP_ERROR_CHECK(ds1302_init(&rtc_device));
//         ESP_ERROR_CHECK(ds1302_start(&rtc_device, RTC_IS_ON));

//         ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));
//         printf("time from rtc: %s", asctime(&time_on_rtc));

//         time_t rtc_time_sec = mktime(&time_on_rtc);
//         const struct timeval rtc_now = {.tv_sec = rtc_time_sec, .tv_usec = 0};

//         if(settimeofday(&rtc_now, NULL) != 0){
//             ESP_LOGE(TAG, "Failed to set system time from rtc");
//         }else{
//             ESP_LOGI(TAG, "The current date/time on rtc before sync is: %s", ctime(&rtc_time_sec));
//         }
//     }
//     bool initial_sync = true;

//     sntp_set_sync_interval(3600000); //one hour sync
//     for(;;){

//         time_t current_time = time(NULL);

//         if(sntp_get_sync_status() == SNTP_SYNC_STATUS_COMPLETED){
//             ESP_LOGI(TAG, "sntp sync complete");
//             ESP_LOGI(TAG, "sync interval set to  %lu", sntp_get_sync_interval());
//             ESP_LOGI(TAG, "current sntp server set to: %s at %s", esp_sntp_getservername(0), ipaddr_ntoa(esp_sntp_getserver(0)));
//             //sync with rtc
//             if(strcmp(module_info_gt->type, "controller") == 0){

//                 ESP_LOGI(TAG, "current time set to:  %s", ctime(&current_time));

//                 ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));
//                 ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));

//                 // ESP_LOGI(TAG, "{==RTC_DS1302==} previous time retrieved from rtc: %s", asctime(&time_on_rtc));
//                 ESP_ERROR_CHECK(ds1302_set_time(&rtc_device, localtime(&current_time)));

//                 ESP_ERROR_CHECK(ds1302_get_time(&rtc_device, &time_on_rtc));
//                 ESP_LOGI(TAG, "{==RTC_DS1302==} set to time retrieved from sntp service: %s", asctime(&time_on_rtc));
//                 ESP_ERROR_CHECK(ds1302_set_write_protect(&rtc_device, false));
//                 ESP_ERROR_CHECK(ds1302_start(&rtc_device, true));
//             }
//             initial_sync = false;

//         }else if (initial_sync == true){

//             ESP_LOGI(TAG, "Waiting for system time to be set for intial sync... ");
//             vTaskDelay(5000 / portTICK_PERIOD_MS);
//         }

//         if(initial_sync == false){

//             vTaskDelay(pdMS_TO_TICKS(360000));
//         }

//         // TODO: set syncing task

//     }
// }

// void sntp_server_connection_check(){
//     ESP_LOGI(TAG, "starting time check");
//     BaseType_t task_status;
//     task_status = xTaskCreatePinnedToCore(sntp_server_connection_check_task, "sntp_connection_check", SNTP_TASK_STACK_SIZE, NULL, SNTP_TASK_PRIORITY,NULL, SNTP_TASK_CORE_ID);
//     if(task_status != pdPASS){
//         ESP_LOGE(TAG, "Error making sntp check task");
//     }
// }
