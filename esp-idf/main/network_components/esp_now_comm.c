#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <inttypes.h>
#include <string.h>

#include "esp_now.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "sdkconfig.h"


#include "esp_now_comm.h"
#include "task_common.h"
#include "esp_heap_caps.h"

#define SERIAL_STR_BUFF     50


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
          -> to sensor queue for further processing

          d4:8a:fc:d0:50:41 <- controller breadboard mac
*/



//for queue managment
void esp_now_comm_outgoing_data_task(void * pvParameters)
{
    queue_packet_t *queue_packet;

    ESP_LOGI(ESP_NOW_COMM_TAG, "outgoing data packet queue started");

    for(;;){
        if (xQueueReceive(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdTRUE){
//heap_caps_dump_all();
vTaskDelay(pdMS_TO_TICKS(5000));
            heap_caps_check_integrity_all(true);
            esp_err_t result = esp_now_send(queue_packet->mac_addr, queue_packet->data, queue_packet->len);
            if (result != ESP_OK){
                ESP_LOGE(ESP_NOW_COMM_TAG, "data send unsuccessful: %s", esp_err_to_name(result));
            }else{
                ESP_LOGI(ESP_NOW_COMM_TAG, "outgoing data packet sent to : %x:%x:%x:%x:%x:%x",
                    queue_packet->mac_addr[0], queue_packet->mac_addr[1], queue_packet->mac_addr[2],
                    queue_packet->mac_addr[3], queue_packet->mac_addr[4], queue_packet->mac_addr[5]);
            }
            heap_caps_check_integrity_all(true);
            //vTaskDelay(pdMS_TO_TICKS(500));
            // free(queue_packet->data);
            // free(queue_packet);

        }
    }
}

//for queue managment
void esp_now_comm_incoming_data_task(void * pvParameters)
{
    queue_packet_t *espnow_queue_packet;
    sensor_data_t *sensor_data;
    ESP_LOGI(ESP_NOW_COMM_TAG, "incoming data packet queue started");

    for(;;){
        if (xQueueReceive(esp_now_comm_incoming_data_queue_handle, &espnow_queue_packet, portMAX_DELAY) == pdTRUE){
            sensor_data = deserialize_sensor_data(espnow_queue_packet->data,espnow_queue_packet->len);

            //log for test
            //print_sensor_data(sensor_data);
            //pass data to sensor queue

            //allocate for data_packet
            sensor_data_t *data_packet = (sensor_data_t*)malloc(sizeof(sensor_data_t));

            data_packet->pin_number= sensor_data->pin_number;
            data_packet->sensor_type = sensor_data->sensor_type;
            data_packet->total_values = sensor_data->total_values;
            data_packet->local_sensor_id = sensor_data->local_sensor_id;
            data_packet->timestamp = sensor_data->timestamp;

            //TODO: mem error handling
            data_packet->value = (float *)malloc(data_packet->total_values * sizeof(float));
            data_packet->module_id=(char*)malloc(strlen(sensor_data->module_id) +1);
            strcpy(data_packet->module_id, sensor_data->module_id);

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




            //process the recieved message -> pass the sensor event queue

            extern QueueHandle_t sensor_queue_handle;
            if(xQueueSend(sensor_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS){
                    ESP_LOGI(ESP_NOW_COMM_TAG, "incoming data packet recieved from : %x:%x:%x:%x:%x:%x",
                    espnow_queue_packet->mac_addr[0], espnow_queue_packet->mac_addr[1], espnow_queue_packet->mac_addr[2],
                    espnow_queue_packet->mac_addr[3], espnow_queue_packet->mac_addr[4], espnow_queue_packet->mac_addr[5]);

                    ESP_LOGD(ESP_NOW_COMM_TAG, "sensor data communicated and sent to sensor que for postprocessing");
                }else{
                    ESP_LOGE(ESP_NOW_COMM_TAG, "data communicated failed to transfer to sensor que");
                }

            free(espnow_queue_packet->data);
            free(espnow_queue_packet);
            free(sensor_data->value);
            free(sensor_data->location);
            free(sensor_data->module_id);
            free(sensor_data);
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
uint8_t* serialize_sensor_data(const sensor_data_t *data, size_t *size) {
    // Calculate the size needed for serialization
    
    size_t total_size = sizeof(int8_t) * 3 +             // pin_number, total_values, local_sensor_id
                        sizeof(Sensor_List) +           // sensor_type
                        sizeof(float) * data->total_values +  // value array
                        sizeof(char) * SERIAL_STR_BUFF +    // location (including null terminator)
                        sizeof(char) * SERIAL_STR_BUFF +   // module_id (including null terminator)
                        sizeof(time_t);                // timestamp

    // Allocate memory for serialized data
    uint8_t *serialized_data = (uint8_t*)malloc(total_size);
    if (serialized_data == NULL) {
        // Memory allocation failed
        *size = 0;
        return NULL;
    }

    // Serialize each field into the byte array
    size_t offset = 0;

    memcpy(serialized_data + offset, &(data->pin_number), sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(serialized_data + offset, &(data->total_values), sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(serialized_data + offset, &(data->local_sensor_id), sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(serialized_data + offset, &(data->sensor_type), sizeof(Sensor_List));
    offset += sizeof(Sensor_List);

    memcpy(serialized_data + offset, &(data->timestamp), sizeof(time_t));
    offset += sizeof(time_t);

    strcpy((char*)(serialized_data + offset), data->location);
    offset += (SERIAL_STR_BUFF - (strlen(data->location) + 1));

    strcpy((char*)(serialized_data + offset), data->module_id);
    offset += (SERIAL_STR_BUFF - (strlen(data->module_id) + 1));

    for (int i = 0; i < data->total_values; i++) {
        memcpy(serialized_data + offset, &(data->value[i]), sizeof(float));
        offset += sizeof(float);
    }

    // Set the size and return the serialized data
    *size = total_size;
    return serialized_data;
}
// }
// Function to serialize sensor_data_t
// uint8_t* serialize_sensor_data(const sensor_data_t *data, size_t *size) {
//     // Calculate size needed for serialization
//     size_t location_len = strlen(data->location) + 1; // +1 for null terminator
//     size_t module_id_len = strlen(data->module_id) + 1;
//     size_t values_size = sizeof(float) * data->total_values;
// heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     *size = sizeof(data->pin_number) + sizeof(data->sensor_type)
//             + sizeof(data->total_values) + sizeof(data->local_sensor_id)
//              + sizeof(data->timestamp)
//             + values_size + location_len;
// heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     uint8_t *buffer = malloc(*size);
//     if (!buffer) {
//         return NULL; // Failed to allocate memory
//     }
// heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     uint8_t *ptr = buffer;
//     // Copy data into the buffer
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, &data->pin_number, sizeof(data->pin_number)); ptr += sizeof(data->pin_number);
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, &data->sensor_type, sizeof(data->sensor_type)); ptr += sizeof(data->sensor_type);
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, &data->total_values, sizeof(data->total_values)); ptr += sizeof(data->total_values);
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, data->value, values_size); ptr += values_size;
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, &data->local_sensor_id, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, data->module_id, module_id_len); ptr += module_id_len;
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, &data->timestamp, sizeof(data->timestamp)); ptr += sizeof(data->timestamp);
//     heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     memcpy(ptr, data->location, location_len); // ptr += location_len; // Not needed as this is the last item
// heap_caps_check_integrity_all(true);
//     printf("left->%d\n",heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
//     return buffer;
// }

// // Function to deserialize sensor_data_t from a byte stream
// sensor_data_t* deserialize_sensor_data(const uint8_t *buffer, size_t size) {
//     sensor_data_t *data = malloc(sizeof(sensor_data_t));
//     if (!data) {
//         return NULL; // Failed to allocate memory
//     }

//     const uint8_t *ptr = buffer;
//     memcpy(&data->pin_number, ptr, sizeof(data->pin_number)); ptr += sizeof(data->pin_number);
//     memcpy(&data->sensor_type, ptr, sizeof(data->sensor_type)); ptr += sizeof(data->sensor_type);
//     memcpy(&data->total_values, ptr, sizeof(data->total_values)); ptr += sizeof(data->total_values);

//     size_t values_size = sizeof(float) * data->total_values;
//     data->value = malloc(values_size);
//     memcpy(data->value, ptr, values_size); ptr += values_size;

//     memcpy(&data->local_sensor_id, ptr, sizeof(data->local_sensor_id)); ptr += sizeof(data->local_sensor_id);

//     size_t module_id_len = strlen((const char *)ptr) + 1;
//     data->module_id = malloc(module_id_len);
//     memcpy(data->module_id, ptr, module_id_len); ptr += module_id_len;

//     memcpy(&data->timestamp, ptr, sizeof(data->timestamp)); ptr += sizeof(data->timestamp);

//     size_t location_len = strlen((const char *)ptr) + 1;
//     data->location = malloc(location_len);
//     memcpy(data->location, ptr, location_len); // ptr += location_len; // Not needed as this is the last item

//     return data;
// }
sensor_data_t* deserialize_sensor_data(const uint8_t *serialized_data, size_t size) {
    // Allocate memory for the deserialized data

    
    sensor_data_t *deserialized_data = (sensor_data_t*)malloc(sizeof(sensor_data_t));
    if (deserialized_data == NULL) {
        puts("allocation failed for deserialized_data");
        // Memory allocation failed
        return NULL;
    }

    // Deserialize each field from the byte array
    size_t offset = 0;

    memcpy(&(deserialized_data->pin_number), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(&(deserialized_data->total_values), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(&(deserialized_data->local_sensor_id), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(&(deserialized_data->sensor_type), serialized_data + offset, sizeof(Sensor_List));
    offset += sizeof(Sensor_List);

    memcpy(&(deserialized_data->timestamp), serialized_data + offset, sizeof(time_t));
    offset += sizeof(time_t);

     // Deserialize the location string
    deserialized_data->location = strdup((char*)(serialized_data + offset));
    if (deserialized_data->location == NULL) {
        // Memory allocation failed
        puts("allocatoin failed for desearialized_data->location");
        free(deserialized_data);
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->location) + 1));

    // Deserialize the module_id string
    deserialized_data->module_id = strdup((char*)(serialized_data + offset));
    if (deserialized_data->module_id == NULL) {
        puts("allocation failed for deserialized_data->module_id");
        // Memory allocation failed
        free(deserialized_data->location);
        free(deserialized_data);
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->module_id) + 1));


    // Allocate memory for the value array
    deserialized_data->value = (float*)malloc(sizeof(float) * deserialized_data->total_values);
    if (deserialized_data->value == NULL) {
        // Memory allocation failed
        puts("allocation failed for deserialized_data->value");
        free(deserialized_data->location);
        free(deserialized_data->module_id);
        free(deserialized_data);
        return NULL;
    }

    // Deserialize the value array
    for (int i = 0; i < deserialized_data->total_values; i++) {
        memcpy(&(deserialized_data->value[i]), serialized_data + offset, sizeof(float));
        offset += sizeof(float);
    }

   
    return deserialized_data;
}

// Function to calculate the size needed for serialization
size_t calculate_serialized_size(const sensor_data_t *data) {
    // Fixed size for int and int fields
    size_t fixed_size = sizeof(data->pin_number) + sizeof(data->total_values) +
                        sizeof(data->local_sensor_id)
                        + sizeof(data->timestamp) + sizeof(data->sensor_type);

    // Dynamic size for the float array
    size_t values_size = sizeof(float) * data->total_values;
    //printf("%s", data->location);
    // Dynamic size for the location string (including null terminator)
    size_t location_len = strlen(data->location) + 1;

    size_t module_id = strlen(data->module_id) + 1;

    // Total size
    size_t total_size = fixed_size + values_size + location_len + module_id;

    return total_size;
}

void print_sensor_data(const sensor_data_t* data) {
    printf("Pin Number: %d\n", data->pin_number);
    printf("Sensor Type: %d\n", data->sensor_type);
    printf("Total Values: %d\n", data->total_values);
    printf("Location: %s\n", data->location);
    printf("Local Sensor ID: %d\n", data->local_sensor_id);
    printf("Module ID: %s\n", data->module_id);

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