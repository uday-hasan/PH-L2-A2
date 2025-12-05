import { NextFunction, Request, Response } from "express";

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
      });
    }
    const isAdmin = user.role === "admin";
    if (roles.includes(user?.role) && isAdmin) {
      return next();
    }

    if (requestFor) {
      const key = requestFor + "Id";
      const id = req.params[key];
      console.log({ id, userId: user.id });
      if (Number(id) === Number(user.id)) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission 1.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission 2.",
      });
    }
  };
};
