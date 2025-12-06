import { Request, Response } from "express";
import { userService } from "./user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsers();
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const userId = Number(req.params.userId);
    const result = await userService.updateUser(payload, userId);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const result = await userService.getUser(userId);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const result = await userService.deleteUser(userId);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
