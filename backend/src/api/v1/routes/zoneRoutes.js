import { Router } from "express";
import zoneController from "../controllers/zoneController.js";
import validateParamId from "../middleware/validateParamId.js";
import sensorController from "../controllers/sensorController.js";

const router = Router({ mergeParams: true });

router.param("zoneId", validateParamId("zones"));

router.get("/", zoneController.getAllZones);
router.get("/:zoneId", zoneController.getZoneById);
router.get("/:zoneId/sensors/chart", sensorController.getZoneChartData);

export default router;
