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

const updateUser = async (payload: Record<string, unknown>, userId: number) => {
  try {
    const existingUserQuery = await pool.query(
      `
        SELECT name, email, phone, role FROM Users WHERE id=$1
      `,
      [userId]
    );
    if (!existingUserQuery.rows.length) {
      return {
        success: false,
        status: 404,
        message: "User not found.",
      };
    }
    const existingUser = existingUserQuery.rows[0];

    const name = payload.name || existingUser.name;
    const phone = payload.phone || existingUser.phone;
    const role = payload.role || existingUser.role;
    const email = payload.email || existingUser.email;
    if (!USER_TYPE.includes(role as "admin" | "customer")) {
      return {
        message: "Role can be only admin or customer",
        status: 400,
        success: false,
      };
    }

    const result = await pool.query(
      `
        UPDATE Users SET name=$1, email=$2, phone=$3, role=$4 where id=$5 RETURNING *
      `,
      [name, email, phone, role, userId]
    );
    if (!result.rows.length) {
      return {
        status: 400,
        success: false,
        message: "Failed to update",
      };
    }
    delete result.rows[0].password;
    return {
      status: 200,
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    };
  } catch (error: any) {
    if (error.code === "23505" && error.constraint === "users_email_key") {
      return {
        success: false,
        message: "Email already exists",
        status: 400,
      };
    }
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      data: null,
    };
  }
};

const getUser = async (userId: number) => {
  const result = await pool.query(
    `
      SELECT * FROM Users WHERE id=$1
    `,
    [userId]
  );

  return {
    success: true,
    status: 200,
    data: result.rows[0],
    message: "User found",
  };
};

export const userService = {
  getAllUsers,
  updateUser,
  getUser,
};
