import app from "./app";
import { PORT } from "./config";
import connectDB from "./db/connectDB";

connectDB()
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
