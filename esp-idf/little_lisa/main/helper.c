#include <string.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "helper.h"

#define INITIAL_CAPACITY 10

char *binary_string(uint8_t decNum)
{
    char *binaryString = malloc(sizeof(char) * 11);
    char *bitString = malloc(sizeof(char) * 9);

    int k = 8;
    for (unsigned int i = 0; i <= 8; i++)
    {
        bitString[--k] = (((decNum >> i) & 1) ? '1' : '0');
    }
    bitString[8] = '\0';
    binaryString[0] = '0';
    binaryString[1] = 'b';
    binaryString[2] = '\0';

    strcat(binaryString, bitString);

    return binaryString;
}
void shiftOut595N(uint8_t data, int8_t ser_pin, int8_t srclk_pin, int8_t rclk_pin)
{
    for (int i = 0; i < 8; i++)
    {
        // Set data pin to the value of the most significant bit
        uint8_t bit_val = (data & (1 << (7 - i))) >> (7 - i);
        // ESP_LOGI("shiftOut", "Bit %d: %d", i, bit_val);
        gpio_set_level(ser_pin, bit_val);
        // Pulse the clock pin
        gpio_set_level(srclk_pin, 1);
        vTaskDelay(1); // Short delay
        gpio_set_level(srclk_pin, 0);
    }
    // Update the latches to reflect the new data
    gpio_set_level(rclk_pin, 1);
    vTaskDelay(1); // Short delay
    gpio_set_level(rclk_pin, 0);
    gpio_set_level(ser_pin, 0);
}

void trigger_panic()
{
    // Access an invalid memory address
    volatile int *ptr = (volatile int *)0xdeadbeef;
    *ptr = 0x12345678; // This will cause a segmentation fault and trigger a panic
}

void find_and_replace(char *str, char find, char replace)
{
    while (*str)
    {
        if (*str == find)
        {
            *str = replace;
        }
        str++;
    }
}

// Function to initialize a new list
List *list_create()
{
    List *list = (List *)malloc(sizeof(List));
    if (list == NULL)
    {
        return NULL; // Memory allocation failed
    }
    list->items = (int *)malloc(sizeof(int) * INITIAL_CAPACITY);
    if (list->items == NULL)
    {
        free(list);
        list = NULL;
        return NULL; // Memory allocation failed
    }
    list->size = 0;
    list->capacity = INITIAL_CAPACITY;
    return list;
}

// Function to append an item to the list
void list_append(List *list, int item)
{
    if (list->size >= list->capacity)
    {
        // Resize the list
        list->capacity *= 2;
        list->items = (int *)realloc(list->items, sizeof(int) * list->capacity);
        if (list->items == NULL)
        {
            // Memory reallocation failed
            fprintf(stderr, "Memory reallocation failed\n");
            exit(EXIT_FAILURE);
        }
    }
    list->items[list->size++] = item;
}

// Function to search for an item in the list
int list_search(List *list, int target)
{
    for (int i = 0; i < list->size; i++)
    {
        if (list->items[i] == target)
        {
            return i; // Item found, return its index
        }
    }
    return -1; // Item not found
}

// Function to remove an item from the list
void list_remove(List *list, int index)
{
    if (index < 0 || index >= list->size)
    {
        fprintf(stderr, "Invalid index for removal\n");
        return;
    }
    // Shift items after the removed item to the left
    for (int i = index; i < list->size - 1; i++)
    {
        list->items[i] = list->items[i + 1];
    }
    list->size--;
}

// Function to free the memory allocated for the list
void list_destroy(List *list)
{
    free(list->items);
    list->items = NULL;
    free(list);
    list = NULL;
}
//  // This example demonstrates how a human readable table of run time stats
//  // information is generated from raw data provided by uxTaskGetSystemState().
//  // The human readable table is written to pcWriteBuffer
//  void vTaskGetRunTimeStats( char *pcWriteBuffer )
//  {
//  TaskStatus_t *pxTaskStatusArray;
//  volatile UBaseType_t uxArraySize, x;
//  configRUN_TIME_COUNTER_TYPE ulTotalRunTime, ulStatsAsPercentage;

// // Make sure the write buffer does not contain a string.
// pcWriteBuffer = 0x00;

// // Take a snapshot of the number of tasks in case it changes while this
// // function is executing.
//      uxArraySize = uxTaskGetNumberOfTasks();

// // Allocate a TaskStatus_t structure for each task.  An array could be
// // allocated statically at compile time.
//      pxTaskStatusArray = pvPortMalloc( uxArraySize * sizeof( TaskStatus_t ) );

// if( pxTaskStatusArray != NULL )
//      {
// // Generate raw status information about each task.
//          uxArraySize = uxTaskGetSystemState( pxTaskStatusArray, uxArraySize, &ulTotalRunTime );

// // For percentage calculations.
//          ulTotalRunTime /= 100UL;

// // Avoid divide by zero errors.
// if( ulTotalRunTime > 0 )
//          {
// // For each populated position in the pxTaskStatusArray array,
// // format the raw data as human readable ASCII data
// for( x = 0; x < uxArraySize; x++ )
//              {
// // What percentage of the total run time has the task used?
// // This will always be rounded down to the nearest integer.
// // ulTotalRunTimeDiv100 has already been divided by 100.
//                  ulStatsAsPercentage = pxTaskStatusArray[ x ].ulRunTimeCounter / ulTotalRunTime;

// if( ulStatsAsPercentage > 0UL )
//                  {
//                      sprintf( pcWriteBuffer, "%s\t\t%lu\t\t%lu%%\r\n", pxTaskStatusArray[ x ].pcTaskName, pxTaskStatusArray[ x ].ulRunTimeCounter, ulStatsAsPercentage );
//                  }
// else
//                  {
// // If the percentage is zero here then the task has
// // consumed less than 1% of the total run time.
//                      sprintf( pcWriteBuffer, "%s\t\t%lu\t\t<1%%\r\n", pxTaskStatusArray[ x ].pcTaskName, pxTaskStatusArray[ x ].ulRunTimeCounter );
//                  }

//                  pcWriteBuffer += strlen( ( char * ) pcWriteBuffer );
//              }
//          }

// // The array is no longer needed, free the memory it consumes.
//          vPortFree( pxTaskStatusArray );
//      }
//  }