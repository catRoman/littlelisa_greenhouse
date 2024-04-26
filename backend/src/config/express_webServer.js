import express from "express";
import { join } from "path";
import { Web_Config_g, __root_dir } from "./globals.js";
import { handleSensorData } from "./pgresql_database.js";

import path from "path";

function startWebServer() {
  const webApp = express();

  webApp.use(express.json());

  // middleware for static pages
  //webApp.use('/', express.static(join(__root_dir + "/frontend/public/dice")));
  //webApp.use("/", express.static(path.join(__root_dir, "backend/public_test")));
  webApp.use("/", express.static("public_test"));
  //webApp.use("/esp", express.static(join(__root_dir + "/frontend/public/esp")));

  //recieve sensor json from esp
  webApp.post("/api/sensorStream", async (req, res) => {
    try {
      const sensorData = req.body;
      // debug logging incoming sensor data
      //console.log(sensorData);
      handleSensorData(sensorData);

      if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error("No data received in sensor stream post");
      }

      res.status(200).send("Sensor stream post successful");
    } catch (error) {
      console.log("There was an error with /api/sensorStream ->", error);

      res
        .status(500)
        .send("Error processing sensor stream post: " + error.message);
    }
  });

  return webApp;
}

export { startWebServer };
