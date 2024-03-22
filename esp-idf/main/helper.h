#include <stdint.h>

#ifndef HELPER_H_
#define HELPER_H_



char * binary_string( uint8_t decNum );
void trigger_panic(void);
void find_and_replace(char *str, char find, char replace);

#endif