import   {startWebServer}  from './src/api/v1/services/init/expressServer.js';
import { connectToDatabase} from './src/api/v1/services/init/dbConnect.js';
import './config/globals.js'

console.log('Global __basedir set to:', global.__basedir);

function startServers() {

  try {
    connectToDatabase();
    startWebServer();
  
  } catch (error) {
    console.error("Uh Oh ==>: ", error);
  }
}

startServers();
