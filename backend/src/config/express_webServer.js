import express from 'express';

const PORT = 3000;
const SERVER_IP = '10.0.0.204';

function setupWebServer() {
    const webApp = express();


    webApp.use(express.static('./config'));
    console.log("Static Pages loaded...");

    webApp.listen(PORT, SERVER_IP, () => {
        console.log(`Server is running at localhost:${PORT}`);
    });

    webApp.on('error', (err) => {
        console.error('Web server error:', err);
    });

}

export {
    setupWebServer,
    PORT,
    SERVER_IP,
    };
