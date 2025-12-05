import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

export const addVehicle = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await vehicleService.addVehivle(payload);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const getAllVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicle();
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

export const getVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const result = await vehicleService.getVehicle(vehicleId);
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
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const payload = req.body;
    const result = await vehicleService.updateVehicle(payload, vehicleId);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    console.log(error);
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
