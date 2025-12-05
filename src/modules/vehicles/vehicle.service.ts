import { VEHICLE_STATUS, VEHICLE_TYPE } from "../../constant/index";
import { pool } from "../../db/connectDB";

const addVehivle = async (payload: Record<string, unknown>) => {
  try {
    if (
      !payload?.vehicle_name ||
      !payload?.type ||
      !payload?.registration_number ||
      !payload?.daily_rent_price ||
      !payload?.availability_status
    ) {
      return {
        status: 400,
        success: false,
        message:
          "Vehicle name, type, registration number, daily rent, status is required",
      };
    }
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = payload;
    if (!VEHICLE_TYPE.includes(type as "car" | "bike" | "van" | "SUV")) {
      return {
        status: 400,
        success: false,
        message: "Vehicle type must be either car, bike, van or SUV",
      };
    }
    if (
      !VEHICLE_STATUS.includes(availability_status as "available" | "booked")
    ) {
      return {
        status: 400,
        success: false,
        message: "Vehicle status must be either available or booked",
      };
    }
    if (isNaN(Number(daily_rent_price)) || Number(daily_rent_price) < 0) {
      return {
        status: 400,
        success: false,
        message: "Daily rent price must be a number and greater than 0.",
      };
    }

    const result = await pool.query(
      `
        INSERT INTO Vehicles(vehicle_name, type, daily_rent_price, availability_status, registration_number) VALUES($1, $2, $3, $4, $5) RETURNING *
      `,
      [
        vehicle_name,
        type,
        Number(daily_rent_price),
        availability_status,
        registration_number,
      ]
    );
    return {
      status: 201,
      success: true,
      message: "Vehicle created successfully",
      data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    };
  } catch (error: any) {
    if (
      error.code === "23505" &&
      error.constraint === "vehicles_registration_number_key"
    ) {
      return {
        success: false,
        message: "This registration number already exists.",
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

const getAllVehicle = async () => {
  try {
    const result = await pool.query(
      `
        SELECT * FROM Vehicles
      `
    );
    if (!result.rows.length) {
      return {
        success: true,
        message: "No vehicles found",
        data: [],
        status: 200,
      };
    }
    return {
      success: true,
      status: 200,
      message: "Vehicles retrieved successfully",
      data: result.rows.map((item) => ({
        ...item,
        daily_rent_price: Number(item.daily_rent_price),
      })),
    };
  } catch (error: any) {
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      data: null,
    };
  }
};
const getVehicle = async (vehicleId: number) => {
  try {
    const result = await pool.query(
      `
        SELECT * FROM Vehicles where id=$1
      `,
      [vehicleId]
    );
    if (!result.rows.length) {
      return {
        success: true,
        message: "No vehicles found",
        status: 200,
      };
    }
    return {
      success: true,
      status: 200,
      message: "Vehicles retrieved successfully",
      data: {
        ...result.rows[0],
        daily_rent_price: Number(result.rows[0].daily_rent_price),
      },
    };
  } catch (error: any) {
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      data: null,
    };
  }
};

const updateVehicle = async (
  payload: Record<string, unknown>,
  vehicleId: number
) => {
  try {
    const existing = await getVehicle(vehicleId);
    if (!existing.data) {
      return existing;
    }
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = existing.data;

    if (
      payload?.type &&
      !VEHICLE_TYPE.includes(type as "car" | "bike" | "van" | "SUV")
    ) {
      return {
        status: 400,
        success: false,
        message: "Vehicle type must be either car, bike, van or SUV",
      };
    }
    if (
      payload?.availability_status &&
      !VEHICLE_STATUS.includes(availability_status as "available" | "booked")
    ) {
      return {
        status: 400,
        success: false,
        message: "Vehicle status must be either available or booked",
      };
    }
    if (
      (payload?.daily_rent_price && isNaN(Number(payload?.daily_rent_price))) ||
      Number(payload?.daily_rent_price) < 0
    ) {
      return {
        status: 400,
        success: false,
        message: "Daily rent price must be a number and greater than 0.",
      };
    }

    const result = await pool.query(
      `
        UPDATE Vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *
      `,
      [
        payload?.vehicle_name || vehicle_name,
        payload?.type || type,
        payload?.registration_number || registration_number,
        payload?.daily_rent_price || daily_rent_price,
        payload?.availability_status || vehicle_name || availability_status,
        vehicleId,
      ]
    );
    if (!result.rows.length) {
      return {
        status: 400,
        success: false,
        message: "Failed to update",
      };
    }
    return {
      status: 200,
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    };
  } catch (error: any) {
    if (
      error.code === "23505" &&
      error.constraint === "vehicles_registration_number_key"
    ) {
      return {
        success: false,
        message: "This registration number already exists.",
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

const deleteVehicle = async (vehicleId: number) => {
  try {
    const getActiveBooking = await pool.query(
      `
        SELECT * FROM Bookings WHERE status = $1 AND vehicle_id=$2
      `,
      ["active", vehicleId]
    );
    if (getActiveBooking.rows.length > 0) {
      return {
        status: 400,
        success: false,
        message: "This vehicle has active booking.",
      };
    }

    const result = await pool.query(
      `
        DELETE FROM Vehicles WHERE id=$1
      `,
      [vehicleId]
    );
    if (result.rowCount) {
      return {
        success: true,
        message: "Vehicle deleted successfully",
        status: 200,
      };
    } else {
      return {
        success: false,
        message: "Vehicle not found",
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const vehicleService = {
  addVehivle,
  getAllVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
