/**
 * rgb_led.h
 *
 * Created on: 2024-01-08
 * Author: Catlin Roman
*/

#ifndef NODE_INFO_H_
#define NODE_INFO_H_

void node_info_log_node_list(void);

void node_info_log_sensor_list(void);

void node_info_log_module_info(void);

char *node_info_get_module_info_json(void);

#endif