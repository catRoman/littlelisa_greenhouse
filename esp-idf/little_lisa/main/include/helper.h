#include <stdint.h>

#ifndef MAIN_HELPER_H_
#define MAIN_HELPER_H_

typedef struct {
    int *items;
    int size;
    int capacity;
} List;

char * binary_string( uint8_t decNum );
void trigger_panic(void);
void find_and_replace(char *str, char find, char replace);

//list implemntation for integers
List *list_create();
void list_append(List *list, int item);
int list_search(List *list, int target);
void list_remove(List *list, int index);
void list_destroy(List *list);


//  void vTaskGetRunTimeStats( char *pcWriteBuffer );
#endif