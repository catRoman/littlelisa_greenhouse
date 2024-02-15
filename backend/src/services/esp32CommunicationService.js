import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { logSentJSONData } from '../config/log_config.js';
import { format } from 'date-fns';

let sensorDataJSON;
// created a new port
const port = new SerialPort({
    path: '/dev/ttyACM0',
    baudRate: 115200
}, function(err){
  if (err){
    return console.log('Serial device not connected');
  }
});

const parser = port.pipe(new ReadlineParser({delimiter: '\r\n' }));

let currentDataPacket = '';

port.on('data', (data) => {
  currentDataPacket += data.toString();

  if (currentDataPacket.includes('}')) {
    sensorDataJSON = processJSONPacket(currentDataPacket);
    currentDataPacket = '';
  }
});

function processJSONPacket(packet) {
  // Your packet processing logic here
    const startSensorPacket = packet.indexOf('{');
    const endSensorPacket = packet.indexOf('}', startSensorPacket) + 1;

    const sensorDataJSON = JSON.parse(packet.substring(startSensorPacket, endSensorPacket));
   //console.log(JSON.stringify(sensorDataJSON));

    const sensorDataWithServerTimeJSON = {
      ...sensorDataJSON,
      serverTime : (new Date()).toLocaleString()
    };

   //console.log(sensorDataWithServerTimeJSON);
   // console.log(JSON.stringify(sensorDataWithServerTimeJSON));
    return sensorDataWithServerTimeJSON;
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
