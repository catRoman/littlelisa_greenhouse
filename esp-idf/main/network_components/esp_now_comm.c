#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <inttypes.h>
#include <string.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/task.h"
#include "sdkconfig.h"

#include "esp_now_comm.h"
#include "task_common.h"



static const char ESP_NOW_COMM_TAG[] = "esp_now";

QueueHandle_t esp_now_comm_outgoing_data_queue_handle = NULL;
QueueHandle_t esp_now_comm_incoming_data_queue_handle = NULL;

static TaskHandle_t esp_now_comm_outgoing_data_task_handle = NULL;
static TaskHandle_t esp_now_comm_incoming_data_task_handle = NULL;

/**
 * (send)-> sensor queue sends sensor_data_t to esp_now data wrapper(queue packet)
 *       -> data is serialized and assigned to data_wrapper object with serialized size
 *       -> wrapped data is past to esp_now send queue
 *       -> wrapped data size and serialized data is used to send data
 * 
 * (recv) -> send data struct to incoming queue, log, deserialize and send sensor_data_t
 *        -> to sensor queue for further processing
*/



//for queue managment
void esp_now_comm_outgoing_data_task(void * pvParameters)
{
    queue_packet_t queue_packet;
    uint8_t *temp_data;

    ESP_LOGI(ESP_NOW_COMM_TAG, "outgoing data packet queue started");

    for(;;){
        if (xQueueReceive(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdTRUE){
            
            

            esp_err_t result = esp_now_send(&queue_packet.mac_addr, queue_packet.data, queue_packet.len);
            if (result == ESP_OK){
                ESP_LOGI(ESP_NOW_COMM_TAG, "data sent successful");
            }
                ESP_LOGE(ESP_NOW_COMM_TAG, "data send unsuccessful");
        }
    }
}

//for queue managment
void esp_now_comm_incoming_data_task(void * pvParameters)
{
    queue_packet_t *queue_packet;
    sensor_data_t *sensor_data;
    ESP_LOGI(ESP_NOW_COMM_TAG, "incoming data packet queue started");

    for(;;){
        if (xQueueReceive(esp_now_comm_incoming_data_queue_handle, &queue_packet, portMAX_DELAY) == pdTRUE){
            sensor_data = deserialize_sensor_data(queue_packet->data,queue_packet->len);

            //log for test
            print_sensor_data(sensor_data);
            free(queue_packet);
            free(sensor_data);

                   
            //process the recieved message -> pass the sensor event queue
        }
    }
}

esp_err_t esp_now_comm_start(){

    //TODO: verifiy its succesfull
    esp_now_comm_outgoing_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));
    esp_now_comm_incoming_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));

    //outgoing message
    xTaskCreatePinnedToCore(
        &esp_now_comm_outgoing_data_task,
        "esp_now_comm_outgoing_data",
        ESP_NOW_COMM_OUTGOING_STACK_SIZE,
        NULL, ESP_NOW_COMM_OUTGOING_PRIORITY,
        &esp_now_comm_outgoing_data_task_handle, 
        ESP_NOW_COMM_OUTGOING_CORE_ID);

    //incoming messages
    xTaskCreatePinnedToCore(
        &esp_now_comm_incoming_data_task,
        "esp_now_comm_incoming_data",
        ESP_NOW_COMM_INCOMING_STACK_SIZE,
        NULL, ESP_NOW_COMM_INCOMING_PRIORITY,
        &esp_now_comm_incoming_data_task_handle, 
        ESP_NOW_COMM_INCOMING_CORE_ID);
    
    // Initialize ESP-NOW
    if (esp_now_init() != ESP_OK) {
        ESP_LOGE(ESP_NOW_COMM_TAG, "ESP-NOW initialization failed");
        return ESP_FAIL;
    }

    ESP_LOGI("ESP_NOW", "ESP-NOW Initialized");
    esp_now_register_send_cb(esp_now_comm_on_data_send_cb);
    esp_now_register_recv_cb(esp_now_comm_on_data_recv_cb);

    uint8_t peer_addr[6];

    esp_now_comm_get_config_reciever_mac_addr(&peer_addr);

    esp_now_peer_info_t peerInfo = {};
    memcpy(peerInfo.peer_addr, &peer_addr, ESP_NOW_ETH_ALEN);
    peerInfo.channel = 0;  
    peerInfo.encrypt = false;

    if (esp_now_add_peer(&peerInfo) != ESP_OK) {
        ESP_LOGE("ESP_NOW", "Failed to add peer");
        return ESP_FAIL;
    }

    return ESP_OK;
}

esp_err_t esp_now_comm_get_config_reciever_mac_addr(uint8_t* mac_bytes) {
    const char* mac_str = CONFIG_ESP_NOW_COMM_RECIEVER_MAC_ADDRESS;

    if (!mac_str || !mac_bytes) {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Mac address input from config invalid");
        return ESP_FAIL; // Invalid input
    }

    int values[6]; // Temporary array to hold sscanf results
    int i;
    if (6 == sscanf(mac_str, "%x:%x:%x:%x:%x:%x", 
                    &values[0], &values[1], &values[2], 
                    &values[3], &values[4], &values[5])) {
        // Convert to uint8_t
        for (i = 0; i < 6; ++i) {
            mac_bytes[i] = (uint8_t)values[i];
        }
        ESP_LOGI(ESP_NOW_COMM_TAG, "Mac address parsing from configuration successful");
        return ESP_OK; // Success
    }
    ESP_LOGE(ESP_NOW_COMM_TAG, "MAC address parsing from config failed");
    return ESP_FAIL; // Parsing failed
}

void esp_now_comm_on_data_recv_cb(const esp_now_recv_info_t *recv_info, const uint8_t *data, int len) {

        // Assume data_struct is a structure you've defined for queue items.
    queue_packet_t *packet = calloc(1, len + sizeof(size_t) + sizeof(uint8_t));

    uint8_t * mac_addr = recv_info->src_addr;

    if (packet != NULL) {
        memcpy(packet->mac_addr, mac_addr, ESP_NOW_ETH_ALEN); // Copy MAC address
        memcpy(packet->data, data, len);  // Copy received data
        packet->len = len;
        // Post the message pointer to the queue.
        if(xQueueSend(esp_now_comm_incoming_data_queue_handle, &packet, portMAX_DELAY) == pdPASS){
            ESP_LOGI(ESP_NOW_COMM_TAG, "data recieved sent to incoming que");
        }else{
            ESP_LOGE(ESP_NOW_COMM_TAG, "data failed to send to incoming data que");
        }
    }
}

void esp_now_comm_on_data_send_cb(const uint8_t *mac_addr, esp_now_send_status_t status) {
    // Handle data send acknowledgment
    if(status == ESP_NOW_SEND_SUCCESS)
        ESP_LOGI(ESP_NOW_COMM_TAG, "data send successes");
    else    
        ESP_LOGW(ESP_NOW_COMM_TAG, "send failure");
}

// Function to serialize sensor_data_t
uint8_t* serialize_sensor_data(const sensor_data_t *data, size_t *size) {
    // Calculate size needed for serialization
    size_t location_len = strlen(data->location) + 1; // +1 for null terminator
    size_t values_size = sizeof(float) * data->total_values;
    *size = sizeof(data->pin_number) + sizeof(data->total_values) + sizeof(data->local_sensor_id) + sizeof(data->module_id) + values_size + location_len;

    uint8_t *buffer = malloc(*size);
    if (!buffer) {
        return NULL; // Failed to allocate memory
    }

    uint8_t *ptr = buffer;
    // Copy data into the buffer
    memcpy(ptr, &data->pin_number, sizeof(data->pin_number)); ptr += sizeof(data->pin_number);
    memcpy(ptr, &data->total_values, sizeof(data->total_values)); ptr += sizeof(data->total_values);
    memcpy(ptr, data->value, values_size); ptr += values_size;
    memcpy(ptr, &data->local_sensor_id, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);
    memcpy(ptr, &data->module_id, sizeof(data->module_id)); ptr += sizeof(data->module_id);
    memcpy(ptr, data->location, location_len); // ptr += location_len; // Not needed as this is the last item

    return buffer;
}

// Function to deserialize sensor_data_t from a byte stream
sensor_data_t* deserialize_sensor_data(const uint8_t *buffer, size_t size) {
    sensor_data_t *data = malloc(sizeof(sensor_data_t));
    if (!data) {
        return NULL; // Failed to allocate memory
    }

    const uint8_t *ptr = buffer;
    memcpy(&data->pin_number, ptr, sizeof(data->pin_number)); ptr += sizeof(data->pin_number);
    memcpy(&data->total_values, ptr, sizeof(data->total_values)); ptr += sizeof(data->total_values);

    size_t values_size = sizeof(float) * data->total_values;
    data->value = malloc(values_size);
    memcpy(data->value, ptr, values_size); ptr += values_size;

    memcpy(&data->local_sensor_id, ptr, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);
    memcpy(&data->module_id, ptr, sizeof(data->module_id)); ptr += sizeof(data->module_id);

    size_t location_len = strlen((const char *)ptr) + 1;
    data->location = malloc(location_len);
    memcpy(data->location, ptr, location_len); // ptr += location_len; // Not needed as this is the last item

    return data;
}

// Function to calculate the size needed for serialization
size_t calculate_serialized_size(const sensor_data_t *data) {
    // Fixed size for int and int fields
    size_t fixed_size = sizeof(data->pin_number) + sizeof(data->total_values) +
                        sizeof(data->local_sensor_id) + sizeof(data->module_id);
    
    // Dynamic size for the float array
    size_t values_size = sizeof(float) * data->total_values;
    printf("%s", data->location);
    // Dynamic size for the location string (including null terminator)
    size_t location_len = strlen(data->location) + 1;
    
    // Total size
    size_t total_size = fixed_size + values_size + location_len;

    return total_size;
}

void print_sensor_data(const sensor_data_t* data) {
    printf("Pin Number: %d\n", data->pin_number);
    printf("Total Values: %d\n", data->total_values);
    printf("Location: %s\n", data->location);
    printf("Local Sensor ID: %d\n", data->local_sensor_id);
    printf("Module ID: %d\n", data->module_id);
    
    // Assuming 'value' points to an array of 'float', print each value
    printf("Values: ");
    for (int i = 0; i < data->total_values; ++i) {
        printf("%f ", data->value[i]);
    }
    printf("\n"); // New line after printing all values
}