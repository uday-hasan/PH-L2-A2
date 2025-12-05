import { Router } from "express";
import { getAllUsers } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/checkpermission.middleware";

const userRoute = Router();

userRoute.get("/", authMiddleware, checkPermission("admin"), getAllUsers);
// userRoute.put("/:userId", signin);
// userRoute.delete("/:userId", signin);

export default userRoute;
