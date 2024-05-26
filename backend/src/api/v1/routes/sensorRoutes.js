import { Router } from "express";
import sensorController from "../controllers/sensorController.js";
import validateParamId from "../middleware/validateParamId.js";

const router = Router({ mergeParams: true });

router.param("sensorId", validateParamId("sensors"));

router.get("/:sensorId/chart", sensorController.getChartData);
router.get("/chart", sensorController.getGreenhouseChartData);
router.post("/sensorStream", sensorController.sensorDataStream);

export default router;
