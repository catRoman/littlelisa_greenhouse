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
    esp_log_level_set("HTTP_CLIENT", ESP_LOG_DEBUG);
    FILE *file = fopen(file_path, "rb");
    if (!file) {
        ESP_LOGE("FILE", "Failed to open file for reading");
        return;
    }

    // Seek to the end of the file to determine the size
    fseek(file, 0, SEEK_END);
    size_t file_size = ftell(file);
    ESP_LOGI("HTTP_CLIENT", "Size of the file is %zu bytes", file_size);


    // Rewind to the beginning of the file
    fseek(file, 0, SEEK_SET);


    // Initialize the HTTP client
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .event_handler = client_event_post_handler,
        .timeout_ms = 100000,
        .keep_alive_enable = true,
        .skip_cert_common_name_check = true,
        .cert_pem = NULL,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL) {
        ESP_LOGE("HTTP_CLIENT", "Failed to initialize HTTP client");
        fclose(file);
        return;
    }

    // Set headers for chunked transfer
    esp_http_client_set_header(client, "Content-Type", "application/octet-stream");
    //esp_http_client_set_header(client, "Transfer-Encoding", "chunked");

    // Read and send the file in chunks
    char buffer[2048]; // Adjust the buffer size according to available memory
    int read_len;
    int total = 0;

esp_err_t ret = esp_http_client_open(client, file_size);
if(ret != ESP_OK){
    ESP_LOGE("HTTP_CLIENT", "error http client open");
    return;
}

    while ((read_len = fread(buffer, 1, sizeof(buffer), file)) > 0) {
        if (esp_http_client_write(client, buffer, read_len) < 0) {
            ESP_LOGE("HTTP_CLIENT", "Failed to send data chunk");
            break; // Exit loop on failure
        }
        total += read_len;
        ESP_LOGI("OTA_NODE_SEND", "%d bytes", total);
        ESP_LOGD("OTA_NODE_SEND", "Minimum heap free: %lu bytes\n",esp_get_free_heap_size());
 ESP_LOGD("OTA_NODE_SEND", "Minimum stack free for this task: %u words\n", uxTaskGetStackHighWaterMark(NULL));

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



void http_client_get_test(char *url){
    esp_log_level_set("HTTP_CLIENT", ESP_LOG_DEBUG);
  esp_http_client_config_t config = {
        .url = url,  // Set the initial URL/URI
        .method = HTTP_METHOD_GET,            // Define the method
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);

    if (client == NULL) {
        ESP_LOGE("HTTP_CLIENT", "Failed to initialise HTTP connection");
    } else {
        // Perform HTTP request as needed...
        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK) {
            ESP_LOGI("HTTP_CLIENT", "HTTP GET Status = %d, content_length = %d",
                     (int)esp_http_client_get_status_code(client),
                     (int)esp_http_client_get_content_length(client));
        } else {
            ESP_LOGE("HTTP_CLIENT", "HTTP GET request failed: %s", esp_err_to_name(err));
        }

        // Cleanup
        esp_http_client_cleanup(client);
    }




}
