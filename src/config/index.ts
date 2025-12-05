import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env") });

export const { PORT, DB_URL, JWT_SECRET } = process.env;
