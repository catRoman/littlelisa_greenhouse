import express, { json, urlencoded } from "express";
import config from "config";
import helmet from "helmet";

import camRoutes from "../../../../streaming/camRoutes.js";
import sensorDataRoutes from "../../routes/sensorDataRoutes.js";
import userRoutes from "../../routes/userRoutes.js";

export function startWebServer() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.use("/", express.static("public"));
  app.use("/api/cam", camRoutes);

  app.use("/api", sensorDataRoutes);
  app.use("/api", userRoutes);

  app.use((err, req, res, next) => {
    //console.error("Error stack:", err.stack);
    res.status(err.status || 500).json({ error: err.message });
  });

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
