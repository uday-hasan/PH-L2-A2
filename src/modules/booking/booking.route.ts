import { Router } from "express";
import { createBooking, getAllBooking } from "./booking.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/checkpermission.middleware";

const bookingRoute = Router();

bookingRoute.post("/", authMiddleware, createBooking);
bookingRoute.get("/", authMiddleware, getAllBooking);
// bookingRoute.get("/:vehicleId", getVehicle);
bookingRoute.put(
  "/:vehicleId",
  authMiddleware,
  checkPermission(["admin"])
  // updateVehicle
);
// bookingRoute.delete("/:userId", signin);

export default bookingRoute;
