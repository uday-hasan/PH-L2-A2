import { USER_TYPE } from "../../constant/index";
import bcrypt from "bcryptjs";
import { pool } from "../../db/connectDB";
const signup = async (payload: Record<string, unknown>) => {
  try {
    if (
      !payload?.name ||
      !payload?.email ||
      !payload?.password ||
      !payload?.phone ||
      !payload?.role
    ) {
      console.log(payload);
      return {
        success: false,
        message: "Name, Email, Password, Phone, Role is required.",
        status: 400,
      };
    }
    const { name, email, password, phone, role } = payload;
    if ((password as string).length < 6) {
      return {
        success: false,
        message: "Password must contain 6 charecters",
        status: 400,
      };
    }
    if (!USER_TYPE.includes(role as "admin" | "customer")) {
      return {
        success: false,
        message: "Role must be either admin or customer",
        status: 400,
      };
    }

    const hashedPassword = await bcrypt.hash(password as string, 10);
    const result = await pool.query(
      `
                INSERT INTO Users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *
            `,
      [name, (email as string).toLowerCase(), hashedPassword, phone, role]
    );

    return {
      success: true,
      message: "User registered successfully",
      status: 201,
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
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const authService = {
  signup,
};
