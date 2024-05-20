import   {startWebServer}  from './src/init/expressServer.js';
import { connectToDatabase} from './src/init/dbConnect.js';

function startServers() {
  try {
    connectToDatabase();
    startWebServer();
  
  } catch (error) {
    console.error("Uh Oh ==>: ", error);
  }
}

startServers();
