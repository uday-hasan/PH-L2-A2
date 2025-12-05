import { Request, Response } from "express";
import { authService } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await authService.signup(payload);
    res.status(result.status).json({
      message: result.message,
      success: result.success,
      data: result.data || null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
      data: null,
    });
  }
};
export const signin = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await authService.signin(payload);
    req.user = result.data?.user;
    res.status(result.status).json({
      message: result.message,
      success: result.success,
      data: result.data || null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
      data: null,
    });
  }
};
