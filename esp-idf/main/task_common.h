/**
 * @file		task_common.h
 * @brief		used for accessability freeartos common task
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 *
 * Detailed desciption (optional)
 */

#ifndef MAIN_TASKS_COMMON_H_
#define MAIN_TASKS_COMMON_H_

// WiFi application task
#define WIFI_APP_TASK_STACK_SIZE        4096    // stack size of task
#define WIFI_APP_TASK_PRIORITY          5       // 0 is lowest priority in freeRTOS
#define WIFI_APP_TASK_CORE_ID           0

// HTTP Server task
#define HTTP_SERVER_TASK_STACK_SIZE     8192
#define HTTP_SERVER_TASK_PRIORITY       6
#define HTTP_SERVER_TASK_CORE_ID        0

// HTTP Server Monitor task
#define HTTP_SERVER_MONITOR_STACK_SIZE  4096
#define HTTP_SERVER_MONITOR_PRIORITY    3
#define HTTP_SERVER_MONITOR_CORE_ID     0

// DHT22 Sesor Task
#define DHT22_TASK_STACK_SIZE           4096
#define DHT22_TASK_PRIORITY             5
#define DHT22_TASK_CORE_ID              1

// sensor Monitor task
#define SENSOR_QUEUE_STACK_SIZE         4096
#define SENSOR_QUEUE_PRIORITY           5
#define SENSOR_QUEUE_CORE_ID            1

// esp now event Monitor task
#define ESP_NOW_COMM_MONITOR_STACK_SIZE  4096
#define ESP_NOW_COMM_MONITOR_PRIORITY    5
#define ESP_NOW_COMM_MONITOR_CORE_ID     1

// esp now outgoing data task
#define ESP_NOW_COMM_OUTGOING_STACK_SIZE  8192
#define ESP_NOW_COMM_OUTGOING_PRIORITY    5
#define ESP_NOW_COMM_OUTGOING_CORE_ID     1

// esp now incoming data task
#define ESP_NOW_COMM_INCOMING_STACK_SIZE  8192
#define ESP_NOW_COMM_INCOMING_PRIORITY    5
#define ESP_NOW_COMM_INCOMING_CORE_ID     1

#endif /* MAIN_TASKS_COMMON_H_*/