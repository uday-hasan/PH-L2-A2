import { USER_TYPE } from "../../constant/index";
import { pool } from "../../db/connectDB";

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
      errors: "Something went wrong when getting all users",
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
        errors: "User not found for id: " + userId,
      };
    }
    const existingUser = existingUserQuery.rows[0];

    const name = payload.name || existingUser.name;
    const phone = payload.phone || existingUser.phone;
    const role = payload.role || existingUser.role;
    const email = payload.email || existingUser.email;
    if (!USER_TYPE.includes(role as "admin" | "customer")) {
      return {
        success: false,
        message: "Invalid role.",
        errors: "Role can be only admin or customer",
        status: 400,
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
        errors: "Something went wrong when updating the user",
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
        errors: "Try another email",
        status: 400,
      };
    }
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while updating user",
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
    message: "User found",
    data: result.rows[0],
  };
};

const deleteUser = async (userId: number) => {
  try {
    const getActiveBooking = await pool.query(
      `
        SELECT * FROM Bookings WHERE status = $1 AND customer_id=$2
      `,
      ["active", userId]
    );
    if (getActiveBooking.rows.length > 0) {
      return {
        status: 400,
        success: false,
        message: "This user has active booking.",
        errors:
          "Failed to delete because this user already have active booking",
      };
    }

    const result = await pool.query(
      `
        DELETE FROM Users WHERE id=$1
      `,
      [userId]
    );
    if (result.rowCount) {
      return {
        success: true,
        message: "User deleted successfully",
        status: 200,
      };
    } else {
      return {
        success: false,
        message: "User not found",
        errors: "User not found for delete",
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while deleting",
      status: 500,
    };
  }
};

export const userService = {
  getAllUsers,
  updateUser,
  getUser,
  deleteUser,
};
