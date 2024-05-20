import { camStream } from './camControllers.js';
import { Router } from 'express';
const router = Router();

router.get("/mainStream", camStream);

export default router;