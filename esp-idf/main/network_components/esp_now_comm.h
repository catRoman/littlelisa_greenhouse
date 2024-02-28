/**
 * @file		esp_now_comm.h
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-02-26
 *
 */

#ifndef MAIN_ESP_NOW_COMM_H_
#define MAIN_ESP_NOW_COMM_H_

#include <inttypes.h>
#include <stdbool.h>

#include "freertos/FreeRTOS.h"
#include "esp_system.h"
#include "sensor_components/sensor_tasks.h"
#include "esp_now.h"


#define ESP_NOW_COMM_PMK                    "pmk1234567890123"
#define ESP_NOW_COMM_CHANNEL                1
#define ESP_NOW_COMM_DEFAULT_RECIEVER_MAC   {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}


typedef struct {
    uint8_t mac_addr;
    void* data;
    size_t len;
} queue_packet_t;


esp_err_t esp_now_comm_start(void);
esp_err_t esp_now_comm_get_config_reciever_mac_addr(uint8_t* mac_bytes);

void esp_now_comm_on_data_recv_cb(const esp_now_recv_info_t *recv_info, const uint8_t *data, int len);

void esp_now_comm_on_data_send_cb(const uint8_t *mac_addr, esp_now_send_status_t status);

uint8_t* serialize_sensor_data(const sensor_data_t *data, size_t *size);

sensor_data_t* deserialize_sensor_data(const uint8_t *buffer, size_t size);

size_t calculate_serialized_size(const sensor_data_t *data);

void print_sensor_data(const sensor_data_t* data);

void esp_now_comm_incoming_data_task(void * pvParameters);

void esp_now_comm_outgoing_data_task(void * pvParameters);
#endif 
