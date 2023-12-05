import fs from "fs";
import User from "../model/User.js";
import bcrypt from "bcryptjs";

/* *************************** Multiple Admin ************************* */
export async function seedAdmin() {
  try {
    const findAdmin = await User.findOne({
      email: "crsretvens@gmail.com",
    });
    const tempPassword = "retvens@123";

    const encryptedPassword = await bcrypt.hash(tempPassword, 10);

    if (!findAdmin) {
      const seeding = await User.create({
        email: "crsretvens@gmail.com",
        name: "CRS Admin",
        password: encryptedPassword,
        is_verified: true,
        role:"SUPER_ADMIN",
        is_email_Verified:true
      });
    }
    return true;
  } catch (error) {
    console.log("From Seeder Function", error);
  }
}
