import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { pool } from "../db/connectDB";
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headersToken = req.headers.authorization;
    const isBearer = headersToken && headersToken?.split(" ")[0] === "Bearer";
    const token = headersToken && headersToken?.split(" ")[1];
    if (!headersToken || !isBearer || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid or no token",
      });
    }

    const decoded = jwt.verify(token as string, JWT_SECRET as string);
    if (typeof decoded === "object" && "email" in decoded) {
      const result = await pool.query(
        `
                SELECT name, email, phone, role FROM Users where email = $1
            `,
        [decoded.email]
      );
      if (!result.rows.length) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      req.user = result.rows[0];
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
