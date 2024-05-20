import { Router } from 'express';
import { sensorDataStream } from '../controllers/sensorDataController.js';

const router = Router();
router.post("/sensorDataStream", sensorDataStream);

export default router;