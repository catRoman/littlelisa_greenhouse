#include <string.h>
#include <stdint.h>

#include "helper.h"

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