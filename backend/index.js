
import { startWebServer } from './src/config/express_webServer.js'
import { connectToDatabase } from './src/config/pgresql_database.js'
import { Web_Config_g, __root_dir } from './src/config/globals.js';
import { logSentJSONData, closeJSONDataStream } from './src/config/log_config.js';


function startServers(){

    try{
        connectToDatabase();
        console.log("Connection Successful");

        console.log(__root_dir);

        const webApp = startWebServer();

        const server = webApp.listen(Web_Config_g.PORT, Web_Config_g.SERVER_IP, ()=> {
            console.log(`Server is running at ${Web_Config_g.SERVER_IP}:${Web_Config_g.PORT}`);
        });

          process.on('SIGINT', () => {
            console.log('Closing the web server...');
            server.close(() => {
              console.log('Server closed.');
            });

            closeJSONDataStream();
            process.exit();
        });
    }catch(error){
        console.error("Uh Oh ==>: ", error);
    }

}


startServers();