import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// created a new port
const port = new SerialPort({ 
    path: '/dev/ttyACM0',
    baudRate: 115200
});

const parser = port.pipe(new ReadlineParser({delimiter: '\r\n' }));

port.on('readable', () => {
        console.log(`START===============${port.readableLength}`);

        let rawSerialBuffer = port.read();
        setTimeout (() => {
        handleSensorData(parseBufferForJSON(rawSerialBuffer.toString('utf-8')));
}, 100);
    });

            console.log("END==============");

const parseBufferForJSON = (stringToParse) => {
    
    return stringToParse;
}

const handleSensorData = (jsonString) => {
    console.log(jsonString);
}




