import { Router } from "express";
import zoneController from "../controllers/zoneController.js";

const router = Router();

router.get("/", zoneController.getAllZones);
router.get("/:id", zoneController.getZoneById);

export default router;
