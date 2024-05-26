import { Router } from "express";
import validateParamId from "../middleware/validateParamId.js";
import noteRoutes from "../routes/noteRoutes.js";
import squareController from "../controllers/squareController.js";

const router = Router({ mergeParams: true });
router.param("squareId", validateParamId("squares"));
router.put("/:squareId", squareController.updateSquare);
router.use("/:squareId/notes", noteRoutes);
export default router;
