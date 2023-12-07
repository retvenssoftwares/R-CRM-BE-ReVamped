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
import mongoose from "mongoose";
import dispositions from "../model/Disposition.js";
import { formatTime } from "../utils/formattime.js";

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
      let payload = { _id, role, name, email };
      if (findUser.role === "AGENT") {
        payload.admin_id = findUser.admin_id;
      }

      const jwtToken = await signJwt(payload);

      const log_in_time = new Date();

      await login_logout.updateOne(
        { agent_id: findUser._id },
        {
          $push: {
            log_in_log_out_time: {
              $each: [{ log_in_time: log_in_time }],
              $position: 0,
            },
          },
        },
        { upsert: true }
      );

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

  static async logOut(req, res, next) {
    const { email, password, log_out_time } = req.body;

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

    await login_logout.updateOne(
      { agent_id: findUser._id },
      {
        $push: {
          log_in_log_out_time: {
            $each: [{ log_in_time: log_out_time }],
            $position: 0,
          },
        },
      },
      { upsert: true }
    );
  }

  static async AddUser(req, res, next) {
    try {
      console.log(
        req.authData.role,
        "req.authData.rolereq.authData.rolereq.authData.role"
      );
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
        dial_status: "Diconnected",
        type: "Inbound",
      });

      // Abandoned Calls
      const abandonedCalls = await CallDetail.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Diconnected",
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
        dial_status: "Diconnected",
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

      let conversionRate = (totalClosedCalls / totalReservation) * 100;

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
          console.log(data);
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
          {
            type: "Reservation Calls",
            reservationCalls: reservationCalls,
            reservationIncommingCallsToday: reservationIncommingCallsToday,
            reservationOutgoingCalls: reservationOutgoingCalls,
          },
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
      let currentDate = new Date();
      let result = [];
      for (let i = 0; i < 7; i++) {
        let firstDayOfMonth;
        let lastDayOfMonth;

        if (req.query.type === "MONTHLY") {
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
        } else if (req.query.type === "WEEKLY") {
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
        if (req.query.type === "WEEKLY") {
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

  static async getDisposition(req, res, next) {
    let findDisposition = await dispositions.find({});

    if (!findDisposition) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: "Data not found",
        data: result.reverse(),
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
          $unwind: "$guest",
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
          $match: {
            department: "RESERVATION",
          },
        },
        {
          $group: {
            _id: "$admin_id",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            name: "$user.name",
            count: 1,
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
          $match: {
            department: "RESERVATION",
          },
        },
        {
          $group: {
            _id: "$admin_id",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            name: "$user.name",
            count: 1,
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
}

export default AdminModel;
