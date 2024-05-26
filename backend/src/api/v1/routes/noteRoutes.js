import { Router } from "express";
import notesController from "../controllers/notesController.js";
import validateParamId from "../middleware/validateParamId.js";

const router = Router({ mergeParams: true });
router.param("noteId", validateParamId("notes"));

router.get("/", notesController.getAllNotes);
router.post("/", notesController.postNote);
router.delete("/:noteId", notesController.removeNote);

export default router;
