import express, { json, urlencoded } from "express";
import config from "config";
import helmet from "helmet";

import camRoutes from "../../../../streaming/camRoutes.js";
import sensorDataRoutes from "../../routes/sensorDataRoutes.js";
import userRoutes from "../../routes/userRoutes.js"

export function startWebServer() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(json());
  app.use(urlencoded());

  // Serve static files
  app.use("/", express.static("public"));

  // Use the streaming routes with the /api prefix
  app.use("/api/cam", camRoutes);

  // Use the sensor routes with the /api prefix
  // app.use('/api/data', sensorDataRoutes);
  app.use("/api", sensorDataRoutes);
  app.use("/api", userRoutes);

  const PORT = config.get("web.port");
  const SERVER_IP = config.get("web.serverIp");
  const server = app.listen(PORT, SERVER_IP, () => {
    console.log(`Server is running at http://${SERVER_IP}:${PORT}`);
  });

  server.keepAliveTimeout = 35000;

  process.on("SIGINT", () => {
    console.log("Closing the web server...");
    server.close(() => {
      console.log("Server closed.");
    });

    process.exit();
  });

  return app;
}
