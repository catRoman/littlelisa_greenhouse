import fetch from "node-fetch";
import EventEmitter from "events";
import config from "config";

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
      const camStream = await fetch(config.get('esp_cam.main_stream'));
      if (!camStream.ok) {
        throw new Error("cannot connect to cam stream....");
      }
      console.log("Connected to cam stream succesful");
  
      let currentChunk = Buffer.alloc(0);
  
      camStream.body.on("data", (chunk) => {
        camBuffer.update(chunk);
       
      });
    } catch (error) {
      console.log(error.message);
    }
  })();
  
  export default camBuffer;