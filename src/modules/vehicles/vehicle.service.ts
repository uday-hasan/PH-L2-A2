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
        errors:
          "Vehicle name, type, registration number, daily rent, status is required",
        message: "All fields are required.",
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
        errors: "Vehicle type must be either car, bike, van or SUV",
        message: "Invalid vehicle type.",
      };
    }
    if (
      !VEHICLE_STATUS.includes(availability_status as "available" | "booked")
    ) {
      return {
        status: 400,
        success: false,
        errors: "Vehicle status must be either available or booked",
        message: "Invalid vehicle availability status",
      };
    }
    if (isNaN(Number(daily_rent_price)) || Number(daily_rent_price) < 0) {
      return {
        status: 400,
        success: false,
        errors: "Daily rent price must be a number and greater than 0.",
        message: "Invalid daily rent type",
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
        errors: "Try another registration number",
        status: 400,
      };
    }
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      errors: "Failed to add vehicle",
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
      errors: "Something went wrong when showing all vehicles",
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
        success: false,
        message: "No vehicles found",
        status: 404,
        errors: "No vehicle found for id: " + vehicleId,
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
      errors: "Something went wrong when getting details of vehicle",
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
        errors: "Vehicle type must be either car, bike, van or SUV",
        message: "Invalid vehicle type.",
      };
    }
    if (
      payload?.availability_status &&
      !VEHICLE_STATUS.includes(availability_status as "available" | "booked")
    ) {
      return {
        status: 400,
        success: false,
        errors: "Vehicle status must be either available or booked",
        message: "Invalid vehicle status",
      };
    }
    if (
      (payload?.daily_rent_price && isNaN(Number(payload?.daily_rent_price))) ||
      Number(payload?.daily_rent_price) < 0
    ) {
      return {
        status: 400,
        success: false,
        errors: "Daily rent price must be a number and greater than 0.",
        message: "Invalid daily rent price",
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
        errors: "Failed to update",
        message: "Updatation faild",
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
        errors: "This registration number already exists.",
        status: 400,
        message: "Provide another registration number",
      };
    }
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when updating vehicle",
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
        message: "Can't delete this vehicle.",
        errors: "This vehicle has active booking.",
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
        message: "Unable to delete",
        errors: "Vehicle not found",
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error",
      errors: "Something went wrong when deleting",
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
