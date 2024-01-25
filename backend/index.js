import  * as WebServer from './src/config/express_webServer.js';
import { connectToDatabase } from './src/config/pgresql_database.js'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

    async function startServers(){
    try {

        await connectToDatabase();
        console.log("Connected successfully to database...");

        WebServer.setupWebServer();
        console.log("Webserver successfully running...");

    } catch (error){
        console.error('Error starting servers->:', error);
    }
}

//starting app servers
startServers();