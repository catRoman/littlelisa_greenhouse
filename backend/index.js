import { startWebServer } from './src/config/express_webServer.js'
import { connectToDatabase } from './src/config/pgresql_database.js'
import { Web_Config_g, __root_dir } from './src/config/globals.js';
function startServers(){

    try{
        connectToDatabase();
        console.log("Connection Successful");

        console.log(__root_dir);

        const webApp = startWebServer();

        webApp.listen(Web_Config_g.PORT, Web_Config_g.SERVER_IP, ()=> {
            console.log(`Server is running at ${Web_Config_g.SERVER_IP}:${Web_Config_g.PORT}`);
        });
    }catch(error){
        console.error("Uh Oh ==>: ", error);
    }
}

startServers();