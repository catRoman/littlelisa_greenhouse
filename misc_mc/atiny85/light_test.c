#include <stdint.h>

#define PORTB *(volatile unsigned char *)0x38
#define DDRB *(volatile unsigned char *)0x37
#define DELAY 10000
int main()
{
    DDRB |= (1 << 0); // Set pin 1 as output
    volatile int timer = 0;
    while (1)
    {
        PORTB |= (1 << 0);
        while (timer < DELAY)
        {
            timer++;
        }
        PORTB &= ~(1 << 0);
        while (timer > 0)
        {
            timer--;
        }
    }
}
