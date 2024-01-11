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
#define WIFI_APP_TASK_STACK_SIZE              4096    // stack size of task
#define WIFI_APP_TASK_PRIORITY          5       // 0 is lowest priority in freeRTOS
#define WIFI_APP_TASK_CORE_ID           0

#endif /* MAIN_TASKS_COMMON_H_*/