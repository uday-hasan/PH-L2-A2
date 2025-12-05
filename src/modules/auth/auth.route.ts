import { Router } from "express";
import { signin, signup } from "./auth.controller";

const authRoute = Router();

authRoute.post("/signup", signup);
authRoute.post("/signin", signin);

export default authRoute;
