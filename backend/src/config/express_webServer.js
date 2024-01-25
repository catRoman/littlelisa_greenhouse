import express from 'express';
import {join } from 'path'
import { Web_Config_g, __root_dir } from './globals.js';


function startWebServer(){
    const webApp = express();

    // middleware for static pages
    webApp.use(express.static(join(__root_dir + "/frontend/public")));

    return webApp;
}

export {
    startWebServer,
    };