import { Router } from "express";
import notesController from "../controllers/notesController.js";

const router = Router({ mergeParams: true });

router.get("/", notesController.getAllNotes);

export default router;
