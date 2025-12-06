import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

export const addVehicle = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await vehicleService.addVehivle(payload);
    const data = result.data
      ? { data: result.data }
      : { errors: result.errors };
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when adding new vehicle",
    });
  }
};

export const getAllVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicle();
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
      errors: "Something went wrong when showing all vehicles",
    });
  }
};

export const getVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const result = await vehicleService.getVehicle(vehicleId);
    const { status, ...rest } = result;
    res.status(status).json(rest);
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
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when updating vehicle",
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  try {
    const result = await vehicleService.deleteVehicle(Number(vehicleId!));
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when deleting.",
    });
  }
};
