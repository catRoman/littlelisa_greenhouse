import { Router } from "express";
import greenhouseController from "../controllers/greenhouseController.js"

const router = Router();

router.get("/greenhouses", greenhouseController.getAllGreenhouses);

export default router;