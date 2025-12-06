import { Request, Response } from "express";
import { authService } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await authService.signup(payload);
    const data = result.data
      ? { data: result.data }
      : { errors: result.errors };
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when creating user.",
    });
  }
};
export const signin = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await authService.signin(payload);
    const data = result.data
      ? { data: result.data }
      : { errors: result.errors };
    req.user = result.data?.user;
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when logging in.",
    });
  }
};
