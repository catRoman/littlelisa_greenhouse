#include <string.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "helper.h"

#define INITIAL_CAPACITY 10

char * binary_string( uint8_t decNum )
{
    char * binaryString = malloc(sizeof(char)*11);
    char * bitString= malloc(sizeof(char)*9);

    int k = 8;
    for(unsigned int i = 0; i <=8; i++){
        bitString[--k] = (((decNum >> i) & 1) ? '1' : '0');
    }
    bitString[8]='\0';
    binaryString[0] = '0';
    binaryString[1]='b';
    binaryString[2]='\0';

    strcat(binaryString, bitString);


    return binaryString;
}

void trigger_panic() {
    // Access an invalid memory address
    volatile int *ptr = (volatile int *)0xdeadbeef;
    *ptr = 0x12345678;  // This will cause a segmentation fault and trigger a panic
}

void find_and_replace(char *str, char find, char replace) {
    while (*str) {
        if (*str == find) {
            *str = replace;
        }
        str++;
    }
}








// Function to initialize a new list
List *list_create() {
    List *list = (List *)malloc(sizeof(List));
    if (list == NULL) {
        return NULL; // Memory allocation failed
    }
    list->items = (int *)malloc(sizeof(int) * INITIAL_CAPACITY);
    if (list->items == NULL) {
        free(list);
        return NULL; // Memory allocation failed
    }
    list->size = 0;
    list->capacity = INITIAL_CAPACITY;
    return list;
}

// Function to append an item to the list
void list_append(List *list, int item) {
    if (list->size >= list->capacity) {
        // Resize the list
        list->capacity *= 2;
        list->items = (int *)realloc(list->items, sizeof(int) * list->capacity);
        if (list->items == NULL) {
            // Memory reallocation failed
            fprintf(stderr, "Memory reallocation failed\n");
            exit(EXIT_FAILURE);
        }
    }
    list->items[list->size++] = item;
}

// Function to search for an item in the list
int list_search(List *list, int target) {
    for (int i = 0; i < list->size; i++) {
        if (list->items[i] == target) {
            return i; // Item found, return its index
        }
    }
    return -1; // Item not found
}

// Function to remove an item from the list
void list_remove(List *list, int index) {
    if (index < 0 || index >= list->size) {
        fprintf(stderr, "Invalid index for removal\n");
        return;
    }
    // Shift items after the removed item to the left
    for (int i = index; i < list->size - 1; i++) {
        list->items[i] = list->items[i + 1];
    }
    list->size--;
}

// Function to free the memory allocated for the list
void list_destroy(List *list) {
    free(list->items);
    free(list);
}
