import app from "./app";
import { PORT } from "./config";
import connectDB from "./db/connectDB";

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});
