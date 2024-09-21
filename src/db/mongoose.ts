import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const directURL = process.env.DATABASE_URL;
const dataBaseName = process.env.DATABASE_NAME;

const mongoDbURL = `${directURL}/${dataBaseName}`;

mongoose.connect(mongoDbURL);

mongoose.connection.once("open", () => {
  console.log("connected to mongoDB");
});
