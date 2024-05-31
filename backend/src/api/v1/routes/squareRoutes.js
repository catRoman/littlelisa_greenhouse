import { Router } from "express";
import validateParamId from "../middleware/validateParamId.js";
import noteRoutes from "../routes/noteRoutes.js";
import squareController from "../controllers/squareController.js";
import eventLogController from '../controllers/eventLogController.js'

const router = Router({ mergeParams: true });
router.param("squareId", validateParamId("squares"));
router.put("/:squareId", squareController.updateSquare);
router.get("/:squareId/eventLog", eventLogController.getAllEventsByParentId);
router.use("/:squareId/notes", noteRoutes);
export default router;
