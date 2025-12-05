import { USER_TYPE } from "../../constant/index";
import bcrypt from "bcryptjs";
import { pool } from "../../db/connectDB";
import { generateToken } from "../../utils/jwt";

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

    const responseUser = result.rows[0];
    delete responseUser.password;

    return {
      success: true,
      message: "User registered successfully",
      status: 201,
      data: responseUser,
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

const signin = async (payload: Record<string, unknown>) => {
  try {
    if (!payload?.email || !payload?.password) {
      return {
        success: false,
        status: 400,
        message: "Email and password are required.",
      };
    }
    const { email, password } = payload;
    const findUser = await pool.query(
      `
                SELECT * FROM Users where email=$1
            `,
      [email]
    );
    if (!findUser.rows.length) {
      return {
        success: false,
        status: 404,
        message: "User not found.",
      };
    }
    const user = findUser.rows[0];
    const isValidPassword = await bcrypt.compare(
      password as string,
      user.password
    );
    if (!isValidPassword) {
      return {
        success: false,
        status: 401,
        message: "Invalid credentials.",
      };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    delete user.password;
    return {
      success: true,
      status: 200,
      message: "Login successful",
      data: {
        token,
        user,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const authService = {
  signup,
  signin,
};
