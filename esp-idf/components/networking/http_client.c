#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include "freertos/event_groups.h"
#include "esp_log.h"
#include "esp_http_client.h"
#include "esp_https_ota.h"

#include "http_client.h"

/* Event handler for catching system events */
static void ota_event_handler(void* arg, esp_event_base_t event_base,
                        int32_t event_id, void* event_data)
{
    if (event_base == ESP_HTTPS_OTA_EVENT) {
        switch (event_id) {
            case ESP_HTTPS_OTA_START:
                ESP_LOGI("ota", "OTA started");
                break;
            case ESP_HTTPS_OTA_CONNECTED:
                ESP_LOGI("ota", "Connected to server");
                break;
            case ESP_HTTPS_OTA_GET_IMG_DESC:
                ESP_LOGI("ota", "Reading Image Description");
                break;
            case ESP_HTTPS_OTA_VERIFY_CHIP_ID:
                ESP_LOGI("ota", "Verifying chip id of new image: %d", *(esp_chip_id_t *)event_data);
                break;
            case ESP_HTTPS_OTA_DECRYPT_CB:
                ESP_LOGI("ota", "Callback to decrypt function");
                break;
            case ESP_HTTPS_OTA_WRITE_FLASH:
                ESP_LOGD("ota", "Writing to flash: %d written", *(int *)event_data);
                break;
            case ESP_HTTPS_OTA_UPDATE_BOOT_PARTITION:
                ESP_LOGI("ota", "Boot partition updated. Next Partition: %d", *(esp_partition_subtype_t *)event_data);
                break;
            case ESP_HTTPS_OTA_FINISH:
                ESP_LOGI("ota", "OTA finish");
                break;
            case ESP_HTTPS_OTA_ABORT:
                ESP_LOGI("ota", "OTA abort");
                break;
        }
    }
}


static esp_err_t client_event_post_handler(esp_http_client_event_handle_t evt) {
    switch (evt->event_id) {
    case HTTP_EVENT_ERROR:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_ERROR");
        break;
    case HTTP_EVENT_REDIRECT:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_REDIRECT");
        break;


    case HTTP_EVENT_ON_CONNECTED:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_ON_CONNECTED");
        break;
    case HTTP_EVENT_HEADER_SENT:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_HEADER_SENT");
        break;
    case HTTP_EVENT_ON_HEADER:
        ESP_LOGI("HTTP_CLIENT", "Received Header %s: %s", evt->header_key, evt->header_value);
        break;
    case HTTP_EVENT_ON_DATA:
        if (!esp_http_client_is_chunked_response(evt->client)) {
            printf("HTTP_EVENT_ON_DATA: %.*s\n", evt->data_len, (char *)evt->data);
        }
        break;
    case HTTP_EVENT_ON_FINISH:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_ON_FINISH");
        break;
    case HTTP_EVENT_DISCONNECTED:
        ESP_LOGI("HTTP_CLIENT", "HTTP_EVENT_DISCONNECTED");
      
        break;
    }
    return ESP_OK;
}

// Example function to send a file in chunks
void post_file_in_chunks(const char *url, const char *file_path) {
    FILE *file = fopen(file_path, "rb");
    if (!file) {
        ESP_LOGE("FILE", "Failed to open file for reading");
        return;
    }

    // Initialize the HTTP client
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .event_handler = client_event_post_handler
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL) {
        ESP_LOGE("HTTP_CLIENT", "Failed to initialize HTTP client");
        fclose(file);
        return;
    }

    // Indicate that we want to send the data in chunks
    esp_http_client_set_header(client, "Content-Type", "application/octet-stream");
    esp_http_client_set_header(client, "Transfer-Encoding", "chunked");

    // Read and send the file in chunks
    char buffer[1024]; // Adjust the buffer size according to available memory
    int read_len;
    while ((read_len = fread(buffer, 1, sizeof(buffer), file)) > 0) {
        esp_http_client_write(client, buffer, read_len);
    }

    // Perform the HTTP POST
    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI("HTTP_CLIENT", "HTTP POST Status = %d, content_length = %lld",
                 esp_http_client_get_status_code(client),
                 esp_http_client_get_content_length(client));
    } else {
        ESP_LOGE("HTTP_CLIENT", "HTTP POST request failed: %s", esp_err_to_name(err));
    }

    // Clean up
    esp_http_client_cleanup(client);
    fclose(file);
}


esp_err_t do_firmware_upgrade(char *url_str){
    esp_http_client_config_t config = {
        .url = url_str,
        .cert_pem = NULL,
        .event_handler = ota_event_handler
    };
    esp_https_ota_config_t ota_config = {
        .http_config = &config,
    };
    esp_err_t ret = esp_https_ota(&ota_config);
    if (ret == ESP_OK) {
        esp_restart();
    } else {
        return ESP_FAIL;
    }
    return ESP_OK;
}