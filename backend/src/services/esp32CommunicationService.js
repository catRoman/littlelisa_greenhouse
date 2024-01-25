import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { logSentJSONData } from '../config/log_config.js';

let sensorDataJSON;
// created a new port
const port = new SerialPort({
    path: '/dev/ttyACM0',
    baudRate: 115200
});

const parser = port.pipe(new ReadlineParser({delimiter: '\r\n' }));

let currentDataPacket = '';

port.on('data', (data) => {
  currentDataPacket += data.toString();

  if (currentDataPacket.includes('}')) {
    sensorDataJSON =processJSONPacket(currentDataPacket);
    currentDataPacket = '';
  }
});

function processJSONPacket(packet) {
  // Your packet processing logic here
    const startSensorPacket = packet.indexOf('{');
    const endSensorPacket = packet.indexOf('}', startSensorPacket) + 1;

    const sensorDataJson = JSON.parse(packet.substring(startSensorPacket, endSensorPacket));


    return sensorDataJson;
}

const parseBufferForJSON = (stringToParse) => {
    return stringToParse;
}


const handleSensorData = (jsonString) => {
    let testArr = [];
    testArr.push(jsonString);
    return testArr;
}

export { sensorDataJSON };
