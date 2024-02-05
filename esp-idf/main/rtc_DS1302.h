/**
 * rtc.h
 *
 * Created on: 2024-02-04
 * Author: Catlin Roman
*/

#ifndef MAIN_RTC_DS1302_H_
#define MAIN_RTC_DS1302_H_

#define RTC_DS1302_RST_GPIO     32
#define RTC_DS1302_DATA_GPIO    33
#define RTC_DS1302_SCLK_GPIO    4

void rtc_DS1302_task(void *vpParameters);

void rtc_DS1302_init(void);


#endif