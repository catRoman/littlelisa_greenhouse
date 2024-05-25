import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js";
import zoneRoutes from "./zoneRoutes.js";
import validateParamId from "../middleware/validateParamId.js";
import sensorRoutes from "./sensorRoutes.js";

const router = Router({ mergeParams: true });
router.param("greenhouseId", validateParamId("greenhouses"));

router.get("/", greenhouseController.getAllGreenhouses);
router.get("/:greenhouseId", greenhouseController.getGreenhouseById);
router.use("/:greenhouseId/sensors", sensorRoutes);

router.get(
  "/:greenhouseId/flatGreenhouseData",
  greenhouseController.getFlatGreenhouseData
);

router.use("/:greenhouseId/zones", zoneRoutes);

export default router;
