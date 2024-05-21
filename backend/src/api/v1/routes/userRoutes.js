import { Router } from "express";
import userController from "../controllers/userController.js";
import greenhouseRoutes from "../routes/greenhouseRoutes.js";
import addParentId from "../Middleware/addParentId.js";

const router = Router();

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);

router.use("/users/:id/greenhouses", addParentId, greenhouseRoutes);
export default router;
