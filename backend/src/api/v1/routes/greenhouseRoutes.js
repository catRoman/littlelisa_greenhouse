import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js";
import zoneRoutes from "./zoneRoutes.js";
import validateParamId from "../middleware/validateParamId.js";

const router = Router({ mergeParams: true });
router.param("greenhouseId", validateParamId("greenhouses"));

router.get("/", greenhouseController.getAllGreenhouses);
router.get("/:greenhouseId", greenhouseController.getGreenhouseById);


router.get("/:greenhouseId/flatGreenhouseData", greenhouseController.getFlatGreenhouseData);

router.use("/:greenhouseId/zones", zoneRoutes);

export default router;