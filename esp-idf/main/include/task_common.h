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

//NETWORK PROCESSES

// WiFi application task
#define SNTP_TASK_STACK_SIZE            8196
#define SNTP_TASK_PRIORITY              5       // 0 is lowest priority in freeRTOS
#define SNTP_TASK_CORE_ID               0

// WiFi application task
#define WIFI_APP_TASK_STACK_SIZE            4096
#define WIFI_APP_TASK_PRIORITY              5       // 0 is lowest priority in freeRTOS
#define WIFI_APP_TASK_CORE_ID               0

// HTTP Server task
#define HTTP_SERVER_TASK_STACK_SIZE         8192
#define HTTP_SERVER_TASK_PRIORITY           5
#define HTTP_SERVER_TASK_CORE_ID            0


// HTTP Server Monitor task
#define HTTP_SERVER_MONITOR_STACK_SIZE      4096
#define HTTP_SERVER_MONITOR_PRIORITY        6
#define HTTP_SERVER_MONITOR_CORE_ID         0


// WEBSOCKET Server task
#define WEBSOCKET_SERVER_TASK_STACK_SIZE         8192
#define WEBSOCKET_SERVER_TASK_PRIORITY           5
#define WEBSOCKET_SERVER_TASK_CORE_ID            0

// WEBSOCKET Server Monitor task
#define WEBSOCKET_SERVER_MONITOR_STACK_SIZE      4096
#define WEBSOCKET_SERVER_MONITOR_PRIORITY        6
#define WEBSOCKET_SERVER_MONITOR_CORE_ID         0

// WEBSOCKET send sensor data
#define WEBSOCKET_SEND_SENSOR_DATA_STACK_SIZE      8192
#define WEBSOCKET_SEND_SENSOR_DATA_PRIORITY        6
#define WEBSOCKET_SEND_SENSOR_DATA_CORE_ID         0

// WEBSOCKET send log data
#define WEBSOCKET_SEND_LOG_DATA_STACK_SIZE      8192
#define WEBSOCKET_SEND_LOG_DATA_PRIORITY        6
#define WEBSOCKET_SEND_LOG_DATA_CORE_ID         0


// esp now outgoing data task
#define ESP_NOW_COMM_OUTGOING_STACK_SIZE    8192
#define ESP_NOW_COMM_OUTGOING_PRIORITY      5
#define ESP_NOW_COMM_OUTGOING_CORE_ID       0

// esp now incoming data task
#define ESP_NOW_COMM_INCOMING_STACK_SIZE    8192
#define ESP_NOW_COMM_INCOMING_PRIORITY      5
#define ESP_NOW_COMM_INCOMING_CORE_ID       0

//SENSOR RELATED

//SENSOR QUEUE PROCESSES

// sensor Monitor task
#define SENSOR_QUEUE_STACK_SIZE             8196
#define SENSOR_QUEUE_PRIORITY               6
#define SENSOR_QUEUE_CORE_ID                1

#define SENSOR_PREPROCESSING_STACK_SIZE     4096
#define SENSOR_PREPROCESSING_PRIORITY       3
#define SENSOR_PREPROCESSING_CORE_ID        1


#define SENSOR_PREPARE_TO_SEND_STACK_SIZE   4096
#define SENSOR_PREPARE_TO_SEND_PRIORITY     3
#define SENSOR_PREPARE_TO_SEND_CORE_ID      1


#define SENSOR_POSTPROCESSING_STACK_SIZE    4096
#define SENSOR_POSTPROCESSING_PRIORITY      3
#define SENSOR_POSTPROCESSING_CORE_ID       1


#define SENSOR_SEND_TO_RAM_STACK_SIZE       4096
#define SENSOR_SEND_TO_RAM_PRIORITY         5
#define SENSOR_SEND_TO_RAM_CORE_ID          1


#define SENSOR_SEND_TO_SD_DB_STACK_SIZE     4096
#define SENSOR_SEND_TO_SD_DB_PRIORITY       5
#define SENSOR_SEND_TO_SD_DB_CORE_ID        1


#define SENSOR_SEND_TO_SERVER_DB_STACK_SIZE 4096
#define SENSOR_SEND_TO_SERVER_DB_PRIORITY   5
#define SENSOR_SEND_TO_SERVER_DB_CORE_ID    1


#define SENSOR_QUEUE_MEM_CLEANUP_STACK_SIZE 4096
#define SENSOR_QUEUE_MEM_CLEANUP_PRIORITY   5
#define SENSOR_QUEUE_MEM_CLEANUP_CORE_ID    1

#define SENSOR_SEND_TO_WEBSOCKET_SERVER_STACK_SIZE 4096
#define SENSOR_SEND_TO_WEBSOCKET_SERVER_PRIORITY   5
#define SENSOR_SEND_TO_WEBSOCKET_SERVER_CORE_ID    1



// DHT22 Sesor Task
#define DHT22_TASK_STACK_SIZE               4096
#define DHT22_TASK_PRIORITY                 9
#define DHT22_TASK_CORE_ID                  1

#endif /* MAIN_TASKS_COMMON_H_*/