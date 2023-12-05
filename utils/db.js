import mongoose from "mongoose";
import dotenv from "dotenv";
// import {seedAdmin} from './seeder.js'

dotenv.config({ path: "./.env" });

const db_uri = process.env.DB_URI || "";
console.log(db_uri,"dbdbdbdbdbdbdbdbbdbd")

const connectDB = async () => {
  try {
    await mongoose.connect(db_uri).then((data) => {
      console.log(`Database connected successfully`);
      // seedAdmin();
    });
  } catch (error) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export { connectDB };
