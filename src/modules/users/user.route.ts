import { Router } from "express";
import { getAllUsers, getUser, updateUser } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/checkpermission.middleware";

const userRoute = Router();

userRoute.get("/", authMiddleware, checkPermission(["admin"]), getAllUsers);
userRoute.get(
  "/:userId",
  authMiddleware,
  checkPermission(["admin", "customer"], "user"),
  getUser
);
userRoute.put(
  "/:userId",
  authMiddleware,
  checkPermission(["admin", "customer"], "user"),
  updateUser
);
// userRoute.delete("/:userId", signin);

export default userRoute;
