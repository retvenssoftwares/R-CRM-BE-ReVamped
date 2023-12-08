import fs from "fs";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import Disposition from "../model/Disposition.js";
import pause from "../model/PauseDropDown.js"
const ROOT_DIR = resolve();
import { join, resolve } from "path";

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

export async function seedDisposition() {
  try {
    const filePath = join(ROOT_DIR, "utils/Static/disposition.json");
    const jsonString = await fs.readFileSync(filePath, "utf8");
    const disposition = JSON.parse(jsonString);

    const data = await Promise.all(
      disposition.map(async (elem) => {
        const findDisposition = await Disposition.findOne({
          name: elem.name,
        });
        if (!findDisposition) {
          const seeding = await Disposition.create({
            name: elem.name,
          });
          return seeding;
        }
      })
    );
    return true;
  } catch (error) {
    console.log("From Seeder Function", error);
  }
}

export async function seedPauesReasons() {
  try {
    const filePath = join(ROOT_DIR, "utils/Static/pause_reasons.json");
    const jsonString = await fs.readFileSync(filePath, "utf8");
    const pauseReasons = JSON.parse(jsonString);

    const data = await Promise.all(
      pauseReasons.map(async (elem) => {
        const findPause = await pause.findOne({
          pause_reason: elem.pause_reason,
        });
        if (!findPause) {
          const seeding = await pause.create({
            pause_reason: elem.pause_reason,
          });
          return seeding;
        }
      })
    );
    return true;
  } catch (error) {
    console.log("From Seeder Function", error);
  }
}
