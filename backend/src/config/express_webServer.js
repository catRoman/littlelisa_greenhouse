import express from 'express';
import {join } from 'path'
import { Web_Config_g, __root_dir } from './globals.js';
import {sensorDataJSON } from '../services/esp32CommunicationService.js';
import { logSentJSONData } from './log_config.js';

function startWebServer(){
    const webApp = express();

    // middleware for static pages
    webApp.use('/', express.static(join(__root_dir + "/frontend/public/dice")));
    webApp.use('/esp', express.static(join(__root_dir + "/frontend/public/esp")));

    webApp.get('/api/dhtData.json', (req, res) => {
        try{
            if(sensorDataJSON === undefined){
                throw new Error('sensor data received undefined');
            }

            res.json(sensorDataJSON);
            logSentJSONData(JSON.stringify(sensorDataJSON));
        }catch(error){
            console.error("U oh ===>", error.message);
        }
    });

    return webApp;
}


export {
    startWebServer,
    };