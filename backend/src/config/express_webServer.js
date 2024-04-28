import express from "express";
import { join } from "path";
import { Web_Config_g, __root_dir } from "./globals.js";
import { MjpegProxy } from "mjpeg-proxy";


import path from "path";


function startWebServer() {
  const webApp = express();

  webApp.use(express.json());

  // middleware for static pages
  //webApp.use('/', express.static(join(__root_dir + "/frontend/public/dice")));
  //webApp.use("/", express.static(path.join(__root_dir, "backend/public_test")));
  webApp.use("/", express.static("public_test"));
  //webApp.use("/esp", express.static(join(__root_dir + "/frontend/public/esp")));
  webApp.get('/camStream', new MjpegProxy('http://10.0.0.249/camStream').proxyRequest);
  //recieve sensor json from esp
  webApp.post("/api/sensorStream", (req, res) => {
    try {
      // Log the incoming request body to see what's being received
      console.log(req.body);

      // Check if the request body is empty (assuming you expect data)
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error("No data received in sensor stream post");
      }

      // Send a successful response back to the client
      res.status(200).send("Sensor stream post successful");
    } catch (error) {
      console.log("There was an error with /api/sensorStream ->", error);

      // Respond with an error message and appropriate HTTP status code
      res
        .status(500)
        .send("Error processing sensor stream post: " + error.message);
    }
  });

  return webApp;
}

export { startWebServer };
