/**
 * @file		esp_now_comm.h
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-02-26
 *
 */

#ifndef MAIN_ESP_NOW_COMM_H_
#define MAIN_ESP_NOW_COMM_H_

#include "freertos/FreeRTOS.h"
#include "esp_system.h"

typedef enum esp_now_event_type
{
    ESP_NOW_INIT,
    ESP_NOW_COMMUNICATION_SENT,
    ESP_NOW_COMMUNICATION_RECIEVED,              
    ESP_NOW_CONTRO_PEER_ADDED,
    ESP_NOW_PEER_DELETED
                    
} esp_now_event_type;


typedef struct esp_now_queue_event
{
    esp_now_event_type eventID;
} esp_now_queue_event_t;


esp_err_t esp_now_start(void);


#endif 
