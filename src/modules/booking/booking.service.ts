import { VEHICLE_STATUS, VEHICLE_TYPE } from "../../constant/index";
import { pool } from "../../db/connectDB";
import { formatDate } from "../../utils/formatDate";
import { userService } from "../users/user.service";
import { vehicleService } from "../vehicles/vehicle.service";

const createBooking = async (payload: Record<string, unknown>) => {
  try {
    if (
      !payload?.customer_id ||
      !payload?.vehicle_id ||
      !payload?.rent_start_date ||
      !payload?.rent_end_date
    ) {
      return {
        status: 400,
        success: false,
        message: "Customer id, vehicle id, rent start and end date is required",
      };
    }
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    const start = new Date(rent_start_date as string);
    const end = new Date(rent_end_date as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        status: 400,
        success: false,
        message: "Invalid date format. Use yyyy-mm-dd",
      };
    }

    if (start.getTime() >= end.getTime()) {
      return {
        status: 400,
        success: false,
        message: "Rent start day must be earliar of end day",
      };
    }

    const getVehicle = await vehicleService.getVehicle(vehicle_id as number);
    if (!getVehicle.data) {
      return {
        status: getVehicle.status,
        message: getVehicle.message,
        success: getVehicle.success,
      };
    }

    const vehicle = getVehicle.data;
    if (vehicle.availability_status === "booked") {
      return {
        status: 400,
        success: false,
        message: "This vehicle is already booked",
      };
    }

    const milisecondDifference = end.getTime() - start.getTime();
    const daysCount = milisecondDifference / (1000 * 60 * 60 * 24);

    const totalPrice = Number(vehicle.daily_rent_price) * daysCount;

    const result = await pool.query(
      `
        INSERT INTO Bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
      `,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        totalPrice,
        "active",
      ]
    );
    await vehicleService.updateVehicle(
      { availability_status: "booked" },
      vehicle_id as number
    );
    const data = result.rows[0];
    return {
      status: 201,
      success: true,
      message: "Booking created successfully",
      data: {
        ...data,
        total_price: Number(data.total_price),
        rent_start_date: formatDate(data.rent_start_date),
        rent_end_date: formatDate(data.rent_end_date),
        vehicle: {
          vehicle_name: vehicle.vehicle_name,
          daily_rent_price: Number(vehicle.daily_rent_price),
        },
      },
    };
  } catch (error: any) {
    console.log(error);
    if (
      error.code === "23503" &&
      error.constraint === "bookings_customer_id_fkey"
    ) {
      return {
        status: 404,
        success: false,
        message: "Customer not found",
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

const getAllBooking = async (user: Record<string, unknown>) => {
  try {
    const userId = user.id;
    const role = user.role;
    const vehicles = await vehicleService.getAllVehicle();

    let result, data;
    if (role === "admin") {
      result = await pool.query(
        `
        SELECT * FROM Bookings
      `
      );
    } else {
      result = await pool.query(
        `
          SELECT * FROM Bookings where customer_id=$1
        `,
        [userId]
      );
    }
    console.log(result);
    if (!result.rows.length) {
      return {
        success: true,
        message: "No booking found",
        data: [],
        status: 200,
      };
    }
    if (role === "admin") {
      const customers = await userService.getAllUsers();
      data = result.rows.map((item) => {
        const customer =
          customers.data &&
          customers.data.find(
            (c: any) => Number(c.id) === Number(item.customer_id)
          );
        const vehicle =
          vehicles.data &&
          vehicles.data.find(
            (v: any) => Number(v.id) === Number(item.vehicle_id)
          );
        return {
          ...item,
          total_price: Number(item.total_price),
          rent_start_date: formatDate(item.rent_start_date),
          rent_end_date: formatDate(item.rent_end_date),
          customer: {
            name: customer.name,
            email: customer.email,
          },
          vehicle: {
            vehicle_name: vehicle.vehicle_name,
            registration_number: vehicle.registration_number,
          },
        };
      });
    } else {
      data = result.rows.map((item) => {
        delete item.customer_id;
        const vehicle =
          vehicles.data &&
          vehicles.data.find(
            (v: any) => Number(v.id) === Number(item.vehicle_id)
          );
        return {
          ...item,
          total_price: Number(item.total_price),
          rent_start_date: formatDate(item.rent_start_date),
          rent_end_date: formatDate(item.rent_end_date),
          vehicle: {
            vehicle_name: vehicle.vehicle_name,
            registration_number: vehicle.registration_number,
            type: vehicle.type,
          },
        };
      });
    }
    return {
      success: true,
      status: 200,
      message:
        role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully",
      data: data,
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

export const bookingService = {
  createBooking,
  getAllBooking,
  getVehicle,
  updateVehicle,
};
