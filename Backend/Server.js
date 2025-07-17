import dotenv from "dotenv";
dotenv.config();
import app from "./App.js";
import mongoose from "mongoose";
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

mongoose
  .connect(MONGOURL)
  .then(() => {
    // console.log(`${chalk.green.bold("Connected")} to the database ✅`);
    console.log("DB connected successfully.");
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port :${PORT} `);
      // console.log(`${chalk.green.bold('Server')} is listening on port ${chalk.green.bold(PORT)} 🚀`);
    });
    server.setTimeout(30000);
  })
  .catch((error) => console.log(error));
// console.log(`${chalk.red.bold("Error")} connecting to database`, err);
// process.exit(1);
