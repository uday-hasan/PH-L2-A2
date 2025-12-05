import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
export const generateToken = (payload: Record<string, unknown>) => {
  const token = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: "1D",
  });
  return token;
};
