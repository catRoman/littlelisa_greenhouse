import { Router } from "express";
import userController from "../controllers/userController.js";
import greenhouseRoutes from "../routes/greenhouseRoutes.js";
import validateParamId from "../middleware/validateParamId.js";

const router = Router({ mergeParams: true });
router.param("userId", validateParamId("users"));

router.get("/users", userController.getAllUsers);
router.get("/users/:userId", userController.getUserById);

router.use("/users/:userId/greenhouses", greenhouseRoutes);

export default router;
