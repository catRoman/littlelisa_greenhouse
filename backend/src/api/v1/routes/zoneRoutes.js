import { Router } from "express";
import zoneController from "../controllers/zoneController.js";
import validateParamId from "../middleware/validateParamId.js";
import sensorController from "../controllers/sensorController.js";
import noteRoutes from "../routes/noteRoutes.js";
import squareRoutes from "../routes/squareRoutes.js";
import eventLogController from "../controllers/eventLogController.js";
import squareController from "../controllers/squareController.js";

const router = Router({ mergeParams: true });

router.param("zoneId", validateParamId("zones"));

router.get("/", zoneController.getAllZones);
router.get("/:zoneId", zoneController.getZoneById);
router.get("/:zoneId/sensors/chart", sensorController.getZoneChartData);
router.get("/:zoneId/eventLog", eventLogController.getAllEventsByParentId);
router.use("/:zoneId/notes", noteRoutes);
router.put("/:zoneId/emptyAll", squareController.emptyAll);
router.use("/:zoneId/squares", squareRoutes);

export default router;
