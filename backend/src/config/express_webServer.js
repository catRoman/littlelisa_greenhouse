import  express  from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import  fs  from 'fs';


const PORT = 3000;
const public_dir_relAddr = "../../../frontend/public";
const SERVER_IP = '10.0.0.204';
const __dirname = import.meta.url;

const app = express();


function setupWebServer() {

    try{

        console.log(__dirname);
       // app.use(express.static(__dirname + '/frontend/public'));


    }catch (error){
        console.error("Cannot load static pages=>:", error);
    }
}

export {
    setupWebServer,
    PORT,
    SERVER_IP,
    app,
    __dirname
    };
