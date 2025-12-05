import { Router } from "express";
import {
  addVehicle,
  getAllVehicle,
  getVehicle,
  updateVehicle,
} from "./vehicle.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/checkpermission.middleware";

const vehicleRoute = Router();

vehicleRoute.post("/", authMiddleware, checkPermission(["admin"]), addVehicle);
vehicleRoute.get("/", getAllVehicle);
vehicleRoute.get("/:vehicleId", getVehicle);
vehicleRoute.put(
  "/:vehicleId",
  authMiddleware,
  checkPermission(["admin"]),
  updateVehicle
);
// vehicleRoute.delete("/:userId", signin);

export default vehicleRoute;
