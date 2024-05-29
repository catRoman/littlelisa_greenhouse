import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js";
import envStateController from '../controllers/envStateController.js'
import zoneRoutes from "./zoneRoutes.js";
import validateParamId from "../middleware/validateParamId.js";
import sensorRoutes from "./sensorRoutes.js";
import noteRoutes from "../routes/noteRoutes.js";
import squareRoutes from "../routes/squareRoutes.js";

const router = Router({ mergeParams: true });
router.param("greenhouseId", validateParamId("greenhouses"));

router.get("/", greenhouseController.getAllGreenhouses);
router.get("/:greenhouseId", greenhouseController.getGreenhouseById);

router.get(
  "/:greenhouseId/flatGreenhouseData",
  greenhouseController.getFlatGreenhouseData
);
router.get("/:greenhouseId/envState", envStateController.getEnvState);
router.put("/:greenhouseId/updateEnvState", envStateController.updateEnvState);

router.use("/:greenhouseId/sensors", sensorRoutes);
router.use("/:greenhouseId/zones", zoneRoutes);
router.use("/:greenhouseId/notes", noteRoutes);
router.use("/:greenhouseId/squares", squareRoutes);

export default router;
