import { NextFunction, Request, Response } from "express";

export const checkPermission = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user;
    if (user && user.role && roles.includes(user?.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission.",
      });
    }
  };
};
