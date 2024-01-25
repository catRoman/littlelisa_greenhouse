import  * as WebServer from './src/config/express_webServer.js';
import { connectToDatabase } from './src/config/pgresql_database.js'
import express from 'express';

async function startServers(){
    try {
        const webApp = express();
        console.log(WebServer.__dirname);
        await connectToDatabase();
        console.log("Connected successfully to database");

        webApp.listen(WebServer.PORT, WebServer.SERVER_IP, () => {
            console.log(`Server is running at localhost:${WebServer.PORT}`)
        });

        //webApp.use(express.static(WebServer.__dirname + '/frontend/public'));
    } catch (error){
        console.error('Error starting servers->:', error);
    }
}

//starting app servers
startServers();