import express, { Request, Response } from "express";
import authRoute from "./modules/auth/auth.route";
import userRoute from "./modules/users/user.route";

const app = express();
app.use(express.json());

app.get("/api/v1", (req: Request, res: Response) => {
  res.send("API RUNNING");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
export default app;
