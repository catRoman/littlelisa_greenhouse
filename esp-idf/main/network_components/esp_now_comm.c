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

            esp_err_t result = esp_now_send(queue_packet.mac_addr, queue_packet.data, queue_packet.len);
            if (result != ESP_OK){
                ESP_LOGE(ESP_NOW_COMM_TAG, "data send unsuccessful: %s", esp_err_to_name(result));
            }
            //vTaskDelay(pdMS_TO_TICKS(500));
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
            //print_sensor_data(sensor_data);
            //pass data to sensor queue

            //allocate for data_packet
            sensor_data_t *data_packet = (sensor_data_t*)malloc(sizeof(sensor_data_t));

            data_packet->pin_number= sensor_data->pin_number;
            data_packet->sensor_type = sensor_data->sensor_type;
            data_packet->total_values = sensor_data->total_values;
            data_packet->local_sensor_id = sensor_data->local_sensor_id;
            data_packet->module_id = sensor_data->module_id;
            data_packet->timestamp = sensor_data->timestamp;

            //TODO: mem error handling
            data_packet->value = (float *)malloc(data_packet->total_values * sizeof(float));
            data_packet->location = (char*)malloc(strlen(sensor_data->location)+1);
            strcpy(data_packet->location, sensor_data->location);

            for(int i = 0; i < data_packet->total_values; i++){
                data_packet->value[i] = sensor_data->value[i];
            }

            //sensor queue wrapper mem allocation
            sensor_queue_wrapper_t *queue_packet = (sensor_queue_wrapper_t*)malloc(sizeof(sensor_queue_wrapper_t));

            queue_packet->nextEventID = SENSOR_POST_PROCESSING;
            queue_packet->sensor_data = data_packet;
            queue_packet->semphoreCount = 0;


            free(sensor_data);


            //process the recieved message -> pass the sensor event queue

            extern QueueHandle_t sensor_queue_handle;
            if(xQueueSend(sensor_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS){
                    ESP_LOGI(ESP_NOW_COMM_TAG, "sensor data communicated and sent to sensor que for postprocessing");
                }else{
                    ESP_LOGE(ESP_NOW_COMM_TAG, "data communicated failed to transfer to sensor que");
                }

        }
    }
}

esp_err_t esp_now_comm_start(){

    //TODO: verifiy its succesfull
    esp_now_comm_outgoing_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));
    esp_now_comm_incoming_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));

    //outgoing message
    xTaskCreatePinnedToCore(
        esp_now_comm_outgoing_data_task,
        "esp_now_comm_outgoing_data",
        ESP_NOW_COMM_OUTGOING_STACK_SIZE,
        NULL, ESP_NOW_COMM_OUTGOING_PRIORITY,
        &esp_now_comm_outgoing_data_task_handle,
        ESP_NOW_COMM_OUTGOING_CORE_ID);

    //incoming messages
    xTaskCreatePinnedToCore(
        esp_now_comm_incoming_data_task,
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

    esp_now_comm_get_config_reciever_mac_addr(peer_addr);

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
        ESP_LOGV(ESP_NOW_COMM_TAG, "Mac address parsing from configuration successful");
        return ESP_OK; // Success
    }
    ESP_LOGE(ESP_NOW_COMM_TAG, "MAC address parsing from config failed");
    return ESP_FAIL; // Parsing failed
}

extern QueueHandle_t esp_now_comm_incoming_data_queue_handle; // Make sure this is initialized

void esp_now_comm_on_data_recv_cb(const esp_now_recv_info_t *recv_info, const uint8_t *data, int len) {
    // Allocate memory for the packet and its data
    queue_packet_t *packet = calloc(1, sizeof(queue_packet_t));
    if (packet == NULL) {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to allocate memory for packet");
        return;
    }

    packet->data = malloc(len); // Allocate memory for the data
    if (packet->data == NULL) {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to allocate memory for data");
        free(packet); // Clean up previously allocated packet memory
        return;
    }

    // Copy MAC address
    memcpy(packet->mac_addr, recv_info->src_addr, ESP_NOW_ETH_ALEN);

    // Copy received data
    memcpy(packet->data, data, len);
    packet->len = len;

    // Post the message pointer to the queue
    if (xQueueSend(esp_now_comm_incoming_data_queue_handle, &packet, portMAX_DELAY) != pdPASS) {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to send packet to incoming data queue");
        free(packet->data); // Clean up allocated data memory
        free(packet); // Clean up packet memory
    } else {
        ESP_LOGV(ESP_NOW_COMM_TAG, "Data received and sent to incoming queue");
    }
}

void esp_now_comm_on_data_send_cb(const uint8_t *mac_addr, esp_now_send_status_t status) {
    // Handle data send acknowledgment
    if(status == ESP_NOW_SEND_SUCCESS)
        ESP_LOGV(ESP_NOW_COMM_TAG, "data send -Ack here");
    else
        ESP_LOGW(ESP_NOW_COMM_TAG, "send failure");
}

// Function to serialize sensor_data_t
uint8_t* serialize_sensor_data(const sensor_data_t *data, size_t *size) {
    // Calculate size needed for serialization
    size_t location_len = strlen(data->location) + 1; // +1 for null terminator
    size_t values_size = sizeof(float) * data->total_values;

    *size = sizeof(data->pin_number) + sizeof(data->sensor_type)
            + sizeof(data->total_values) + sizeof(data->local_sensor_id)
            + sizeof(data->module_id) + sizeof(data->timestamp)
            + values_size + location_len;

    uint8_t *buffer = malloc(*size);
    if (!buffer) {
        return NULL; // Failed to allocate memory
    }

    uint8_t *ptr = buffer;
    // Copy data into the buffer
    memcpy(ptr, &data->pin_number, sizeof(data->pin_number)); ptr += sizeof(data->pin_number);
    memcpy(ptr, &data->sensor_type, sizeof(data->sensor_type)); ptr += sizeof(data->sensor_type);
    memcpy(ptr, &data->total_values, sizeof(data->total_values)); ptr += sizeof(data->total_values);
    memcpy(ptr, data->value, values_size); ptr += values_size;
    memcpy(ptr, &data->local_sensor_id, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);
    memcpy(ptr, &data->module_id, sizeof(data->module_id)); ptr += sizeof(data->module_id);
    memcpy(ptr, &data->timestamp, sizeof(data->timestamp)); ptr += sizeof(data->timestamp);
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
    memcpy(&data->sensor_type, ptr, sizeof(data->sensor_type)); ptr += sizeof(data->sensor_type);
    memcpy(&data->total_values, ptr, sizeof(data->total_values)); ptr += sizeof(data->total_values);

    size_t values_size = sizeof(float) * data->total_values;
    data->value = malloc(values_size);
    memcpy(data->value, ptr, values_size); ptr += values_size;

    memcpy(&data->local_sensor_id, ptr, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);
    memcpy(&data->module_id, ptr, sizeof(data->module_id)); ptr += sizeof(data->module_id);
    memcpy(&data->timestamp, ptr, sizeof(data->timestamp)); ptr += sizeof(data->timestamp);

    size_t location_len = strlen((const char *)ptr) + 1;
    data->location = malloc(location_len);
    memcpy(data->location, ptr, location_len); // ptr += location_len; // Not needed as this is the last item

    return data;
}

// Function to calculate the size needed for serialization
size_t calculate_serialized_size(const sensor_data_t *data) {
    // Fixed size for int and int fields
    size_t fixed_size = sizeof(data->pin_number) + sizeof(data->total_values) +
                        sizeof(data->local_sensor_id) + sizeof(data->module_id)
                        + sizeof(data->timestamp) + sizeof(data->sensor_type);

    // Dynamic size for the float array
    size_t values_size = sizeof(float) * data->total_values;
    //printf("%s", data->location);
    // Dynamic size for the location string (including null terminator)
    size_t location_len = strlen(data->location) + 1;

    // Total size
    size_t total_size = fixed_size + values_size + location_len;

    return total_size;
}

void print_sensor_data(const sensor_data_t* data) {
    printf("Pin Number: %d\n", data->pin_number);
    printf("Sensor Type: %d\n", data->sensor_type);
    printf("Total Values: %d\n", data->total_values);
    printf("Location: %s\n", data->location);
    printf("Local Sensor ID: %d\n", data->local_sensor_id);
    printf("Module ID: %d\n", data->module_id);

    // Convert to local time format
    struct tm *tmLocal = localtime(&data->timestamp);

    // Buffer to hold the formatted date and time
    char dateTimeStr[100];

    strftime(dateTimeStr, sizeof(dateTimeStr), "%a %b %d %H:%M:%S %Y", tmLocal);
    printf("timestamp: %s\n", dateTimeStr);

    // Assuming 'value' points to an array of 'float', print each value
    printf("Values: ");
    for (int i = 0; i < data->total_values; ++i) {
        printf("%f ", data->value[i]);
    }
    printf("\n"); // New line after printing all values
}