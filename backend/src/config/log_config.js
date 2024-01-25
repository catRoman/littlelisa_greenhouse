import {createWriteStream} from 'fs';
import {join } from 'path';
import {__root_dir} from './globals.js'

const logPath = join(__root_dir, "/backend/logs/data_logs.js");

const stream = createWriteStream(logPath, { flags: 'a'});

function logSentJSONData(sentData){
    const logEntry = `${new Date().toISOString()}=== Packet Received ===> ${sentData}\n`;

    stream.write(logEntry);
}
const closeJSONDataStream = () => {
    stream.end();
    console.log("JSON data log stream closed");
}
export { logSentJSONData, closeJSONDataStream};