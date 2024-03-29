import User from "../model/User.js";
import { generateRandomNumber } from "../utils/generatePassword.js";
import { randomString } from "../middleware/custom.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from "axios";
import { signJwt } from "../middleware/auth.js";
import { sendMail } from "../utils/sendMail.js";
import ErrorHandler from "../utils/errorHandler.js";
import callDetail from "../model/callDetails.js";
import login_logout from "../model/LoginAndLogOut.js";
import CallDetail from "../model/callDetails.js";
import mongoose, { Mongoose } from "mongoose";
import dispositions from "../model/Disposition.js";
import { formatTime } from "../utils/formattime.js";
import JWT from "jsonwebtoken";
import departments from "../model/department.js";
import designations from "../model/designation.js";
import hotel from "../model/hotels.js";
import Guest from "../model/Guest.js";
import Disposition from "../model/Disposition.js";
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

      if (findUser.role === "AGENT") {
        const log_in_time = new Date();
        const formattedDate = `${log_in_time.getFullYear()}-${(
          log_in_time.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${log_in_time
          .getDate()
          .toString()
          .padStart(2, "0")} ${log_in_time
          .getHours()
          .toString()
          .padStart(2, "0")}:${log_in_time
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${log_in_time
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;

        await login_logout.updateOne(
          { agent_id: findUser._id },
          {
            $push: {
              log_in_log_out_time: {
                $each: [{ log_in_time: formattedDate, log_out_time: "" }],
                $position: 0,
              },
            },
          },
          { upsert: true }
        );
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
      }
      // TODO :

      const _id = findUser._id;
      const role = findUser.role;
      const name = findUser.name;
      const org_logo = findUser?.org_logo;
      const org_name = findUser?.org_name;
      const profile_pic = findUser?.profile_pic;

      let payload = { _id, role, name, email, org_name, org_logo, profile_pic };
      if (findUser.role === "AGENT") {
        payload.admin_id = findUser.created_by;

        const data = await User.findOne({ email: email });
        const result = await User.findById({
          _id: new mongoose.Types.ObjectId(data.created_by),
        });

        (payload.org_logo = result.org_logo),
          (payload.org_name = result.org_name);
      }

      const jwtToken = await signJwt(payload);

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

  //
  static async AddUser(req, res, next) {
    try {
      if (req.authData.role === "ADMIN") {
        let email = req.body.email;
        let name = req.body.name;
        let gender = req.body.gender;
        let dob = req.body.dob;
        let phone_number = req.body.phone_number;
        let password = req.body.password;
        let designation = req.body.designation;
        let department = req.body.department;
        let profile_pic = req.body.profile_pic;

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
            designation: designation,
            department: department,
            profile_pic: profile_pic,
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
      const name = req.body.name;
      const password = req.body.password;
      const phone_number = req.body.phone_number;
      const dob = req.body.dob;
      const gender = req.body.gender;
      const org_name = req.body.org_name;
      const org_logo = req.body.org_logo;
      const profile_pic = req.body.profile_pic;

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
        name: name,
        gender: gender,
        password: encryptedPassword,
        otp: otp,
        expires: expires,
        org_name: org_name,
        org_logo: org_logo,
        profile_pic: profile_pic,
        is_verified: true, // This is on hold after that superAdmin will verify Admin
      });
      const { _id } = user;
      const jwtToken = await signJwt({
        _id,
        email,
        org_name,
        org_logo,
        profile_pic,
      });

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
      const otp = +req.body.otp;

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
        data: { _id: user._id, email: user.email },
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

          //const jwtToken = await signJwt({ _id: user._id, email: user.email, role: user.role });
          const jwtToken = await signJwt({
            _id: user._id,
            email: user.email,
            role: user.role,
          });
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

  // resend otp in login

  static async resendOTPForLogin(req, res, next) {
    try {
      const { email } = req.body;
      const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
      const otp = generateRandomNumber();
      let user = await User.updateOne(
        { email: email },
        {
          $set: {
            otp,
            expires,
          },
        }
      ).lean();

      await sendMail({
        email: email,
        subject: "OTP For Validating Email",
        template: "otp-mail.ejs",
        data: {
          otp: otp,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "otp is send to your email successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async getAgentStats(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      // Total Today Calls
      const currentDate = JSON.stringify(new Date()).split("T")[0].slice(1);
      const incommingCallsToday = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        call_date: currentDate,
        type: "Inbound",
      });
      const outgoingCallsToday = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        call_date: currentDate,
        type: "Outbound",
      });

      // Total Calls
      const incommingCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
      });
      const outgoingCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Outbound",
      });

      // Missed Calls
      const missedCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Disconnected",
        type: "Inbound",
      });

      // Abandoned Calls
      const abandonedCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Disconnected",
        type: "Outbound",
      });

      // Reservation Calls Today
      const reservationCallsToday = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        call_date: currentDate,
        department: "RESERVATION",
      });
      const reservationIncommingCallsToday = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        call_date: currentDate,
        type: "Inbound",
        department: "RESERVATION",
      });
      const reservationOutgoingCallsToday = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        call_date: currentDate,
        type: "Outbound",
        department: "RESERVATION",
      });

      // Reservation Calls
      const reservationCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        department: "RESERVATION",
      });
      const reservationIncommingCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
        department: "RESERVATION",
      });
      const reservationOutgoingCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Outbound",
        department: "RESERVATION",
      });

      // No Answer
      const noAnswer = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Disconnected",
        type: "Inbound",
      });

      const totalReservation = await CallDetail.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            department: "RESERVATION",
          },
        },
      ]);

      const totalClosedCalls = await CallDetail.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            department: "RESERVATION",
          },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition_name",
          },
        },
        {
          $unwind: {
            path: "$disposition_name",
            preserveNullAndEmptyArrays: false,
          },
        },
      ]);

      let conversionRate = (totalClosedCalls / totalReservation) * 100 || 0;

      //Average number of min
      const CallTimeIncoming = await CallDetail.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            type: "Inbound",
            talktime: { $exists: true },
          },
        },
      ]);
      const CallTimeOutgoing = await CallDetail.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            type: "Outbound",
            talktime: { $exists: true },
          },
        },
      ]);

      const CallTimeTotal = await CallDetail.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),

            talktime: { $exists: true },
          },
        },
      ]);

      let sumCallTimeOutgoing = 0;
      let totalTime = 0;

      await Promise.all(
        CallTimeOutgoing.map((data) => {
          if (data.talktime) {
            sumCallTimeOutgoing =
              sumCallTimeOutgoing +
              parseInt(data.talktime.split(":")[0]) * 3600 +
              parseInt(data.talktime.split(":")[1]) * 60 +
              parseInt(data.talktime.split(":")[2]);
          }
        })
      );

      await Promise.all(
        CallTimeTotal.map((data) => {
          if (data.talktime) {
            totalTime =
              totalTime +
              parseInt(data.talktime.split(":")[0]) * 3600 +
              parseInt(data.talktime.split(":")[1]) * 60 +
              parseInt(data.talktime.split(":")[2]);
          }
        })
      );

      let sumCallTimeIncoming = 0;
      await Promise.all(
        CallTimeIncoming.map((data) => {
          if (data.talktime) {
            sumCallTimeIncoming =
              sumCallTimeIncoming +
              parseInt(data.talktime.split(":")[0]) * 3600 +
              parseInt(data.talktime.split(":")[1]) * 60 +
              parseInt(data.talktime.split(":")[2]);
          }
        })
      );

      const avgCallTimeIncoming = sumCallTimeIncoming / CallTimeIncoming.length;
      const avgCallTimeOutgoing = sumCallTimeOutgoing / CallTimeOutgoing.length;
      const totalTimee = totalTime / CallTimeTotal.length;

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          {
            type: "Total Calls",
            totalCalls: incommingCalls + outgoingCalls,
            Inbound: incommingCalls,
            Outbound: outgoingCalls,
          },
          {
            type: "Average Call Time",
            avgCallTimeOutgoing: formatTime(avgCallTimeOutgoing),
            avgCallTimeIncoming: formatTime(avgCallTimeIncoming),
          },
          {
            type: "Average Wrap Time",
            totalTime: formatTime(totalTimee),
          },
          {
            type: "Avg Conversion Rate",
            avgConversionRate: 0,
          },
          {
            type: "Conversion Rate",
            noAnswer: conversionRate,
          },
          {
            type: "Calls Today",
            totalCalls: incommingCallsToday + outgoingCallsToday,
            Inbound: incommingCallsToday,
            Outbound: outgoingCallsToday,
          },

          {
            type: "Missed Calls",
            missedCalls: missedCalls,
          },

          {
            type: "Reservation Calls Today",
            reservationCallsToday: reservationCallsToday,
            reservationIncommingCalls: reservationIncommingCalls,
            reservationOutgoingCallsToday: reservationOutgoingCallsToday,
          },
          // {
          //   type: "Reservation Calls",
          //   reservationCalls: reservationCalls,
          //   reservationIncommingCallsToday: reservationIncommingCallsToday,
          //   reservationOutgoingCalls: reservationOutgoingCalls,
          // },
          {
            type: "Abandoned Calls",
            abandonedCalls: abandonedCalls,
          },
          {
            type: "No Answer",
            noAnswer: noAnswer,
          },
        ],
      });
    } catch (error) {
      console.log(error);
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

  static async CallsMonthBarGraph(req, res, next) {
    try {
      const admin_id = req.authData?._id;
      let currentDate = req.query.date ? new Date(req.query.date) : new Date();
      let result = [];
      for (let i = 0; i < 7; i++) {
        let firstDayOfMonth;
        let lastDayOfMonth;

        if (req.query.type === "MONTH") {
          firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i + 1,
            0
          );
        } else if (req.query.type === "WEEK") {
          firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - i * 7 - currentDate.getDay()
          );
          lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - i * 7 - currentDate.getDay() + 6,
            23,
            59,
            59,
            999
          );
        } else if (req.query.type === "DAYS") {
          // firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i);
          lastDayOfMonth = new Date(
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() - i,
              23,
              59,
              59,
              999
            ).setUTCHours(11, 59, 59, 0)
          );
          firstDayOfMonth = new Date(
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() - i
            ).setUTCHours(11, 59, 59, 0)
          );
        } else {
          firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i + 1,
            0
          );
        }

        let pipeline = [
          {
            $match: {
              admin_id: new mongoose.Types.ObjectId(admin_id),
            },
          },
          {
            $match: {
              $and: [
                {
                  call_date: {
                    $gt: JSON.stringify(firstDayOfMonth).split("T")[0].slice(1),
                  },
                },
                {
                  call_date: {
                    $lte: JSON.stringify(lastDayOfMonth).split("T")[0].slice(1),
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ];

        if (req.query.hotel_destination) {
          pipeline.unshift({
            $match: {
              hotel_destination: req.query.hotel_destination,
            },
          });
        }

        if (req.query.hotel_name) {
          pipeline.unshift({
            $match: {
              hotel_name: req.query.hotel_name,
            },
          });
        }
        const d = await CallDetail.aggregate(pipeline);
        if (req.query.type === "WEEK") {
          result.push({
            type: lastDayOfMonth.toLocaleString("default", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            count: d[0]?.count || 0,
          });
        } else if (req.query.type === "DAYS") {
          result.push({
            type: lastDayOfMonth.toLocaleString("default", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            count: d[0]?.count || 0,
          });
        } else {
          result.push({
            type: lastDayOfMonth.toLocaleString("default", { month: "short" }),
            count: d[0]?.count || 0,
          });
        }
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data Fetched successfully",
        data: result.reverse(),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  // static async getDisposition(req, res, next) {
  //   let findDisposition = await dispositions.find({});

  //   if (!findDisposition) {
  //     return res.status(401).json({
  //       status: false,
  //       code: 401,
  //       message: "Data not found",
  //       data: result.reverse(),
  //     });
  //   }

  //   return res.status(200).json({
  //     status: true,
  //     code: 200,
  //     message: "Data Fetched successfully",
  //     data: findDisposition,
  //   });
  // }

  static async getDisposition1(req, res, next) {
    // let findDisposition = await dispositions.find({});
    let findDisposition = await dispositions.find({
      name: { $nin: ["Spam", "Cancellation"] },
    });

    if (!findDisposition) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: "Data not found",
      });
    }
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Data Fetched successfully",
      data: findDisposition,
    });
  }

  static async CallsCurrentDate(req, res, next) {
    try {
      const admin_id = req.authData?._id;
      let pipeline = [
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_id),
          },
        },
        {
          $match: {
            call_date: JSON.stringify(new Date()).split("T")[0].slice(1),
          },
        },
        {
          $lookup: {
            from: "guest_details",
            localField: "guest_id",
            foreignField: "_id",
            as: "guest",
          },
        },
        {
          $unwind: { path: "$guest", preserveNullAndEmptyArrays: false },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition_details",
          },
        },
        {
          $unwind: {
            path: "$disposition_details",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "disposition_details.name": "Reservation",
          },
        },
        {
          $addFields: {
            startDate: {
              $dateFromString: {
                dateString: "$arrival_date",
              },
            },
            endDate: {
              $dateFromString: {
                dateString: "$departure_date",
              },
            },
          },
        },
        {
          $addFields: {
            noOfNights: {
              $divide: [
                {
                  $subtract: ["$endDate", "$startDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $project: {
            hotel_name: 1,
            guest_first_name: "$guest.guest_first_name",
            guest_last_name: "$guest.guest_last_name",
            noOfNights: 1,
          },
        },
      ];

      if (req.query.hotel_name) {
        pipeline.unshift({
          $match: {
            hotel_name: req.query.hotel_name,
          },
        });
      }

      const data = await CallDetail.aggregate(pipeline);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data Fetched successfully",
        data: data,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async AllTimePerFormer(req, res, next) {
    try {
      const admin_id = req.authData?._id;
      let pipeline = [
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_id),
          },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition_details",
          },
        },
        {
          $match: {
            "disposition_details.name": "Reservation",
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "agent_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $group: {
            _id: "$user._id",
            name: { $first: "$user.name" },
            count: { $sum: 1 },
          },
        },
      ];

      if (req.query.hotel_name) {
        pipeline.unshift({
          $match: {
            hotel_name: req.query.hotel_name,
          },
        });
      }

      const data = await CallDetail.aggregate(pipeline);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data Fetched successfully",
        data: data,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async TodayPerFormer(req, res, next) {
    try {
      const admin_id = req.authData?._id;
      let pipeline = [
        {
          $match: {
            call_date: JSON.stringify(new Date()).split("T")[0].slice(1),
          },
        },
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_id),
          },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition_details",
          },
        },
        {
          $match: {
            "disposition_details.name": "Reservation",
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "agent_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $group: {
            _id: "$user._id",
            name: { $first: "$user.name" },
            count: { $sum: 1 },
          },
        },
      ];

      if (req.query.hotel_name) {
        pipeline.unshift({
          $match: {
            hotel_name: req.query.hotel_name,
          },
        });
      }

      const data = await CallDetail.aggregate(pipeline);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data Fetched successfully",
        data: data,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async CallDetailAll(req, res, next) {
    try {
      let condition = [
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        },

        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition",
          },
        },
        {
          $unwind: "$disposition",
        },
      ];

      if (req.query.type) {
        condition.push({
          $match: {
            type: req.query.type,
          },
        });
      }

      let findCalls = await CallDetail.aggregate(condition);
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: findCalls,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async AgentList(req, res, next) {
    try {
      let pipeline = [
        {
          $match: {
            created_by: new mongoose.Types.ObjectId(req.authData._id),
            displayStatus: "1",
          },
        },
      ];

      if (req.query.status) {
        pipeline.push({
          $match: {
            status: req.query.status,
          },
        });
      }

      pipeline.push({
        $sort: {
          _id: 1,
        },
      });

      let data = await User.aggregate(pipeline);
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details Fetched Successfully....",
        data: data.reverse(),
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async getAllCallList(req, res, next) {
    try {
      const admin_id = req.authData._id;

      let pipeline = [];

      pipeline.push(
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_id),
          },
        },
        {
          $lookup: {
            from: "hotels",
            localField: "hotel_name",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $unwind: "$hotel_details",
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "disposition",
          },
        },
        {
          $unwind: "$disposition",
        }
      );

      if (req.query.type) {
        pipeline.push({
          $match: {
            type: req.query.type,
          },
        });
      }

      if (req.query.from && req.query.to) {
        // Parse the date strings to JavaScript Date objects
        const fromDate = new Date(req.query.from);
        const toDate = new Date(req.query.to);

        // Format the dates to yyyy-mm-dd format
        const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];

        // Add a $match stage to filter by date range
        pipeline.push({
          $match: {
            call_date: {
              $gte: formattedFromDate,
              $lte: formattedToDate,
            },
          },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: "guest_details",
            localField: "guest_id",
            foreignField: "_id",
            as: "guest",
          },
        },
        {
          $unwind: {
            path: "$guest",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "agent_id",
            foreignField: "_id",
            as: "agent",
          },
        },
        {
          $unwind: {
            path: "$agent",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id: 1,
            talktime: 1,
            start_time: 1,
            end_time: 1,
            call_date: 1,
            remark: 1,
            hotel_name: "$hotel_details.hotel_name",
            guest_first_name: "$guest.guest_first_name",
            guest_last_name: "$guest.guest_last_name",
            caller_id: "$guest.guest_mobile_number",
            location: "$hotel_destination",
            agent_name: "$agent.name",
            dispositionName: "$disposition.name",
            type: 1,
            agent_id: "$agent._id",
            last_support_by: 1,
          },
        }
      );

      const data = await CallDetail.aggregate(pipeline);
      return res.status(200).json({
        status: false,
        code: 200,
        message: "Data Fetched Successfully",
        data: data.reverse(),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async getAllGuestListAdmin(req, res, next) {
    let pipeline = [
      {
        $group: {
          _id: "$guest_id",
          items: { $push: "$$ROOT" },
        },
      },
      {
        $sort: {
          // "items.createdAt" : -1
          call_date: -1,
        },
      },
      {
        $project: {
          guest_id: "$_id",
          last_call: { $arrayElemAt: ["$items", 0] },
          second_last_call: { $arrayElemAt: ["$items", 1] },
        },
      },
      {
        $lookup: {
          from: "guest_details",
          localField: "guest_id",
          foreignField: "_id",
          as: "guest",
        },
      },
      {
        $unwind: {
          path: "$guest",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          agent_id: "$guest.agent_id",
          guest_id: 1,
          last_call: 1,
          second_last_call_agent_id: "$second_last_call.agent_id",
          guest: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "agent_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: {
          path: "$agent",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "second_last_call_agent_id",
          foreignField: "_id",
          as: "second_last_call_agent",
        },
      },
      {
        $unwind: {
          path: "$second_last_call_agent",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          guest_id: 1,
          guest_first_name: "$guest.guest_first_name",
          guest_last_name: "$guest.guest_last_name",
          guest_email: "$guest.guest_email",
          guest_mobile_number: "$guest.guest_mobile_number",
          disposition_last_call: "$last_call.last_call",
          last_call_date: "$last_call.call_date",
          location: "$guest.location", // TODO
          last_support_by: "$last_call.last_support_by",
          agent_name: "$agent.name",
          agent_id: 1,
          second_last_call_agent_name: "$second_last_call_agent.name",
        },
      },
    ];

    const data = await callDetail.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      code: 200,
      data,
    });
  }

  // admin leads
  static async Leads(req, res, next) {
    let findCalls;

    if (req.authData.role === "ADMIN") {
      const adminId = req.authData._id;
      const { from, to } = req.query;
      let pipeline = [
        {
          $match: {
            created_by: new mongoose.Types.ObjectId(adminId),
          },
        },
        {
          $addFields: {
            agentName: "$name",
          },
        },
        {
          $lookup: {
            from: "guest_details",
            localField: "_id",
            foreignField: "agent_id",
            as: "guests",
          },
        },
        {
          $unwind: "$guests",
        },
        {
          $match: {
            ...(from && to
              ? {
                  "guests.date": {
                    $gte: from,
                    $lte: to,
                  },
                }
              : {}),
          },
        },
        {
          $lookup: {
            from: "calling_details",
            localField: "guests._id",
            foreignField: "guest_id",
            as: "calls",
          },
        },
        {
          $unwind: "$calls",
        },
        {
          $lookup: {
            from: "hotels",
            localField: "calls.hotel_name",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $unwind: "$hotel_details",
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "calls.disposition",
            foreignField: "_id",
            as: "dispositionDetails",
          },
        },
        {
          $unwind: "$dispositionDetails",
        },
        {
          $sort: { "calls.call_date": -1 },
        },
        {
          $group: {
            _id: "$calls.guest_id",
            calls: { $first: "$calls" },
            guest: { $first: "$guests" },
            agentName: { $first: "$agentName" },
            hotelName: { $first: "$hotel_details.hotel_name" },
            dispositionName: { $first: "$dispositionDetails.name" },
            // Add other fields you want to include in the grouping
          },
        },
      ];

      try {
        findCalls = await User.aggregate(pipeline);
        return res.status(200).json({
          success: true,
          code: 200,
          data: findCalls.reverse(),
        });
      } catch (err) {
        // Handle error appropriately
        return res.status(500).json({
          success: false,
          code: 500,
          error: err.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "You are not authorized to access this data",
      });
    }
  }

  static async addDisposition(req, res, next) {
    try {
      const _id = req.authData._id;
      if (
        !req.body.display_status &&
        !req.body._id &&
        req.authData.role === "ADMIN"
      ) {
        const disposition = dispositions.create({
          name: req.body.name,
          label_color: req.body.label_color,
          priority: req.body.priority,
          short_code: req.body.short_code,
          addedBy: new Object(_id),
        });

        return res.status(200).json({
          success: true,
          code: 200,
          message: "Data Added",
          data: disposition,
        });
      } else if (req.body._id && req.authData.role === "ADMIN") {
        try {
          const update = await dispositions.updateOne(
            { _id: new mongoose.Types.ObjectId(req.body._id) },
            {
              $set: {
                display_status: req.body.display_status,
                name: req.body.name,
                label_color: req.body.label_color,
                priority: req.body.priority,
                short_code: req.body.short_code,
              },
            }
          );
          if (update) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: "Details updated...",
            });
          } else {
            return res.status(500).json({
              success: false,
              code: 500,
              message: "Something wrong",
            });
          }
        } catch (err) {
          return res.status(500).json({
            success: false,
            code: 500,
            error: err.message,
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async addDepartment(req, res, next) {
    try {
      const _id = req.authData._id;
      if (
        !req.body.display_status &&
        !req.body._id &&
        req.authData.role === "ADMIN"
      ) {
        const department = departments.create({
          department_name: req.body.department_name,
          short_code: req.body.short_code,
          addedBy: new Object(_id),
        });

        return res.status(200).json({
          success: true,
          code: 200,
          message: "Data added",
          data: department,
        });
      }
      if (req.body._id && req.authData.role === "ADMIN") {
        try {
          const update = await departments.updateOne(
            { _id: new mongoose.Types.ObjectId(req.body._id) },
            {
              $set: {
                display_status: req.body.display_status,
                department_name: req.body.department_name,
                short_code: req.body.short_code,
              },
            }
          );

          if (update) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: "Details updated...",
            });
          } else {
            return res.status(500).json({
              success: false,
              code: 500,
              message: "Something wrong",
            });
          }
        } catch (err) {
          return res.status(500).json({
            success: false,
            code: 500,
            error: err.message,
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async addDesignation(req, res, next) {
    try {
      const _id = req.authData._id;
      if (
        !req.body.display_status &&
        !req.body._id &&
        req.authData.role === "ADMIN"
      ) {
        const designation = designations.create({
          designation: req.body.designation,
          short_code: req.body.short_code,
          addedBy: new Object(_id),
        });

        return res.status(200).json({
          success: true,
          code: 200,
          message: "Data added..",
          data: designation,
        });
      } else if (req.body._id && req.authData.role === "ADMIN") {
        try {
          const update = await designations.updateOne(
            { _id: new mongoose.Types.ObjectId(req.body._id) },
            {
              $set: {
                display_status: req.body.display_status,
                designation: req.body.designation,
                short_code: req.body.short_code,
              },
            }
          );
          if (update) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: "Details updated...",
            });
          } else {
            return res.status(500).json({
              success: false,
              code: 500,
              message: "Something wrong",
            });
          }
        } catch (err) {
          return res.status(500).json({
            success: false,
            code: 500,
            error: err.message,
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async addHotel(req, res, next) {
    try {
      const _id = req.authData._id;
      if (
        !req.body.display_status &&
        !req.body._id &&
        req.authData.role === "ADMIN"
      ) {
        const hotels = hotel.create({
          hotel_name: req.body.hotel_name,
          hotel_city: req.body.hotel_city,
          pin_code: req.body.pin_code,
          short_code: req.body.short_code,
          addedBy: new Object(_id),
        });

        return res.status(200).json({
          success: true,
          code: 200,
          data: hotels,
        });
      } else if (req.body._id && req.authData.role === "ADMIN") {
        try {
          const update = await hotel.updateOne(
            { _id: new mongoose.Types.ObjectId(req.body._id) },
            {
              $set: {
                display_status: req.body.display_status,
                hotel_name: req.body.hotel_name,
                hotel_city: req.body.hotel_city,
                pin_code: req.body.pin_code,
                short_code: req.body.short_code,
              },
            }
          );

          if (update) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: "Details updated...",
            });
          } else {
            return res.status(500).json({
              success: false,
              code: 500,
              message: "Something wrong",
            });
          }
        } catch (err) {
          return res.status(500).json({
            success: false,
            code: 500,
            error: err.message,
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async getDepartMent(req, res, next) {
    try {
      const _id = req.authData._id;

      const all_department = await departments
        .find({ display_status: "1" })
        .lean();

      const department = [];

      if (all_department && req.authData.role === "AGENT") {
        await Promise.all(
          all_department.map(async (item) => {
            const exist = await User.findOne({
              _id: new mongoose.Types.ObjectId(_id),
              created_by: new mongoose.Types.ObjectId(item.addedBy),
            });
            if (exist && req.authData.role === "AGENT") {
              department.push(item);
            }
          })
        );
      } else if (req.authData.role === "ADMIN") {
        const all_department = await departments
          .find({
            display_status: "1",
            addedBy: new mongoose.Types.ObjectId(_id),
          })
          .lean();
        department.push(all_department);
        return res.status(200).json({
          success: true,
          code: 200,
          data: [].concat(...department),
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        data: department,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async getDisposition(req, res, next) {
    try {
      const _id = req.authData._id;
      const all_disposition = await dispositions
        .find({ display_status: "1" })
        .lean();
      const disposition = [];

      if (all_disposition && req.authData.role === "AGENT") {
        await Promise.all(
          all_disposition.map(async (item) => {
            try {
              const userId = new mongoose.Types.ObjectId(_id);
              const addedById = new mongoose.Types.ObjectId(item.addedBy);

              const exist = await User.findOne({
                _id: userId,
                created_by: addedById,
              });

              if (exist) {
                disposition.push(item);
              }
            } catch (error) {
              // console.error("Error creating ObjectId:", error);
              // Handle the error or log it accordingly
            }
          })
        );
      } else if (req.authData.role === "ADMIN") {
        const all_department = await dispositions
          .find({
            display_status: "1",
            addedBy: new mongoose.Types.ObjectId(_id),
          })
          .lean();
        disposition.push(all_department);
        return res.status(200).json({
          success: true,
          code: 200,
          data: [].concat(...disposition),
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        data: disposition,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async getDesignation(req, res, next) {
    try {
      const _id = req.authData._id;
      const all_designation = await designations
        .find({ display_status: "1" })
        .lean();
      const designation = [];

      if (all_designation && req.authData.role === "AGENT") {
        await Promise.all(
          all_designation.map(async (item) => {
            const exist = await User.findOne({
              _id: new mongoose.Types.ObjectId(_id),
              created_by: new mongoose.Types.ObjectId(item.addedBy),
            });
            if (exist && req.authData.role === "AGENT") {
              designation.push(item);
            }
          })
        );
      } else if (req.authData.role === "ADMIN") {
        const all_designation = await designations
          .find({
            display_status: "1",
            addedBy: new mongoose.Types.ObjectId(_id),
          })
          .lean();
        designation.push(all_designation);
        return res.status(200).json({
          success: true,
          code: 200,
          data: [].concat(...designation),
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        data: designation,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async getHotel(req, res, next) {
    try {
      const _id = req.authData._id;
      const all_hotel = await hotel.find({ display_status: "1" }).lean();
      const hotels = [];

      if (all_hotel && req.authData.role === "AGENT") {
        await Promise.all(
          all_hotel.map(async (item) => {
            const exist = await User.findOne({
              _id: new mongoose.Types.ObjectId(_id),
              created_by: new mongoose.Types.ObjectId(item.addedBy),
            });
            if (exist && req.authData.role === "AGENT") {
              hotels.push(item);
            }
          })
        );
      } else if (req.authData.role === "ADMIN") {
        const all_hotel = await hotel
          .find({
            display_status: "1",
            addedBy: new mongoose.Types.ObjectId(_id),
          })
          .lean();
        hotels.push(all_hotel);
        return res.status(200).json({
          success: true,
          code: 200,
          data: [].concat(...hotels),
        });
      }

      return res.status(200).json({
        success: true,
        code: 200,
        data: hotels,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        error: err.message,
      });
    }
  }

  static async agentLogout(req, res) {
    try {
      let agentId = req.query.agent_id;

      if (!req.query.agent_id) {
        return res.status(400).json({
          success: false,
          code: 400,
          error: "Please enter agent_id",
        });
      }

      const getAgentRecord = await login_logout
        .findOne({
          agent_id: agentId,
        })
        .select("log_in_log_out_time agent_id");

      let foundObj = (getAgentRecord.log_in_log_out_time[0].log_out_time =
        new Date());
      await getAgentRecord.save();

      return res.status(200).json({
        success: true,
        code: 200,
        message: "Logout successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        code: 500,
        error: error.message,
      });
    }
  }

  static async addData(req, res, next) {
    try {
      // const _id = req.authData._id;

      if (!req.authData.role === "ADMIN") {
        return res.status(404).json({
          success: false,
          code: 404,
          message: "you are not allowed to access this",
        });
      }
      function convertNumericToDateTime(numericValue) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
        const epochStart = Date.UTC(1970, 0, 1); // Epoch start in milliseconds
      
        // Calculate milliseconds since epoch
        const millisecondsSinceEpoch = numericValue * millisecondsPerDay;
      
        // Calculate total milliseconds since epoch
        const totalMilliseconds = epochStart + millisecondsSinceEpoch;
      
        // Create a new Date object using total milliseconds
        const dateTime = new Date(totalMilliseconds);
      
        // Extract date and time components
        const year = dateTime.getUTCFullYear();
        const month = ('0' + (dateTime.getUTCMonth() + 1)).slice(-2);
        const day = ('0' + dateTime.getUTCDate()).slice(-2);
        const hours = ('0' + dateTime.getUTCHours()).slice(-2);
        const minutes = ('0' + dateTime.getUTCMinutes()).slice(-2);
        const seconds = ('0' + dateTime.getUTCSeconds()).slice(-2);
      
        // Format the date and time string
        const dateString = `${year-70}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
        return dateString;
      }
      function isValidNumber(number) {
        const numberString = number.toString();
        return numberString.startsWith("91") && numberString.length === 12;
      }

      const data = req.body.json;

      let promise = data.map(async (item) => {
        let agent;
        if (item.agentName) {
          agent = await User.findOne({ name: item.agentID });
        }
        const agentId = agent?._id;
        const hotels = await hotel.findOne({ hotel_name: item?.hotelName });
        const hotelId = hotels?._id;
        const lastRecord = await callDetail
          .findOne({ guest_id: agent?._id })
          .sort({ _id: -1 });
        const disposition = await Disposition.findOne({
          name: item?.callDisposition,
        });
        let date = convertNumericToDateTime(item?.RecordDate)

        const GuestData = await Guest.findOne({
          guest_mobile_number: item?.phoneNumber,
        });

        if (GuestData) {
          const newRecord = new callDetail({
            guest_id: GuestData?._id,
            agent_id: agentId,
            admin_id: agent?.created_by,
            guest_mobile_number: item?.phoneNumber,
            hotel_name: hotelId,
            disposition: disposition?._id,
            caller_type: item?.callerType,
            purpose_of_travel: item?.purposeOfTravel,
            arrival_date: item?.arrivalDate,
            departure_date: item?.departureDate,
            call_back_date_time: item?.followUpDateTime,
            remark: item?.remark,
            call_date:
              item?.RecordDate &&
              date.split(" ")[0] || "N/A",
            call_time:
              item?.RecordDate &&
              date.split(" ")[1] || "N/A",
            last_called: lastRecord?.lastCall,
            last_support_by: lastRecord?.lastSupport,
            hotel_destination: hotel?.hotel_city,
            start_time: item?.startTime,
            time_to_answer: item?.timeToAnswer,
            talktime: item?.talkTime,
            type: item?.phoneNumber ? (isValidNumber(item?.phoneNumber) ? "Inbound" : "Outbound") : "N/A",
            dial_status: item?.dialStatus,
            hang_up_by: item?.hangUpBy,
            guest_status: item?.guest_status,
            special_occassion: item?.special_occassion,
            reservationId: item?.reservationId,
            hang_up_cause: item?.hangUpCause,
            department: item?.department,
          });
          await newRecord.save();
        } else {
          const newGuest = new Guest({
            agent_id: agentId,
            salutation: item?.salutation,
            guest_title: item?.guest_title,
            guest_mobile_number: item?.phoneNumber,
            guest_first_name: item?.firstName,
            guest_last_name: item?.lastName,
            guest_email: item?.guestEmail,
            guest_gender: item?.guestGender,
            guest_special_request: item?.guestSpecialRequest,
            guest_address_1: item?.address1,
            guest_address_2: item?.address2,
            city: item?.city,
            state: item?.state,
            country: item?.country,
            zip_code: item?.zip_code,
            guest_fax: item?.guest_fax,
            guest_device: item?.guest_device,
            alternate_contact: item?.alternate_contact,
            date: item?.date,
          });
          const savedGuest = await newGuest.save();
          const PhoneNumber = savedGuest?.guest_mobile_number;
          const GuestData1 = await Guest.findOne({
            guest_mobile_number: PhoneNumber,
          });
          if(!GuestData1){
          console.log(savedGuest,'guest')}

          const newRecord = new callDetail({
            guest_id: GuestData1?._id,
            agent_id: agentId,
            admin_id: agent?.created_by,
            guest_mobile_number: item?.phoneNumber,
            hotel_name: hotelId ,
            disposition: disposition?._id,
            caller_type: item?.callerType,
            purpose_of_travel: item?.purposeOfTravel,
            arrival_date: item?.arrivalDate,
            departure_date: item?.departureDate,
            call_back_date_time: item?.followUpDateTime,
            remark: item?.remark,
            call_date:
              item?.RecordDate &&
              date.split(" ")[0] || "N/A",
            call_time:
              item?.RecordDate &&
              date.split(" ")[1] || "N/A",
            last_called: lastRecord?.lastCall || "",
            last_support_by: lastRecord?.lastSupport,
            hotel_destination: hotel?.hotel_city,
            start_time: item?.startTime,
            time_to_answer: item?.timeToAnswer,
            talktime: item?.talkTime,
            type: item?.phoneNumber ? (isValidNumber(item?.phoneNumber) ? "Inbound" : "Outbound") : "N/A",
            dial_status: item?.dialStatus,
            hang_up_by: item?.hangUpBy,
            guest_status: item?.guest_status,
            special_occassion: item?.special_occassion,
            reservationId: item?.reservationId,
            hang_up_cause: item?.hangUpCause,
            department: item?.department,
          });
          await newRecord.save();
        }
      });
      await Promise.all(promise);
      return res.status(200).json({
        success: true,
        code: 200,
        message: "data added successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        code: 500,
        error: error.message,
      });
    }
  }
}

export default AdminModel;
