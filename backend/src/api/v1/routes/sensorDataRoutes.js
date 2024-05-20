import { Router } from "express";
import { sensorDataStream } from "../controllers/sensorDataController.js";

const router = Router();
router.post("/sensorStream", sensorDataStream);

export default router;
