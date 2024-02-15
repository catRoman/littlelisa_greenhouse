/**
 * sntp_rtc.h
 *
 * Created on: 2024-02-02
 * Author: Catlin Roman
*/

#ifndef MAIN_SNTP_H_
#define MAIN_SNTP_H_

#define SNTP_SERVER "pool.ntp.org"

void sntp_test(void);

void sntp_service_init(void);

void sntp_sync(void);

void sntp_system_test(void);
void sntp_system_test_task(void *vpParameter);

void sntp_server_connection_check(void);
void sntp_server_connection_check_task(void *vpParameter);
#endif