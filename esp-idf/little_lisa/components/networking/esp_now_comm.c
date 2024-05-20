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
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "sdkconfig.h"

#include "esp_now_comm.h"
#include "task_common.h"
#include "esp_heap_caps.h"

#define SERIAL_STR_BUFF 50

// for sensor que
extern int send_id;
extern SemaphoreHandle_t send_id_mutex;

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

// for queue managment
void esp_now_comm_outgoing_data_task(void *pvParameters)
{
    queue_packet_t *queue_packet;

    ESP_LOGI(ESP_NOW_COMM_TAG, "outgoing data packet queue started");

    for (;;)
    {
        if (xQueueReceive(esp_now_comm_outgoing_data_queue_handle, &queue_packet, portMAX_DELAY) == pdTRUE)
        {

            //  vTaskDelay(pdMS_TO_TICKS(4000));
            // vTaskDelay(pdMS_TO_TICKS(5000));
            // TODO: add blinky light for every succesful send
            esp_err_t result = esp_now_send(queue_packet->mac_addr, queue_packet->data, queue_packet->len);
            if (result != ESP_OK)
            {
                ESP_LOGE(ESP_NOW_COMM_TAG, "data send unsuccessful: %s", esp_err_to_name(result));
            }
            else
            {
                ESP_LOGI(ESP_NOW_COMM_TAG, "outgoing data packet sent to : %x:%x:%x:%x:%x:%x",
                         queue_packet->mac_addr[0], queue_packet->mac_addr[1], queue_packet->mac_addr[2],
                         queue_packet->mac_addr[3], queue_packet->mac_addr[4], queue_packet->mac_addr[5]);
            }

            free(queue_packet->data);
            queue_packet->data = NULL;
            free(queue_packet);
            queue_packet = NULL;
        }
    }
}

// for queue managment
void esp_now_comm_incoming_data_task(void *pvParameters)
{
    queue_packet_t *espnow_queue_packet;
    sensor_data_t *sensor_data;
    ESP_LOGI(ESP_NOW_COMM_TAG, "incoming data packet queue started");

    for (;;)
    {
        if (xQueueReceive(esp_now_comm_incoming_data_queue_handle, &espnow_queue_packet, portMAX_DELAY) == pdTRUE)
        {
            sensor_data = deserialize_sensor_data(espnow_queue_packet->data, espnow_queue_packet->len);
            if (sensor_data != NULL)
            {

                // log for test
                // print_sensor_data(sensor_data);
                // pass data to sensor queue

                // allocate for data_packet
                sensor_data_t *data_packet = (sensor_data_t *)malloc(sizeof(sensor_data_t));

                if (data_packet != NULL)
                {

                    data_packet->pin_number = sensor_data->pin_number;
                    data_packet->sensor_type = sensor_data->sensor_type;
                    data_packet->total_values = sensor_data->total_values;
                    data_packet->local_sensor_id = sensor_data->local_sensor_id;
                    data_packet->zone_num = sensor_data->zone_num;
                    data_packet->greenhouse_id = sensor_data->greenhouse_id;

                    // sensor_square_pos
                    data_packet->sensor_square_pos[0] = sensor_data->sensor_square_pos[0];
                    data_packet->sensor_square_pos[1] = sensor_data->sensor_square_pos[1];
                    // sensor_sn_rel_pos
                    data_packet->sensor_zn_rel_pos[0] = sensor_data->sensor_zn_rel_pos[0];
                    data_packet->sensor_zn_rel_pos[1] = sensor_data->sensor_zn_rel_pos[1];
                    data_packet->sensor_zn_rel_pos[2] = sensor_data->sensor_zn_rel_pos[2];
                    // module_square_pos
                    data_packet->module_square_pos[0] = sensor_data->module_square_pos[0];
                    data_packet->module_square_pos[1] = sensor_data->module_square_pos[1];
                    // module_zn_rel_pos
                    data_packet->module_zn_rel_pos[0] = sensor_data->module_zn_rel_pos[0];
                    data_packet->module_zn_rel_pos[1] = sensor_data->module_zn_rel_pos[1];
                    data_packet->module_zn_rel_pos[2] = sensor_data->module_zn_rel_pos[2];

                    data_packet->timestamp = sensor_data->timestamp;

                    // TODO: mem error handling
                    data_packet->value = (float *)malloc(data_packet->total_values * sizeof(float));
                    data_packet->module_id = (char *)malloc(strlen(sensor_data->module_id) + 1);
                    strcpy(data_packet->module_id, sensor_data->module_id);

                    data_packet->location = (char *)malloc(strlen(sensor_data->location) + 1);
                    strcpy(data_packet->location, sensor_data->location);

                    data_packet->module_type = (char *)malloc(strlen(sensor_data->module_type) + 1);
                    strcpy(data_packet->module_type, sensor_data->module_type);

                    data_packet->module_location = (char *)malloc(strlen(sensor_data->module_location) + 1);
                    strcpy(data_packet->module_location, sensor_data->module_location);

                    for (int i = 0; i < data_packet->total_values; i++)
                    {
                        data_packet->value[i] = sensor_data->value[i];
                    }

                    // sensor queue wrapper mem allocation
                    sensor_queue_wrapper_t *queue_packet = (sensor_queue_wrapper_t *)malloc(sizeof(sensor_queue_wrapper_t));

                    if (queue_packet != NULL)
                    {

                        queue_packet->nextEventID = SENSOR_POST_PROCESSING;
                        queue_packet->sensor_data = data_packet;
                        queue_packet->semphoreCount = 0;

                        // Protect send_id access with the mutex
                        if (xSemaphoreTake(send_id_mutex, portMAX_DELAY) == pdTRUE)
                        {
                            queue_packet->current_send_id = send_id;
                            send_id++;
                            xSemaphoreGive(send_id_mutex); // Release the mutex after updating send_id
                        }
                        else
                        {
                            ESP_LOGW(ESP_NOW_COMM_TAG, "failed to get semaphore for send_id");
                        }

                        // process the recieved message -> pass the sensor event queue

                        extern QueueHandle_t sensor_queue_handle;
                        if (xQueueSend(sensor_queue_handle, &queue_packet, portMAX_DELAY) == pdPASS)
                        {
                            ESP_LOGI(ESP_NOW_COMM_TAG, "incoming data packet recieved from : %x:%x:%x:%x:%x:%x",
                                     espnow_queue_packet->mac_addr[0], espnow_queue_packet->mac_addr[1], espnow_queue_packet->mac_addr[2],
                                     espnow_queue_packet->mac_addr[3], espnow_queue_packet->mac_addr[4], espnow_queue_packet->mac_addr[5]);

                            ESP_LOGD(ESP_NOW_COMM_TAG, "sensor data communicated and sent to sensor que for postprocessing");
                        }
                        else
                        {
                            ESP_LOGE(ESP_NOW_COMM_TAG, "data communicated failed to transfer to sensor que");
                        }

                        free(espnow_queue_packet->data);
                        espnow_queue_packet->data = NULL;
                        free(espnow_queue_packet);
                        espnow_queue_packet = NULL;
                    }
                    else
                    {
                        ESP_LOGE(ESP_NOW_COMM_TAG, "failed to allocate mem for incoming queue packet");
                        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
                    }

                    free(sensor_data->value);
                    sensor_data->value = NULL;
                    free(sensor_data->location);
                    sensor_data->location = NULL;
                    free(sensor_data->module_id);
                    sensor_data->module_id = NULL;
                    free(sensor_data->module_type);
                    sensor_data->module_type = NULL;
                    free(sensor_data->module_location);
                    sensor_data->module_location = NULL;
                    free(sensor_data);
                    sensor_data = NULL;
                }
                else
                {
                    ESP_LOGE(ESP_NOW_COMM_TAG, "failed to allocate mem for new sensor data packet");
                    ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
                    ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
                }
            }
            else
            {
                ESP_LOGE(ESP_NOW_COMM_TAG, "failed to allocate mem for incoming sensor data packet");
                ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
                ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
            }
        }
    }
}

esp_err_t esp_now_comm_start()
{
    // TODO: verifiy its succesfull
    esp_log_level_set(ESP_NOW_COMM_TAG, ESP_LOG_INFO);
    esp_now_comm_outgoing_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));
    esp_now_comm_incoming_data_queue_handle = xQueueCreate(10, sizeof(queue_packet_t));

    // outgoing message
    BaseType_t task_code;
    task_code = xTaskCreatePinnedToCore(
        esp_now_comm_outgoing_data_task,
        "enw_c_out",
        ESP_NOW_COMM_OUTGOING_STACK_SIZE,
        NULL, ESP_NOW_COMM_OUTGOING_PRIORITY,
        &esp_now_comm_outgoing_data_task_handle,
        ESP_NOW_COMM_OUTGOING_CORE_ID);

    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    // incoming messages
    task_code = xTaskCreatePinnedToCore(
        esp_now_comm_incoming_data_task,
        "enw_c_in",
        ESP_NOW_COMM_INCOMING_STACK_SIZE,
        NULL, ESP_NOW_COMM_INCOMING_PRIORITY,
        &esp_now_comm_incoming_data_task_handle,
        ESP_NOW_COMM_INCOMING_CORE_ID);
    if (task_code != pdPASS)
    {
        ESP_LOGD("Free Memory", "Available internal heap for task creation: %d", heap_caps_get_free_size(MALLOC_CAP_INTERNAL));
        ESP_LOGE("Task Create Failed", "Unable to create task, returned: %d", task_code);
    }
    // Initialize ESP-NOW
    if (esp_now_init() != ESP_OK)
    {
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

    if (esp_now_add_peer(&peerInfo) != ESP_OK)
    {
        ESP_LOGE("ESP_NOW", "Failed to add peer");
        return ESP_FAIL;
    }

    return ESP_OK;
}

esp_err_t esp_now_comm_get_config_reciever_mac_addr(uint8_t *mac_bytes)
{
    const char *mac_str = CONFIG_ESP_NOW_COMM_RECIEVER_MAC_ADDRESS;

    if (!mac_str || !mac_bytes)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Mac address input from config invalid");
        return ESP_FAIL; // Invalid input
    }

    int values[6]; // Temporary array to hold sscanf results
    int i;
    if (6 == sscanf(mac_str, "%x:%x:%x:%x:%x:%x",
                    &values[0], &values[1], &values[2],
                    &values[3], &values[4], &values[5]))
    {
        // Convert to uint8_t
        for (i = 0; i < 6; ++i)
        {
            mac_bytes[i] = (uint8_t)values[i];
        }
        ESP_LOGV(ESP_NOW_COMM_TAG, "Mac address parsing from configuration successful");
        return ESP_OK; // Success
    }
    ESP_LOGE(ESP_NOW_COMM_TAG, "MAC address parsing from config failed");
    return ESP_FAIL; // Parsing failed
}

extern QueueHandle_t esp_now_comm_incoming_data_queue_handle; // Make sure this is initialized

void esp_now_comm_on_data_recv_cb(const esp_now_recv_info_t *recv_info, const uint8_t *data, int len)
{
    // Allocate memory for the packet and its data
    queue_packet_t *packet = calloc(1, sizeof(queue_packet_t));
    if (packet == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to allocate memory for queue packet");
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());

        return;
    }

    packet->data = malloc(len); // Allocate memory for the data
    if (packet->data == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to allocate memory for data");
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
        free(packet); // Clean up previously allocated packet memory
        packet = NULL;
        return;
    }

    // Copy MAC address
    memcpy(packet->mac_addr, recv_info->src_addr, ESP_NOW_ETH_ALEN);

    // Copy received data
    memcpy(packet->data, data, len);
    packet->len = len;

    // Post the message pointer to the queue
    if (xQueueSend(esp_now_comm_incoming_data_queue_handle, &packet, portMAX_DELAY) != pdPASS)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Failed to send packet to incoming data queue");
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
        free(packet->data); // Clean up allocated data memory
        packet->data = NULL;
        free(packet); // Clean up packet memory
        packet = NULL;
    }
    else
    {
        ESP_LOGV(ESP_NOW_COMM_TAG, "Data received and sent to incoming queue");
    }
}

void esp_now_comm_on_data_send_cb(const uint8_t *mac_addr, esp_now_send_status_t status)
{
    // Handle data send acknowledgment
    if (status == ESP_NOW_SEND_SUCCESS)
        ESP_LOGV(ESP_NOW_COMM_TAG, "data send -Ack here");
    else
        ESP_LOGW(ESP_NOW_COMM_TAG, "send failure");
}
uint8_t *serialize_sensor_data(const sensor_data_t *data, size_t *size)
{
    // Calculate the size needed for serialization

    size_t total_size = sizeof(int8_t) * 5 +                 // pin_number, total_values, local_sensor_id, zone_num, greenhouse_id
                        sizeof(int8_t) * 4 +                 // sensor square pos/ module square pos
                        sizeof(int8_t) * 6 +                 // sensor zn_rel pos/ module zn_rel pos
                        sizeof(Sensor_List) +                // sensor_type
                        sizeof(float) * data->total_values + // value array
                        sizeof(char) * SERIAL_STR_BUFF +     // location (including null terminator)
                        sizeof(char) * SERIAL_STR_BUFF +     // module_id (including null terminator)
                        sizeof(time_t) +                     // timestamp
                        sizeof(char) * SERIAL_STR_BUFF +     // module_type(including null terminator)
                        sizeof(char) * SERIAL_STR_BUFF;      // module_location (including null term)

    // Allocate memory for serialized data
    uint8_t *serialized_data = (uint8_t *)malloc(total_size);
    if (serialized_data == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "Minimum heap free: %lu bytes\n", esp_get_free_heap_size());
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

    memcpy(serialized_data + offset, &(data->zone_num), sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(serialized_data + offset, &(data->greenhouse_id), sizeof(int8_t));
    offset += sizeof(int8_t);

    // sensor sqr pos
    memcpy(serialized_data + offset, &(data->sensor_square_pos[0]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->sensor_square_pos[1]), sizeof(int8_t));
    offset += sizeof(int8_t);
    // module sqr pos
    memcpy(serialized_data + offset, &(data->module_square_pos[0]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->module_square_pos[1]), sizeof(int8_t));
    offset += sizeof(int8_t);

    // sensor zn rel pos
    memcpy(serialized_data + offset, &(data->sensor_zn_rel_pos[0]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->sensor_zn_rel_pos[1]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->sensor_zn_rel_pos[2]), sizeof(int8_t));
    offset += sizeof(int8_t);
    // module zn rel pos
    memcpy(serialized_data + offset, &(data->module_zn_rel_pos[0]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->module_zn_rel_pos[1]), sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(serialized_data + offset, &(data->module_zn_rel_pos[2]), sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(serialized_data + offset, &(data->sensor_type), sizeof(Sensor_List));
    offset += sizeof(Sensor_List);

    memcpy(serialized_data + offset, &(data->timestamp), sizeof(time_t));
    offset += sizeof(time_t);

    strcpy((char *)(serialized_data + offset), data->location);
    offset += (SERIAL_STR_BUFF - (strlen(data->location) + 1));

    strcpy((char *)(serialized_data + offset), data->module_id);
    offset += (SERIAL_STR_BUFF - (strlen(data->module_id) + 1));

    strcpy((char *)(serialized_data + offset), data->module_type);
    offset += (SERIAL_STR_BUFF - (strlen(data->module_type) + 1));

    strcpy((char *)(serialized_data + offset), data->module_location);
    offset += (SERIAL_STR_BUFF - (strlen(data->module_location) + 1));

    for (int i = 0; i < data->total_values; i++)
    {
        memcpy(serialized_data + offset, &(data->value[i]), sizeof(float));
        offset += sizeof(float);
    }

    // Set the size and return the serialized data
    *size = total_size;
    return serialized_data;
}

sensor_data_t *deserialize_sensor_data(const uint8_t *serialized_data, size_t size)
{
    // Allocate memory for the deserialized data

    sensor_data_t *deserialized_data = (sensor_data_t *)malloc(sizeof(sensor_data_t));
    if (deserialized_data == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "allocation failed for deserialized_data");
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

    memcpy(&(deserialized_data->zone_num), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(&(deserialized_data->greenhouse_id), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    // sensor sq pos
    memcpy(&(deserialized_data->sensor_square_pos[0]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->sensor_square_pos[1]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    // module sq pos
    memcpy(&(deserialized_data->module_square_pos[0]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->module_square_pos[1]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    // sensor zn rel
    memcpy(&(deserialized_data->sensor_zn_rel_pos[0]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->sensor_zn_rel_pos[1]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->sensor_zn_rel_pos[2]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    // module zn rel
    memcpy(&(deserialized_data->module_zn_rel_pos[0]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->module_zn_rel_pos[1]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);
    memcpy(&(deserialized_data->module_zn_rel_pos[2]), serialized_data + offset, sizeof(int8_t));
    offset += sizeof(int8_t);

    memcpy(&(deserialized_data->sensor_type), serialized_data + offset, sizeof(Sensor_List));
    offset += sizeof(Sensor_List);

    memcpy(&(deserialized_data->timestamp), serialized_data + offset, sizeof(time_t));
    offset += sizeof(time_t);

    // Deserialize the location string
    deserialized_data->location = strdup((char *)(serialized_data + offset));
    if (deserialized_data->location == NULL)
    {
        // Memory allocation failed
        ESP_LOGE(ESP_NOW_COMM_TAG, "allocatoin failed for desearialized_data->location");
        free(deserialized_data);
        deserialized_data = NULL;
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->location) + 1));

    // Deserialize the module_id string
    deserialized_data->module_id = strdup((char *)(serialized_data + offset));
    if (deserialized_data->module_id == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "allocation failed for deserialized_data->module_id");
        // Memory allocation failed
        free(deserialized_data->location);
        deserialized_data->location = NULL;
        free(deserialized_data);
        deserialized_data = NULL;
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->module_id) + 1));

    // Deserialize the module_type string
    deserialized_data->module_type = strdup((char *)(serialized_data + offset));
    if (deserialized_data->module_type == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "allocation failed for deserialized_data->module_type");
        // Memory allocation failed
        free(deserialized_data->module_id);
        deserialized_data->module_id = NULL;
        free(deserialized_data->location);
        deserialized_data->location = NULL;
        free(deserialized_data);
        deserialized_data = NULL;
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->module_type) + 1));

    // Deserialize the module_location string
    deserialized_data->module_location = strdup((char *)(serialized_data + offset));
    if (deserialized_data->module_location == NULL)
    {
        ESP_LOGE(ESP_NOW_COMM_TAG, "allocation failed for deserialized_data->module_location");
        // Memory allocation failed
        free(deserialized_data->module_type);
        deserialized_data->module_type = NULL;
        free(deserialized_data->module_id);
        deserialized_data->module_id = NULL;
        free(deserialized_data->location);
        deserialized_data->location = NULL;
        free(deserialized_data);
        deserialized_data = NULL;
        return NULL;
    }
    offset += (SERIAL_STR_BUFF - (strlen(deserialized_data->module_location) + 1));

    // Allocate memory for the value array
    deserialized_data->value = (float *)malloc(sizeof(float) * deserialized_data->total_values);
    if (deserialized_data->value == NULL)
    {
        // Memory allocation failed

        ESP_LOGE(ESP_NOW_COMM_TAG, "allocation failed for deserialized_data->value");
        free(deserialized_data->module_location);
        deserialized_data->module_location = NULL;
        free(deserialized_data->module_type);
        deserialized_data->module_type = NULL;
        free(deserialized_data->location);
        deserialized_data->location = NULL;
        free(deserialized_data->module_id);
        deserialized_data->module_id = NULL;
        free(deserialized_data);
        deserialized_data = NULL;
        return NULL;
    }

    // Deserialize the value array
    for (int i = 0; i < deserialized_data->total_values; i++)
    {
        memcpy(&(deserialized_data->value[i]), serialized_data + offset, sizeof(float));
        offset += sizeof(float);
    }

    return deserialized_data;
}

// Function to calculate the size needed for serialization
// size_t calculate_serialized_size(const sensor_data_t *data)
// {
//     // Fixed size for int and int fields
//     size_t fixed_size = sizeof(data->pin_number) + sizeof(data->total_values) +
//                         sizeof(data->local_sensor_id) + sizeof(data->timestamp) + sizeof(data->sensor_type);

//     // Dynamic size for the float array
//     size_t values_size = sizeof(float) * data->total_values;
//     // printf("%s", data->location);
//     //  Dynamic size for the location string (including null terminator)
//     size_t location_len = strlen(data->location) + 1;

//     size_t module_id = strlen(data->module_id) + 1;

//     // Total size
//     size_t total_size = fixed_size + values_size + location_len + module_id;

//     return total_size;
// }

void print_sensor_data(const sensor_data_t *data)
{
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
    for (int i = 0; i < data->total_values; ++i)
    {
        printf("%f ", data->value[i]);
    }
    printf("\n"); // New line after printing all values
}