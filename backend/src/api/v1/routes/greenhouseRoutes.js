import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js";
import addParentId from "../Middleware/addParentId.js";
import zoneRoutes from "./zoneRoutes.js";

const router = Router();

router.get("/", greenhouseController.getAllGreenhouses);
router.get("/:id", greenhouseController.getGreenhouseById);

router.use("/:id/zones", addParentId, zoneRoutes);

export default router;
