import dotenv from "dotenv";
dotenv.config();
import app from "./App.js";
import chalk from "chalk";
import mongoose from "mongoose";
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log(`${chalk.green.bold("Connected")} to the database ✅`);
    const server = app.listen(PORT, () => {
      console.log(
        `${chalk.yellow.bold("Server")} is listening on port ${chalk.green.bold(
          PORT
        )} 🚀`
      );
    });
    server.setTimeout(30000);
  })
  .catch((error) =>
    console.log(`${chalk.red.bold("error")} connecting to database`, err)
  );
