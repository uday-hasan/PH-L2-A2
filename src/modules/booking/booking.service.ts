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
        message: "All fields are required.",
        errors:
          "Please provide customer_id, vehicle_id, rent_start_date and rent_end_date.",
      };
    }
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    const start = new Date(rent_start_date as string);
    const end = new Date(rent_end_date as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        status: 400,
        success: false,
        message: "Invalid date format.",
        errors: `Please use 'yyyy-mm-dd' format`,
      };
    }

    if (start.getTime() >= end.getTime()) {
      return {
        status: 400,
        success: false,
        message: "Invalid date range",
        errors: "rent_start_date must be earliar than rent_end_date",
      };
    }

    const updateStatus = await pool.query(
      `UPDATE Bookings SET status=$1 WHERE status=$2 AND rent_end_date < $3 RETURNING * `,
      ["returned", "active", formatDate(new Date().toISOString())]
    );

    if (updateStatus.rows.length > 0) {
      const vehicleListForUpdate = updateStatus.rows.map(
        (item) => item.vehicle_id
      );
      const idsInOrFormat = vehicleListForUpdate.map(
        (_, index) => `$${index + 2}`
      );
      await pool.query(
        `UPDATE Vehicles SET availability_status=$1 WHERE id IN (${idsInOrFormat})`,
        ["available", ...vehicleListForUpdate]
      );
    }

    const getVehicle = await vehicleService.getVehicle(vehicle_id as number);
    if (!getVehicle.data) {
      return {
        status: getVehicle.status,
        success: getVehicle.success,
        message: getVehicle.message,
        errors: getVehicle.errors,
      };
    }

    const vehicle = getVehicle.data;
    if (vehicle.availability_status === "booked") {
      return {
        status: 400,
        success: false,
        message: "Vehicle is not available",
        errors:
          "This vehicle is already booked, please choose another vehicle.",
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
    if (
      error.code === "23503" &&
      error.constraint === "bookings_customer_id_fkey"
    ) {
      return {
        status: 404,
        success: false,
        message: "Customer not found",
        errors: `Customer id: ${payload.customer_id || "N/A"} not found.`,
      };
    }
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while creating booking",
    };
  }
};

const getAllBooking = async (user: Record<string, unknown>) => {
  try {
    const updateStatus = await pool.query(
      `UPDATE Bookings SET status=$1 WHERE status=$2 AND rent_end_date < $3 RETURNING * `,
      ["returned", "active", formatDate(new Date().toISOString())]
    );

    if (updateStatus.rows.length > 0) {
      const vehicleListForUpdate = updateStatus.rows.map(
        (item) => item.vehicle_id
      );
      const idsInOrFormat = vehicleListForUpdate
        .map((_, index) => `$${index + 2}`)
        .join(",");
      await pool.query(
        `UPDATE Vehicles SET availability_status=$1 WHERE id IN (${idsInOrFormat})`,
        ["available", ...vehicleListForUpdate]
      );
    }
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
    if (!result.rows.length) {
      return {
        success: true,
        message:
          role === "admin"
            ? "No booking found"
            : "You don't have any booking yet.",
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
      errors: "Something went wrong while getting booking.",
    };
  }
};

const getBooking = async (bookingId: number) => {
  try {
    const result = await pool.query(`SELECT * FROM Bookings WHERE id=$1`, [
      bookingId,
    ]);
    if (!result.rows.length) {
      return {
        status: 404,
        success: false,
        message: "No booking found",
        errors: "No booking found for id: " + bookingId,
      };
    }
    return {
      status: 200,
      success: true,
      message: "Booking found",
      data: result.rows[0],
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: "Internal server error",
      errors: "Something went wrong while getting booking",
    };
  }
};

const updateBooking = async (
  bookingId: number,
  bookingStatus: "cancelled" | "returned",
  role: string
) => {
  try {
    if (!["cancelled", "returned"].includes(bookingStatus)) {
      return {
        status: 400,
        success: false,
        message: "Invalid status",
        errors: "Status must be either cancelled or returned",
      };
    }
    const existingBooking = await getBooking(bookingId);
    if (!existingBooking.data) {
      return {
        success: existingBooking.success,
        status: existingBooking.status,
        message: existingBooking.message,
        errors: existingBooking.errors,
      };
    }
    if (existingBooking.data.status === "returned") {
      return {
        status: 400,
        success: false,
        message: "Can't update status of this booking.",
        errors: "You can't update status because it's already returned",
      };
    }
    if (bookingStatus === "returned" && role === "customer") {
      return {
        status: 400,
        success: false,
        message: "Forbidden",
        errors: "Customers are not allowed to returned",
      };
    }
    if (bookingStatus === existingBooking.data.status) {
      return {
        status: 400,
        success: false,
        message: "Unable to update status.",
        errors: "This booking already " + bookingStatus,
      };
    }
    const newResult = await pool.query(
      `
        UPDATE Bookings SET status = $1 WHERE id = $2 RETURNING *
      `,
      [bookingStatus, bookingId]
    );
    if (!newResult.rows.length) {
      return {
        status: 400,
        success: false,
        message: "Something went wrong",
        errors: "Something went wrong while updating booking status.",
      };
    }
    if (newResult.rows[0].status === "cancelled") {
      return {
        success: true,
        message: "Booking cancelled successfully",
        data: {
          ...newResult.rows[0],
          total_price: Number(newResult.rows[0].total_price),
          rent_start_date: formatDate(newResult.rows[0].rent_start_date),
          rent_end_date: formatDate(newResult.rows[0].rent_end_date),
        },
        status: 200,
      };
    }
    if (newResult.rows[0].status === "returned") {
      const updatedVehicle = await pool.query(
        `UPDATE Vehicles SET availability_status=$1 WHERE id=$2 RETURNING *`,
        ["available", newResult.rows[0].vehicle_id]
      );
      return {
        success: true,
        message: "Booking marked as returned. Vehicle is now available",
        status: 200,
        data: {
          ...newResult.rows[0],
          rent_start_date: formatDate(newResult.rows[0].rent_start_date),
          rent_end_date: formatDate(newResult.rows[0].rent_end_date),
          total_price: Number(newResult.rows[0].total_price),
          vehicle: {
            availability_status: updatedVehicle.rows[0]?.availability_status,
          },
        },
      };
    }
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      errors: "Something went wrong while updating booking",
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      errors: "Something went wrong while updating booking",
    };
  }
};
export const bookingService = {
  createBooking,
  getAllBooking,
  getBooking,
  updateBooking,
};
