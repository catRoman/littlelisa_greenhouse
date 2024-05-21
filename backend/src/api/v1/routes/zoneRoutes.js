import { Router } from "express";
import zoneController from "../controllers/zoneController.js";
import validateParamId from "../Middleware/validateParamId.js";

const router = Router({ mergeParams: true });

router.param("zoneId", validateParamId("zones"));

router.get("/", zoneController.getAllZones);
router.get("/:zoneId", zoneController.getZoneById);

export default router;
