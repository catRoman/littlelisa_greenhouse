#ifndef NETWORKING_HTTP_CLIENT_H
#define NETWORKING_HTTP_CLIENT_H

void post_file_in_chunks(const char *url, const char *file_path);
esp_err_t do_firmware_upgrade(char *url_str);
void http_client_get_test(char *url);
void http_test_task(void *args);
#endif /*NETWORKING_HTTP_CLIENT_H*/