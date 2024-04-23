import express from "express";
import { join } from "path";
import { Web_Config_g, __root_dir } from "./globals.js";
import { sensorDataJSON } from "../services/esp32CommunicationService.js";
import { logSentJSONData } from "./log_config.js";
import path from "path";

function startWebServer() {
  const webApp = express();

  // middleware for static pages
  //webApp.use('/', express.static(join(__root_dir + "/frontend/public/dice")));
  //webApp.use("/", express.static(path.join(__root_dir, "backend/public_test")));
  webApp.use("/", express.static("public_test"));
  //webApp.use("/esp", express.static(join(__root_dir + "/frontend/public/esp")));

  webApp.get("/api/dhtData.json", (req, res) => {
    try {
      if (sensorDataJSON === undefined) {
        throw new Error("sensor data received undefined");
      }

      res.json(sensorDataJSON);
      logSentJSONData(JSON.stringify(sensorDataJSON));
    } catch (error) {
      console.error("Uh oh ===>", error.message);
    }
  });

  //recieve sensor json from esp
  webApp.post("/api/sensorStream", (req, res) => {
    try {
      if (!res.ok) {
        throw new Error("failed to recieve sensor stream post");
      }

      console.log(req.body);
      res.send("Sensor stream post successful");
    } catch (error) {
      console.log("there was an error with /api/sensorstream ->", error);
    }
  });

  return webApp;
}

export { startWebServer };
