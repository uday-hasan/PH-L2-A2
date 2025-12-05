import { Pool } from "pg";
import { DB_URL } from "../config";

export const pool = new Pool({
  connectionString: DB_URL,
});

export default async function connectDB() {
  try {
    // * Create user table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Users(
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(200) UNIQUE NOT NULL,
          password VARCHAR(200) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          role VARCHAR(10) NOT NULL
    )
        `);
    // * Create vehicles table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Vehicles(
          id SERIAL PRIMARY KEY,
          vehicle_name VARCHAR(150) NOT NULL,
          type VARCHAR(20) NOT NULL,
          registration_number VARCHAR(200) UNIQUE NOT NULL,
          daily_rent_price NUMERIC NOT NULL,
          availability_status VARCHAR(20) NOT NULL
          )
        `);

    // * Create Bookings table
    await pool.query(`
          CREATE TABLE IF NOT EXISTS Bookings(
          id SERIAL PRIMARY KEY,
          customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
          vehicle_id INT REFERENCES Vehicles(id) ON DELETE CASCADE,
          rent_start_date DATE NOT NULL,
          rent_end_date DATE NOT NULL,
          total_price NUMERIC NOT NULL,
          status VARCHAR(20) NOT NULL
    )
        `);
  } catch (error: any) {
    throw error.message || "Failed to connect db";
  }
}
