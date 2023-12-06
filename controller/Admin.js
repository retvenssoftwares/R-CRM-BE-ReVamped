import User from "../model/User.js";
import { generateRandomNumber } from "../utils/generatePassword.js";
import { randomString } from "../middleware/custom.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from "axios";
import { signJwt } from "../middleware/auth.js";
import { sendMail } from "../utils/sendMail.js";
import ErrorHandler from "../utils/errorHandler.js";
import CallDetail from "../model/callDetails.js"
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

let BASE_URL = process.env.BASE_URL;

class AdminModel {
  static async loginAdmin(req, res, next) {
    try {
      let { email, password } = req.body;

      if (!email && !password) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Please fill all the required field",
        });
      }
      let findUser = await User.findOne({ email }).lean();
      console.log(findUser, "findUserfindUserfindUserfindUser");
      if (!findUser) {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "Email did not match!!",
        });
      }
      let validPassword = await bcrypt.compare(password, findUser.password);
      if (!validPassword) {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "Password did not match!!",
        });
      }

      if (
        findUser.is_verified === false ||
        findUser.is_email_Verified === false ||
        findUser.status === "INACTIVE"
      ) {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "You are not allowed to login",
        });
      }

      // pending for coral api

      // if (findUser.role === "AGENT") {
      //   const data = {
      //     agent_id: findAgent.length + 1 || 1,
      //     agent_text: req.query.ext_name,
      //   };

      //   const options = {
      //     method: "POST",
      //     url: BASE_URL + "/agentlogin",
      //     headers: {
      //       accept: "application/json",
      //       "content-type": "application/json",
      //       Authorization: process.env.API_KEY,
      //     },
      //     data: data,
      //   };
      //   const apiResponse = await new Promise(async (resolve, reject) => {
      //     axios
      //       .request(options)
      //       .then(function (response1) {
      //         resolve(response1.data);
      //         return response;
      //       })
      //       .catch(function (error) {
      //         reject(error);
      //         return response;
      //       });
      //   });
      // }
      // TODO :

      const _id = findUser._id;
      const role = findUser.role;
      const name = findUser.name;

      const jwtToken = await signJwt({ _id, role, name, email });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Login Successfully",
        data: jwtToken,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async AddUser(req, res, next) {
    try {
      if (req.authData.role === "ADMIN") {
        let email = req.body.email;
        let name = req.body.name;
        let gender = req.body.gender;
        let dob = req.body.dob;
        let phone_number = req.body.phone_number;
        let password = req.body.password;

        let findOldUser = await User.findOne({ email }).lean();
        let findAgent = await User.find({ role: "AGENT" }).lean();

        if (findOldUser) {
          return res.status(409).json({
            success: false,
            code: 409,
            message: "User already exists",
          });
        } else {
          const encryptedPassword = await bcrypt.hash(password, 10);

          let newUser = await User.create({
            email,
            name,
            gender,
            dob,
            phone_number,
            is_verified: true,
            is_email_Verified: true,
            password: encryptedPassword,
            created_by: req.authData._id,
            // agent_id: (findAgent.length + 1) || 1,
            // agent_text: req.query.ext_name,
            role: "AGENT",
          });

          // const data = {
          //   agent_id: (findAgent.length + 1) || 1,
          //   agent_text: req.query.ext_name
          // };

          // const options = {
          //   method: 'POST',
          //   url: BASE_URL + '/createagent',
          //   headers: {
          //     accept: 'application/json',
          //     'content-type': 'application/json',
          //     'Authorization': process.env.API_KEY,
          //   },
          //   data: data,
          // };
          // const apiResponse = await new Promise(async (resolve, reject) => {
          //   axios
          //     .request(options)
          //     .then(function (response1) {
          //       resolve(response1.data);

          //       return response;
          //     })
          //     .catch(function (error) {
          //       reject(error);
          //       return response;
          //     });
          // });

          return res.status(200).json({
            success: true,
            code: 200,
            message: `Agent added....`,
          });
        }
      } else {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "Not Authorized",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async AdminSignUp(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const phone_number = req.body.phone_number;
      const dob = req.body.dob;
      const gender = req.body.gender;

      if (!email || !password || !phone_number || !dob) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Please fill all the required field",
        });
      }

      let user = await User.findOne({ email }).lean();

      if (user) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: "Email already exist",
        });
      }
      const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
      const encryptedPassword = await bcrypt.hash(password, 10);
      const otp = generateRandomNumber();
      user = await User.create({
        phone_number: phone_number,
        email: email,
        dob: dob,
        gender: gender,
        password: encryptedPassword,
        otp: otp,
        expires: expires,
        is_verified: true, // This is on hold after that superAdmin will verify Admin
      });
      const { _id } = user;
      const jwtToken = await signJwt({ _id, email });

      await sendMail({
        email: email,
        subject: "OTP For Validating Email",
        template: "otp-mail.ejs",
        data: {
          name: user.name ? user.name : "USER",
          otp: otp,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "OTP send to your mail...",
        token: jwtToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async VarifiedEmail(req, res, next) {
    try {
      const userId = req.authData._id;
      const otp = req.body.otp;

      if (!userId || !otp) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Not getting details",
        });
      }

      let user = await User.findById(userId).lean();

      if (!user) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: "User does not exist",
        });
      }

      const details = await User.findOne({ _id: userId, otp: otp });

      if (details) {
        if (details.expires > new Date().getTime()) {
          await User.findByIdAndUpdate(userId, {
            $set: { otp: 0, expires: 0, is_email_Verified: true },
          });

          return res.status(200).json({
            status: true,
            code: 200,
            message: "email verified successfully",
          });
        } else {
          return res.status(401).json({
            status: false,
            code: 401,
            message: "otp is expired",
          });
        }
      } else {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "OTP Does Not Match",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async ForgotPassword(req, res, next) {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Please fill all the required field",
        });
      }

      let user = await User.findOne({ email }).lean();

      if (!user) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: "Email does not exists",
        });
      }

      const otp = generateRandomNumber();
      const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            otp: otp,
            expires: expires,
          },
        }
      ).lean();
      await sendMail({
        email: email,
        subject: "OTP for reset Password",
        template: "otp-mail.ejs",
        data: {
          name: user.name ? user.name : "USER",
          otp: otp,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "OTP send to your mail...",
        data: { _id: user._id },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async VerifyOtpBeforeResetPassword(req, res, next) {
    try {
      const userId = req.body._id;
      const otp = req.body.otp;

      if (!userId || !otp) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Not getting details",
        });
      }

      let user = await User.findById(userId).lean();

      if (!user) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: "User does not exist",
        });
      }

      if (user.role !== "ADMIN") {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "Not Authorized",
        });
      }

      const details = await User.findOne({ _id: userId, otp: otp });
      if (details) {
        if (details.expires > new Date().getTime()) {
          await User.findByIdAndUpdate(userId, {
            $set: { otp: 0, expires: 0 },
          });

          const jwtToken = await signJwt({ _id: user._id, email: user.email, role: user.role });
          return res.status(200).json({
            status: true,
            code: 200,
            message: "otp verified successfully",
            data: { token: jwtToken },
          });
        } else {
          return res.status(401).json({
            status: false,
            code: 401,
            message: "otp is expired",
          });
        }
      } else {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "OTP Does Not Match",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async UpdatePassword(req, res, next) {
    try {
      const email = req.authData.email;
      const userId = req.authData._id;
      const password = req.body.password;
      let user = await User.findById(userId).lean();

      if (!user) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: "User does not exist",
        });
      }
      if (user.role === "AGENT") {
        return res.status(401).json({
          status: true,
          code: 401,
          message: "You are not authorized",
        });
      }
      const encryptedPassword = await bcrypt.hash(password, 10);
      user = await User.findByIdAndUpdate(userId, {
        $set: {
          password: encryptedPassword,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Password Updated Successfully...",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async resendOTP(req, res, next) {
    try {
      const userId = req.authData._id;
      if (!userId) {
        return res.status(402).json({
          status: false,
          code: 402,
          message: "Something went wrong!!",
        });
      }
      const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
      const otp = generateRandomNumber();
      let user = await User.findByIdAndUpdate(userId, {
        $set: {
          otp,
          expires,
        },
      }).lean();

      await sendMail({
        email: user.email,
        subject: "OTP For Validating Email",
        template: "otp-mail.ejs",
        data: {
          name: user.name ? user.name : "USER",
          otp: otp,
        },
      });

      if (!user) {
        return res.status(402).json({
          status: false,
          code: 402,
          message: "Something went wrong!!",
        });
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "otp is send to your email successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async getAvgCallTime(req, res, next) {

    try {
      const admin_Id = req.authData?.admin_id || "656f0c455589a45cbf4a1f51";

      // Total Today Calls
      const currentDate = JSON.stringify(new Date()).split("T")[0].slice(1);
      const incommingCallsToday = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id) ,call_date: currentDate, type: "Inbound" });
      const outgoingCallsToday = await CallDetail.countDocuments({ admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, type: "Outbound" });


      // Total Calls
      const incommingCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, type: "Inbound" });
      const outgoingCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, type: "Outbound" });

      // Missed Calls
      const missedCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), dial_status: "Diconnected", type: "Inbound" });

      // Abandoned Calls
      const abandonedCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), dial_status: "Diconnected", type: "Outbound" });

      // Reservation Calls
      const reservationCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, department: "RESERVATION" });
      const reservationIncommingCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, type: "Inbound", department: "RESERVATION" });
      const reservationOutgoingCalls = await CallDetail.countDocuments({admin_id : new mongoose.Types.ObjectId(admin_Id), call_date: currentDate, type: "Outbound", department: "RESERVATION" });

      // Average number of min
      // const avgCallTimeIncoming = await CallDetail.aggregate([
      //   {
      //     $match: {
      //       admin_id : new mongoose.Types.ObjectId(admin_Id),
      //       type: "Inbound",
      //       talktime: { $exists: true },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       avgCallTime: { $avg: "$talktime" },
      //     },
      //   },
      // ]);

      // const avgCallTimeOutgoing = await CallDetail.aggregate([
      //   {
      //     $match: {
      //       admin_id : new mongoose.Types.ObjectId(admin_Id),
      //       type: "Outbound",
      //       talktime: { $exists: true },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       avgCallTime: { $avg: "$talktime" },
      //     },
      //   },
      // ]);
      



      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          // {
          //   type: "Average Call Time",
          //   avgCallTimeIncoming: convertMinutesToTime(avgCallTimeIncoming[0]?.avgCallTime || 0),
          //   avgCallTimeOutgoing: convertMinutesToTime(avgCallTimeOutgoing[0]?.avgCallTime || 0),
          // },
          {
            type: "Calls Today",
            totalCalls: incommingCallsToday + outgoingCallsToday,
            Inbound: incommingCallsToday,
            Outbound: outgoingCallsToday
          },
          {
            type: "Total Calls",
            totalCalls: incommingCalls + outgoingCalls,
            Inbound: incommingCalls,
            Outbound: outgoingCalls
          },
          {
            type: "Missed Calls",
            missedCalls: missedCalls,
          },
          {
            type: "Abandoned Calls",
            abandonedCalls: abandonedCalls,
          },
          {
            type: "Reservation Calls",
            reservationCalls: reservationCalls,
            reservationIncommingCalls : reservationIncommingCalls,
            reservationOutgoingCalls : reservationOutgoingCalls
          }
        ]
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }


  static async verificationAdmin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email && !password) {
        return res.status(422).json({
          status: false,
          code: 422,
          message: "Please fill all the required field",
        });
      }
      let findUser = await User.findOne({ email }).lean();
      if (!findUser) {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "Email did not match!!",
        });
      }
      let validPassword = await bcrypt.compare(password, findUser.password);
      if (!validPassword) {
        return res.status(410).json({
          status: false,
          code: 410,
          message: "Password did not match!!",
        });
      }

      if (
        findUser.is_verified === false ||
        findUser.is_email_Verified === false ||
        findUser.status === "INACTIVE"
      ) {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "You are not allowed to login",
        });
      }

      if (findUser.role === "AGENT") {
        const data = {
          agent_id: findAgent.length + 1 || 1,
          agent_text: req.query.ext_name,
        };

        const options = {
          method: "POST",
          url: BASE_URL + "/agentlogin",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: process.env.API_KEY,
          },
          data: data,
        };
        const apiResponse = await new Promise(async (resolve, reject) => {
          axios
            .request(options)
            .then(function (response1) {
              resolve(response1.data);
              return response;
            })
            .catch(function (error) {
              reject(error);
              return response;
            });
        });
      }
      // TODO :

      const { _id, role } = findUser;
      const jwtToken = await signJwt({ _id, email, role });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Login Successfully",
        token: jwtToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
}

export default AdminModel;
