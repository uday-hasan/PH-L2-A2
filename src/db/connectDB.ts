import { Pool } from "pg";
import { DB_URL } from "../config";

export const pool = new Pool({
  connectionString: DB_URL,
});

export default async function connectDB() {
  try {
    console.log("DB Connected");
  } catch (error) {}
}
