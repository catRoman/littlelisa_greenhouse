#include <stdint.h>

#define REG_OFFSET 0x20
#define REG(x) (x + REG_OFFSET)

#define PORTB *(volatile unsigned char *)REG(0x18)
#define DDRB *(volatile unsigned char *)REG(0x17)
// ADC registers
#define ADMUX *(volatile unsigned char *)REG(0x07)
#define ADCSRA *(volatile unsigned char *)REG(0x06)
#define ADCSRB *(volatile unsigned char *)REG(0x03)
#define ADCH *(volatile unsigned char *)REG(0x05)
#define ADCL *(volatile unsigned char *)REG(0x04)
// Timer Refgisters
// timer 0
#define TCCR0A *(volatile unsigned char *)REG(0x2A)
#define TCCR0B *(volatile unsigned char *)REG(0x33)
#define TIFR *(volatile unsigned char *)REG(0x38)
#define TCNT0 *(volatile unsigned char *)REG(0x32)
// for pwm
#define OCR0A *(volatile unsigned char *)REG(0x29)
#define OCR0B *(volatile unsigned char *)REG(0x28)

int main()
{

    // Set pin 1 as output

    DDRB |= (1 << 1);
    // adc
    ADCSRA |= (1 << 7);            // enable adc
    ADMUX = 0x02;                  // Vcc as voltage ref, adc2 single ended input, right adjusted result
    ADCSRB = 0x00;                 // Free running mode
    ADCSRA |= (1 << 6) | (1 << 5); // Start ADC conversion and enabling Auto trigger
    // timer-pwm

    TCCR0A = 0x51; // fast pwm mode, non-inverting mode
    TCCR0B = 0x00; // ensure timer stoped
    TCCR0B = 0x09;
    TCNT0 = 0x00; // clear timer counter
    OCR0A = 255;
    while (1)
    {
        // start conversion
        uint16_t adc_l = ADCL;
        uint16_t adc_h = ADCH;
        uint16_t trim_pot_value = (adc_h << 8) | adc_l;

        OCR0B = trim_pot_value / 4;

        ADCSRA |= (1 << 4); // interrupt flag
    }
}
