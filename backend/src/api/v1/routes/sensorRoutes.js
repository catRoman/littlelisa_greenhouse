import { Router } from "express";
import sensorController from "../controllers/sensorController.js";

const router = Router();
router.get("/:sensorId/chart", sensorController.getChartData);
router.post("/sensorStream", sensorController.sensorDataStream);

export default router;
