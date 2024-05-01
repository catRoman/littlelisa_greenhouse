import express from "express";
import fetch from "node-fetch";
import EventEmitter from "events";
import { Readable } from "stream";
import { join } from "path";
import { Web_Config_g, __root_dir } from "./globals.js";
import { MjpegProxy } from "mjpeg-proxy";

import path from "path";

//=======================================
// buffer for esp cam stream
//=================================

class CamBuffer extends EventEmitter {
  constructor(initialData) {
    super();
    this.buffer = Buffer.from(initialData);
  }

  // Method to update the buffer
  update(newData) {
    this.buffer = newData;
    this.emit("updated", this.buffer);
  }

  // Method to get the buffer
  getBuffer() {
    return this.buffer;
  }
}

const camBuffer = new CamBuffer(Buffer.alloc(0));

(async () => {
  console.log("trying cam stream connection");
  try {
    const camStream = await fetch("http://10.0.0.249/camStream");
    if (!camStream.ok) {
      throw new Error("cannot connect to cam stream....");
    }
    console.log("Connected to cam stream succesful");

    let currentChunk = Buffer.alloc(0);

    camStream.body.on("data", (chunk) => {
      //assuming jpegStream in binary
      //console.log(chunk);

      currentChunk = Buffer.concat([currentChunk, chunk]);

      const jpegStartMarker = Buffer.from([0xff, 0xd8]);
      const jpegEndMarker = Buffer.from([0xff, 0xd9]);

      let jpegEndImageIndex = currentChunk.indexOf(jpegEndMarker);
      while (jpegEndImageIndex !== -1) {
        let jpegStartImageIndex = currentChunk.indexOf(jpegStartMarker);
        if (
          jpegStartImageIndex !== -1 &&
          jpegStartImageIndex < jpegEndImageIndex
        ) {
          camBuffer.update(
            currentChunk.subarray(
              jpegStartImageIndex /*+ jpegStartMarker.byteLength*/,
              jpegEndImageIndex
            )
          );

          //console.log(currentImage);
        }
        currentChunk = currentChunk.subarray(
          jpegEndImageIndex + jpegEndMarker.byteLength
        );
        jpegEndImageIndex = currentChunk.indexOf(jpegEndMarker);
      }

      //console.log(currentChunk.toString("hex"));
      //console.log(`chunk sent to buffer-> Chunk Length: ${chunk.length}`);
      //console.log(`New buffer size: length-> ${camBuffer.length}`);
    });
  } catch (error) {
    console.log(error.message);
  }
})();

// camBuffer.on("updated", () => {
//   console.log("buffer Updated");
// });
//===============================\

export function startWebServer() {
  const webApp = express();

  webApp.use(express.json());

  // middleware for static pages
  //webApp.use('/', express.static(join(__root_dir + "/frontend/public/dice")));
  //webApp.use("/", express.static(path.join(__root_dir, "backend/public_test")));
  webApp.use("/", express.static("public_test"));
  //webApp.use("/esp", express.static(join(__root_dir + "/frontend/public/esp")));
  webApp.get("/camStream", (req, res) => {
    try {
      res.statusCode = 200;
      res.setHeader(
        "Content-type",
        "multipart/x-mixed-replace; boundary=--hotdogs"
      );
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Access-Control-Allow-Origin", "*");
      //console.log(req);

      const onData = (buff) => {
        res.write("--hotdogs\r\n");
        res.write("Content-Type: image/jpeg\r\n\r\n");
        res.write(buff, "binary");
        res.write("\r\n");
      };

      camBuffer.on("updated", onData);

      req.on("close", () => {
        camBuffer.removeListener("update", onData);
        res.end();
      });
    } catch (error) {
      console.log(error.message);
    }
  });
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
