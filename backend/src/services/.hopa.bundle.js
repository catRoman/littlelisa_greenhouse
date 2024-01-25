'use strict';

var serialport = require('serialport');
require('@serialport/parser-readline');

// created a new port
var port = new serialport.SerialPort({
  path: '/dev/ttyACM0',
  baudRate: 115200
});
var helloThere = function helloThere() {
  if (port.isOpen) console.log("Hello There, The port is open");else console.log("The port is still closed");
};
helloThere();
port.on('readable', function () {
  var rawString = JSON.stringify(port.read().toString('utf-8'));
  var sensorEntryString = rawString.substring(rawString.indexOf('{'));
  var sensorEntryObject = JSON.parse(sensorEntryString);
  console.log(sensorEntryString);
  console.log(sensorEntryObject);
});

//const parser = port.pipe(new ReadlineParser({}));
//ReadlineParser.on('data', console.log);
