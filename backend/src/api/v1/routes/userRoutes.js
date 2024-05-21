import { Router} from 'express';
import userController from "../controllers/userController.js"
import greenhouseRoutes from "../routes/greenhouseRoutes.js"

const router = Router();

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);

router.get("users/:id/greenhouses", greenhouseRoutes);
export default router;