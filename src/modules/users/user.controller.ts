import { Request, Response } from "express";
import { userService } from "./user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsers();
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while getting all users",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const userId = Number(req.params.userId);
    const result = await userService.updateUser(payload, userId);
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while updating",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const result = await userService.getUser(userId);
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while getting user details",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const result = await userService.deleteUser(userId);
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while deleting user.",
    });
  }
};
