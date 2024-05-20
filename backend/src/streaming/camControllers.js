import camBuffer from './camBufferService.js';



export function camStream(req, res) {
   
    try {
      res.statusCode = 200;
      res.setHeader(
        "Content-type",
        "multipart/x-mixed-replace; boundary=--123456789000000000000987654321"
      );
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Access-Control-Allow-Origin", "*");
   

      const onData = (buff) => {
     
        res.write(buff);
      };

      camBuffer.on("updated", onData);

      req.on("close", () => {
        camBuffer.removeListener("update", onData);
        res.end();
      });
    } catch (error) {
      console.log(error.message);
    }
  }