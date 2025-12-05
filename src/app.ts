import express, { Request, Response } from "express";
import authRoute from "./modules/auth/auth.route";
import userRoute from "./modules/users/user.route";
import vehicleRoute from "./modules/vehicles/vehicle.route";
import bookingRoute from "./modules/booking/booking.route";

const app = express();
app.use(express.json());

app.get("/api/v1", (req: Request, res: Response) => {
  res.send("API RUNNING");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/vehicles", vehicleRoute);
app.use("/api/v1/bookings", bookingRoute);
export default app;
