import { Router } from "express";
import {
  createBooking,
  getAllBooking,
  getBooking,
  updateBooking,
} from "./booking.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { checkPermission } from "../../middleware/checkpermission.middleware";

const bookingRoute = Router();

bookingRoute.post("/", authMiddleware, createBooking);
bookingRoute.get("/", authMiddleware, getAllBooking);
bookingRoute.get(
  "/:bookingId",
  authMiddleware,
  checkPermission(["admin", "user"], "booking"),
  getBooking
);
// bookingRoute.get("/:vehicleId", getVehicle);
bookingRoute.put(
  "/:bookingId",
  authMiddleware,
  checkPermission(["admin", "user"], "booking"),
  updateBooking
);
// bookingRoute.delete("/:userId", signin);

export default bookingRoute;
