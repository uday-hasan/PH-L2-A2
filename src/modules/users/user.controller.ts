import { Request, Response } from "express";
import { userService } from "./user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
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

// export const signin = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//     const result = await authService.signin(payload);
//     req.user = result.data?.user;
//     res.status(result.status).json({
//       success: result.success,
//       message: result.message,
//       data: result.data || null,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       data: null,
//     });
//   }
// };
