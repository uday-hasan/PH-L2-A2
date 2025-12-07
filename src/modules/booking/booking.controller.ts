import { Request, Response } from "express";
import { bookingService } from "./booking.service";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await bookingService.createBooking(payload);
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while creating booking",
    });
  }
};

export const getAllBooking = async (req: Request, res: Response) => {
  try {
    const payload = req.user;
    const result = await bookingService.getAllBooking(payload!);
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while getting bookings.",
    });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.getBooking(
      Number(req.params.bookingId!)
    );
    res.status(200).json({
      success: "result.success",
      message: "result.message",
      data: result || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const newStatus = req.body?.status as "returned" | "cancelled";
    const bookingId = req.params.bookingId;
    const user = req.user;
    const result = await bookingService.updateBooking(
      Number(bookingId),
      newStatus,
      user?.role!
    );
    const { status, ...rest } = result;
    res.status(status).json(rest);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while updating booking.",
    });
  }
};
