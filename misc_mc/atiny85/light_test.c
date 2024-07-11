#include <stdint.h>

#include <util/delay.h>

#define F_CPU 8000000UL

#define REG_OFFSET 0x20
#define REG(x) (x + REG_OFFSET)

#define PORTB *(volatile unsigned char *)REG(0x18)
#define DDRB *(volatile unsigned char *)REG(0x17)
#define ADMUX *(volatile unsigned char *)REG(0x07)
#define ADCSRA *(volatile unsigned char *)REG(0x06)
#define ADCSRB *(volatile unsigned char *)REG(0x03)

#define ADCH *(volatile unsigned char *)REG(0x05)
#define ADCL *(volatile unsigned char *)REG(0x04)
#define DELAY 10000

int main()
{
    DDRB |= (1 << 1);              // Set pin 1 as output
    ADCSRA |= (1 << 7);            // enable adc
    ADMUX = 0x02;                  // Vcc as voltage ref, adc2 single ended input, right adjusted result
    ADCSRB = 0x00;                 // Free running mode
    ADCSRA |= (1 << 6) | (1 << 5); // Start ADC conversion and enabling Auto trigger

    while (1)
    {
        // start conversion
        int adc_l = ADCL;
        int trim_pot_value = (ADCH << 8) | adc_l;

        if (trim_pot_value > 512)
        {

            PORTB |= (1 << 1);
            _delay_ms(1000);
            // while (timer < DELAY)
            // {
            //     timer++;
            // }
            PORTB &= ~(1 << 1);
            _delay_ms(1000);
            // while (timer > 0)
            // {
            //     timer--;
            // }
        }
        else
        {
            PORTB |= (1 << 1);
        }
        ADCSRA |= (1 << 4); // interrupt flag
    }
}
