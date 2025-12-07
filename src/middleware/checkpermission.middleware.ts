import { NextFunction, Request, Response } from "express";
import { pool } from "../db/connectDB";

export const checkPermission = (
  roles: string[],
  requestFor?: "user" | "vehicle" | "booking"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        errors: "Please login again.",
      });
    }
    const isAdmin = user.role === "admin";
    if (roles.includes(user?.role) && isAdmin) {
      return next();
    }

    if (requestFor) {
      const key = requestFor + "Id";
      const id = req.params[key];
      if (requestFor === "booking") {
        const result = await pool.query(
          `SELECT customer_id FROM Bookings WHERE id=$1`,
          [id]
        );
        if (!result.rows.length) {
          return res.status(404).json({
            success: false,
            message: "No booking found",
            errors: "No booking found for this id: " + id,
          });
        }

        if (Number(result.rows[0].customer_id) === Number(user.id)) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "No don't owe this booking",
        });
      }
      if (requestFor === "user") {
        if (Number(id) === Number(user.id)) {
          return next();
        } else {
          return res.status(403).json({
            success: false,
            message: "Forbidden",
            errors: "You don't have permission.",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You don't have permission.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You don't have permission.",
      });
    }
  };
};
