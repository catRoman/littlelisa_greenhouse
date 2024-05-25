import { Router } from "express";
import sensorController from "../controllers/sensorController.js";

const router = Router({ mergeParams: true });

router.get("/:sensorId/chart", sensorController.getChartData);
router.get("/chart", sensorController.getGreenhouseChartData);
router.post("/sensorStream", sensorController.sensorDataStream);

export default router;
