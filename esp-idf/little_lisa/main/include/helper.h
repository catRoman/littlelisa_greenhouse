#include <stdint.h>

#ifndef MAIN_HELPER_H_
#define MAIN_HELPER_H_

<<<<<<< HEAD
typedef struct {
=======
typedef struct
{
>>>>>>> landing_page
    int *items;
    int size;
    int capacity;
} List;

<<<<<<< HEAD
char * binary_string( uint8_t decNum );
void trigger_panic(void);
void find_and_replace(char *str, char find, char replace);

//list implemntation for integers
=======
void shiftOut595N(uint8_t data, int8_t ser_pin, int8_t srclk_pin, int8_t rclk_pin);
char *binary_string(uint8_t decNum);
void trigger_panic(void);
void find_and_replace(char *str, char find, char replace);

// list implemntation for integers
>>>>>>> landing_page
List *list_create();
void list_append(List *list, int item);
int list_search(List *list, int target);
void list_remove(List *list, int index);
void list_destroy(List *list);

<<<<<<< HEAD

=======
>>>>>>> landing_page
//  void vTaskGetRunTimeStats( char *pcWriteBuffer );
#endif