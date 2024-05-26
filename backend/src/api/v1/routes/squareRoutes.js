import { Router } from "express";
import validateParamId from "../middleware/validateParamId.js";
import noteRoutes from "../routes/noteRoutes.js";

const router = Router({ mergeParams: true });
router.param("squareId", validateParamId("squares"));

router.use("/:squareId/notes", noteRoutes);
export default router;
