import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// created a new port
const port = new SerialPort({ 
    path: '/dev/ttyACM0',
    baudRate: 115200
});



const helloThere = () => {
    if(port.isOpen)
        console.log("Hello There, The port is open");
    else
        console.log("The port is still closed");
};

helloThere(); 

port.on('readable', () => {
    
    let rawString =JSON.stringify(port.read().toString('utf-8'));
    let sensorEntryString = rawString.substring(rawString.indexOf('{'));
    let sensorEntryObject = JSON.parse(sensorEntryString);

    
    console.log(sensorEntryString);
    console.log(sensorEntryObject);
});

//const parser = port.pipe(new ReadlineParser({}));
//ReadlineParser.on('data', console.log);




