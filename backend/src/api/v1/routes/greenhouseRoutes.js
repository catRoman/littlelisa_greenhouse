import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js";
import envStateController from "../controllers/envStateController.js";
import eventLogController from "../controllers/eventLogController.js";
import zoneRoutes from "./zoneRoutes.js";
import validateParamId from "../middleware/validateParamId.js";
import sensorRoutes from "./sensorRoutes.js";
import noteRoutes from "../routes/noteRoutes.js";
import squareRoutes from "../routes/squareRoutes.js";
import squareController from "../controllers/squareController.js";
import nodeController from "../controllers/nodeController.js";
import camRoutes from "../../../streaming/camRoutes.js";

const router = Router({ mergeParams: true });
router.param("greenhouseId", validateParamId("greenhouses"));

router.get("/", greenhouseController.getAllGreenhouses);
router.get("/:greenhouseId", greenhouseController.getGreenhouseById);
router.put("/:greenhouseId/updateInfo", greenhouseController.updateInfo);
router.get(
  "/:greenhouseId/flatGreenhouseData",
  greenhouseController.getFlatGreenhouseData
);
router.get("/:greenhouseId/envState", envStateController.getEnvState);
router.put("/:greenhouseId/updateEnvState", envStateController.updateEnvState);
router.put("/:greenhouseId/emptyAll", squareController.emptyAll);
router.get(
  "/:greenhouseId/eventLog",
  eventLogController.getAllEventsByParentId
);
router.put(
  "/:greenhouseId/controller/:controllerId/update",
  nodeController.updateController
);
router.use("/:greenhouseId/sensors", sensorRoutes);
router.use("/:greenhouseId/zones", zoneRoutes);
router.use("/:greenhouseId/notes", noteRoutes);
router.use("/:greenhouseId/squares", squareRoutes);
router.use("/:greenhouseId/cam", camRoutes);

export default router;
