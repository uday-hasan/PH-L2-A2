import { USER_TYPE } from "../../constant/index";
import bcrypt from "bcryptjs";
import { pool } from "../../db/connectDB";
import { generateToken } from "../../utils/jwt";

const getAllUsers = async () => {
  try {
    const result = await pool.query(`
        SELECT id, name, email, phone, role FROM Users
      `);
    return {
      status: 200,
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      data: null,
    };
  }
};

export const userService = {
  getAllUsers,
};
