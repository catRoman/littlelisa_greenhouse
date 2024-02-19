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


// HTTP Server task
#define HTTP_SERVER_TASK_STACK_SIZE     8192
#define HTTP_SERVER_TASK_PRIORITY       4
#define HTTP_SERVER_TASK_CORE_ID        0

// HTTP Server Monitor task
#define HTTP_SERVER_MONITOR_STACK_SIZE  4096
#define HTTP_SERVER_MONITOR_PRIORITY    3
#define HTTP_SERVER_MONITOR_CORE_ID     0

// DHT22 Sesor Task
#define DHT22_TASK_STACK_SIZE           4096
#define DHT22_TASK_PRIORITY             5
#define DHT22_TASK_CORE_ID              1

#endif /* MAIN_TASKS_COMMON_H_*/