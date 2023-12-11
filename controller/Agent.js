import bcrypt from "bcryptjs";
import callDetails from "../model/callDetails.js";
// import Guest from '../model/Guest.js'
import User from "../model/User.js";
import guestDetail from "../model/Guest.js";
import PauseCall from "../model/PauseCall.js";

import mongoose from "mongoose";
import { randomString } from "../middleware/custom.js";
import Disposition from "../model/Disposition.js";
import log_in_log_out_time from "../model/LoginAndLogOut.js"
import { seedPauesReasons } from "../utils/seeder.js";
import pause_call_dropDown from "../model/PauseDropDown.js";
import { formatTime } from "../utils/formattime.js";
class AgentModel {
  static async GuestInfo(req, res, next) {
    const { phone_number } = req.body;

    let findGuest = await guestDetail.findOne({ phone_number });

    if (findGuest) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: "User Detail",
        data: findGuest,
      });
    } else {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
      });
    }
  }

  static async AddGuest(req, res, next) {
    try {
      const { guest_mobile_number } = req.body;

      let findGuest = await guestDetail.findOne({ guest_mobile_number }).lean();
      if (findGuest) {
        return res.status(409).json({
          status: false,
          code: 409,
          message: "User already exists",
        });
      } else {
        const {
          salutation,
          guest_first_name,
          guest_last_name,
          guest_mobile_number,
          alternate_contact,
          email,
          guest_address_1,
          guest_address_2,
          city,
          state,
          country,
        } = req.body;

        let agent_id = req.authData._id;

        let newGuest = await guestDetail.create({
          agent_id,
          salutation,
          guest_first_name,
          guest_last_name,
          guest_mobile_number,
          alternate_contact,
          email,
          guest_address_1,
          guest_address_2,
          city,
          state,
          country,
        });
        // return res.status(200).json({
        //     status: true,
        //     code: 200,
        //     message: "User added",
        //     data: newGuest
        // });

        return newGuest;
      }
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async AddCall(req, res, next) {
    try {
      let guest_id = req?.body?.guest_id;

      if (!req.body.guest_id) {
        let newuser = await AgentModel.AddGuest(req);
        guest_id = newuser._id;
      }

      let agent_id = req.authData._id;
      let admin_id = req.authData.admin_id
      const {
        call_date,
        caller_type,
        start_time,
        end_time,
        hotel_name,
        talktime,
        time_to_answer,
        type,
        callback_time_date,
        dial_status,
        last_called,
        last_support_by,
        hang_up_by,
        arrival_date,
        departure_date,
        purpose_of_travel,
        remark,
        department,
        disposition,
        special_occassion,
      } = req.body;


      let hotel_destination = ''
      if (req.body.hotel_destination) {
        hotel_destination = req?.body?.hotel_destination.toUpperCase()

      }

      console.log(req?.authData?.admin_id)
      let newCalls = await callDetails.create({
        agent_id,
        guest_id,
        call_date: JSON.stringify(new Date()).split("T")[0].slice(1),
        caller_type,
        start_time,
        end_time,
        hotel_name,
        talktime,
        admin_id: req?.authData?.admin_id,
        time_to_answer,
        type,
        callback_time_date,
        dial_status,
        last_called,
        last_support_by,
        hang_up_by,
        arrival_date,
        reservationIds: randomString(7),
        departure_date,
        purpose_of_travel,
        remark,
        department,
        hotel_destination,
        disposition,
        special_occassion,
      });


      return res.status(200).json({
        status: true,
        code: 200,
        message: "Call detail added...",
        data: newCalls,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async AgentDashboardCard(req, res, next) {
    try {
      let total_call = await callDetails.countDocuments({
        agent_id: req.authData._id,
      });

      let total_incoming_call = await callDetails.countDocuments({
        $and: [
          { type: "Inbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
        ],
      });
      let total_outgoing_call = await callDetails.countDocuments({
        $and: [
          { type: "Outbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
        ],
      });

      let today_call = await callDetails.countDocuments({
        call_date: JSON.stringify(new Date()).split("T")[0].slice(1),
      });
      let today_incoming_call = await callDetails.countDocuments({
        $and: [
          { type: "Inbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { call_date: JSON.stringify(new Date()).split("T")[0].slice(1) },
        ],
      });
      let today_outgoing_call = await callDetails.countDocuments({
        $and: [
          { type: "Outbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { call_date: JSON.stringify(new Date()).split("T")[0].slice(1) },
        ],
      });

      let reservation_call = await callDetails.countDocuments(
        {
          department: "RESERVATION",
        },
        { agent_id: new mongoose.Types.ObjectId(req.authData._id) }
      );
      let reservation_incoming_call = await callDetails.countDocuments({
        $and: [
          { type: "Inbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { department: "RESERVATION" },
        ],
      });
      let reservation_outgoing_call = await callDetails.countDocuments({
        $and: [
          { type: "Outbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { department: "RESERVATION" },
        ],
      });

      let reservation_today = await callDetails.countDocuments({
        $and: [
          {
            department: "RESERVATION",
          },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { call_date: JSON.stringify(new Date()).split("T")[0].slice(1) },
        ],
      });
      let reservation_incoming_today = await callDetails.countDocuments({
        $and: [
          { type: "Inbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { department: "RESERVATION" },
          { call_date: JSON.stringify(new Date()).split("T")[0].slice(1) },
        ],
      });
      let reservation_outgoing_today = await callDetails.countDocuments({
        $and: [
          { type: "Outbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          { department: "RESERVATION" },
          { call_date: JSON.stringify(new Date()).split("T")[0].slice(1) },
        ],
      });

      let total_missed_call = await callDetails.countDocuments({
        $and: [
          { type: "Inbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          {
            dial_status: "Missed",
          },
        ],
      });

      let no_answer = await callDetails.countDocuments({
        $and: [
          { type: "Outbound" },
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          {
            dial_status: "Missed",
          },
        ],
      });

      let abandoned = await callDetails.countDocuments({
        $and: [
          { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
          {
            dial_status: "Rejected",
          },
        ],
      });

      const CallTimeIncoming = await callDetails.aggregate([
        {
          $match: {
            agent_id: new mongoose.Types.ObjectId(req.authData._id),
            type: "Inbound",
            talktime: { $exists: true },
          },
        }
      ]);
      const CallTimeOutgoing = await callDetails.aggregate([
        {
          $match: {
            agent_id: new mongoose.Types.ObjectId(req.authData._id),
            type: "Outbound",
            talktime: { $exists: true },
          },
        }
      ]);

      let sumCallTimeOutgoing = 0;
      await Promise.all(CallTimeOutgoing.map((data) => {
        if (data.talktime) {
          sumCallTimeOutgoing = sumCallTimeOutgoing + parseInt(data.talktime.split(":")[0]) * 3600 + parseInt(data.talktime.split(":")[1]) * 60 + parseInt(data.talktime.split(":")[2]);
        }
      }))

      let sumCallTimeIncoming = 0;
      await Promise.all(CallTimeIncoming.map((data) => {
        if (data.talktime) {
          sumCallTimeIncoming = sumCallTimeIncoming + parseInt(data.talktime.split(":")[0]) * 3600 + parseInt(data.talktime.split(":")[1]) * 60 + parseInt(data.talktime.split(":")[2]);
        }
      }))

      const avgCallTimeIncoming = sumCallTimeIncoming / CallTimeIncoming.length;
      const avgCallTimeOutgoing = sumCallTimeOutgoing / CallTimeOutgoing.length;

      let data1 = [
        {
          type: "Total Calls",
          totalCalls: total_call,
          Inbound: total_incoming_call,
          Outbound: total_outgoing_call,
        },
        {
          type: "Average Call Time",
          avgCallTimeOutgoing: formatTime(avgCallTimeOutgoing),
          avgCallTimeIncoming: formatTime(avgCallTimeIncoming),
        },
        {
          type: "Reservation Calls Today",
          reservationCallsToday: reservation_today,
          reservationIncommingCalls: reservation_incoming_today,
          reservationOutgoingCallsToday: reservation_outgoing_today,
        },
        {
          type: "Total Reservation Calls",
          reservationCalls: reservation_call,
          reservationIncommingCallsToday: reservation_incoming_call,
          reservationOutgoingCalls: reservation_outgoing_call,
        },
        {
          type: "Calls Today",
          totalCalls: today_call,
          Inbound: today_incoming_call,
          Outbound: today_outgoing_call,
        },
        {
          type: "Missed Calls",
          missedCalls: total_missed_call,
        },

        {
          type: "Abandoned Calls",
          abandonedCalls: abandoned,
        },
        {
          type: "No Answer",
          noAnswer: no_answer,
        },
      ]

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: data1,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async TodayConversions(req, res, next) {
    try {
      let condition = [
        {
          $match: {
            $and: [
              {
                agent_id: new mongoose.Types.ObjectId(req.authData._id),
              },
              {
                call_date: JSON.stringify(new Date()).split("T")[0].slice(1),
              },
              {
                department: "RESERVATION",
              },
            ],
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
                dateString: "$arrival_date"
              }
            },
            endDate: {
              $dateFromString: {
                dateString: "$departure_date"
              }
            }
          }
        },
        {
          $addFields: {
            noOfNights: {
              $divide: [
                {
                  $subtract: ["$endDate", "$startDate"]
                },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $project: {
            hotel_name: 1,
            guest_name: "$guest.guest_first_name",
            guest_last_name: "$guest.guest_last_name",
            noOfNights: 1
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (req.query.hotel_name) {
        let hotelName = req.query.hotel_name.replaceAll("_", " ");
        condition.unshift({
          $match: {
            hotel_name: hotelName,
          },
        });
      }

      let findCall = await callDetails.aggregate(condition);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: findCall,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async PendingFollowUp(req, res, next) {
    try {
      let condition = [
        {
          $match: {
            $and: [
              {
                agent_id: new mongoose.Types.ObjectId(req.authData._id),
              },
              {
                department: "RESERVATION",
              },
            ],
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
          $project: {
            hotel_name: 1,
            guest_name: "$guest.guest_first_name",
            guest_last_name: "$guest.guest_last_name",
            arrival_date: 1,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (req.query.hotel_name) {
        let hotelName = req.query.hotel_name.replaceAll("_", " ");
        condition.unshift({
          $match: {
            hotel_name: hotelName,
          },
        });
      }

      if (!req.query.disposition) {
        let disposition = req.query.disposition.replaceAll("_", " ");

        condition.unshift({
          $match: {
            $or: [
              {
                disposition: disposition,
              },
              {
                disposition: disposition,
              },
            ],
          },
        });
      } else {
        condition.unshift({
          $match: {
            disposition: req.query.disposition,
          },
        });
      }

      let findCall = await callDetails.aggregate(condition);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: findCall,
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

  static async dispositionGraph(req, res, next) {
    try {
      let condition = [{ $match: {} }];
      if (req.query.type) {
        let startDate = JSON.stringify(new Date()).split("T")[0].slice(1);
        let endDate;

        if (req.query.type === "WEEK") {
          endDate =
            new Date().setUTCHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 999.99;
        }

        if (req.query.type === "MONTH") {
          endDate =
            new Date().setUTCHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 999.99;
        }

        condition.unshift({
          $match: {
            $and: [
              { call_date: { $lte: startDate } },
              { call_date: { $gte: endDate } },
            ],
          },
        }, {
          $lookup: {
            from: "users",
            localField: "assigned_to",
            foreignField: "_id",
            as: "assigened_user",
          },
        },
          {
            $unwind: {
              path: "$assigened_user",
              preserveNullAndEmptyArrays: false,
            },
          },);
      }

      if (req.authData.role === "ADMIN") {
        condition.unshift({
          $match: { admin_id: new mongoose.Types.ObjectId(req.authData._id) },
        });
      } else if (req.authData.role === "AGENT") {
        condition.unshift({
          $match: { agent_id: new mongoose.Types.ObjectId(req.authData._id) },
        });
      }

      if (req.query.hotel_name) {
        let hotelName = req.query.hotel_name.replaceAll("_", " ");
        condition.unshift({
          $match: {
            hotel_name: hotelName,
          },
        });
      }

      let findCalls = await callDetails.aggregate(condition);

      let result = findCalls.reduce((obj, itm) => {
        obj[itm.disposition] = obj[itm.disposition] + 1 || 1;
        return obj;
      }, {});

      let findDisposition = await Disposition.find().lean();

      await findDisposition.map(async (e) => {
        let findKeys = Object.keys(result).find((el) => {
          return el == e.name;
        })
          ? true
          : false;

        if (!findKeys) {
          result[e.name] = 0;
        }
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async agentCalls(req, res, next) {
    try {
      let condition = [
        {
          $match: {
            agent_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        },
      ];

      if (req.query.missed) {
        condition.push({
          $match: {
            dial_status: "Missed",
          },
        });
      }

      if (req.query.type) {
        condition.push({
          $match: {
            type: req.query.type,
          },
        });
      }


      if (req.query.abandoned) {
        condition.push({
          $match: {
            dial_status: "Rejected",
          },
        });
      }
      let findCalls = await callDetails.aggregate(condition);
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

  static async hotelDestinationList(req, res, next) {
    try {
      let condition = [
        { $match: {} },
        {
          $project: {
            hotel_destination: 1,
          },
        },
      ];
      if (req.authData.role === "ADMIN") {
        condition.unshift({
          $match: {
            admin_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        });
      }

      if (req.authData.role === "AGENT") {
        condition.unshift({
          $match: {
            agent_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        });
      }

      let findHotelDestination = await callDetails.aggregate(condition);

      const unique = findHotelDestination.reduce((acc, curr) => {
        const matchingNode = acc.find(
          (node) => node.hotel_destination === curr.hotel_destination
        );
        if (!matchingNode) {
          acc.push(curr);
        }
        return acc;
      }, []);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: unique,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async Pause(req, res, next) {
    try {
      const {pause_reason, agent_id, resume_time, pause_time} = req.body

      if(!pause_reason && !resume_time){
        return res.status(401).json({
          status: false,
          code: 401,
          data: "data id missing",
        });
      }

      if(!pause_reason || !agent_id){
        return res.status(401).json({
          status: false,
          code: 401,
          data: "pause reason Id or agent id is missing",
        });
      }

      const reasons = await pause_call_dropDown.findOne({ _id: pause_reason });

      if(!reasons){
        return res.status(401).json({
          status: false,
          code: 401,
          data: "data not found..",
        });
      }
      
      const pauseCall = new PauseCall({
        agent_id: agent_id,
        pause_reason: reasons.pause_reason,
        pause_time: pause_time,
        resume_time: resume_time,
      });
  
      await pauseCall.save();
  
      return res.status(200).json({
        status: true,
        code: 200,
        data: "Pause reasons added..",
      });
    } catch (error) {
      console.error('Error in Pause:', error);
      return res.status(500).json({
        status: false,
        code: 500,
        error: 'Internal Server Error',
      });
    }
  }

  static async GetPauseReason(req,res,next){
    const findReasons = await pause_call_dropDown.find({})
    if(!findReasons){
      return res.status(401).json({
        status: true,
        code: 401,
        data: "no data found",
      });
    }
    return res.status(200).json({
      status: true,
      code: 200,
      data: findReasons,
    });
  }
  

  static async GetPauseCall(req, res, next) {
    const findPause = await PauseCall.find({
      agent_id: req.authData._id,
    }).lean();
    findPause.reverse();
    if (!findPause) {
      return res.status(200).json({ message: "Data not found" });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      data: findPause,
    });
  }
  static async hotelNameList(req, res, next) {
    try {
      let condition = [
        { $match: {} },
        {
          $project: {
            hotel_name: 1,
          },
        },
      ];
      if (req.authData.role === "ADMIN") {
        condition.unshift({
          $match: {
            admin_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        });
      }

      if (req.authData.role === "AGENT") {
        condition.unshift({
          $match: {
            agent_id: new mongoose.Types.ObjectId(req.authData._id),
          },
        });
      }

      let findHotelDestination = await callDetails.aggregate(condition);

      const unique = findHotelDestination.reduce((acc, curr) => {
        const matchingNode = acc.find(
          (node) => node.hotel_name === curr.hotel_name
        );
        if (!matchingNode) {
          acc.push(curr);
        }
        return acc;
      }, []);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Details....",
        data: unique,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async CallsBarGraph(req, res, next) {
    try {
      const agent_id = req.authData?._id;
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
          firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - i
          );
          lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - i,
            23,
            59,
            59,
            999
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
              agent_id: new mongoose.Types.ObjectId(agent_id),
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
        const d = await callDetails.aggregate(pipeline);
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


  static async logOut(req, res, next) {
    const { password, log_out_time } = req.body
    const email = req.authData.email
    console.log(email)
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
    let validPassword = await bcryptjs.compare(password, findUser.password);
    if (!validPassword) {
      return res.status(410).json({
        status: false,
        code: 410,
        message: "Password did not match!!",
      });
    }


    const logout = await log_in_log_out_time.updateOne(
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

    if (logout) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: "logout successfully",
      });
    }


  }


  static async updateAgent(req, res, next) {

    if (req.authData.role === "ADMIN") {
      const { _id, first_name, gender, date_of_birth, contact, email, department, designation, password } = req.body;

      if (!_id) {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "_id is missing",s
        });
      }

      if (first_name && gender && date_of_birth && contact && email && department && designation && password) {
        return res.status(401).json({
          status: false,
          code: 401,
          message: "fields are missing",
        });
      }


      try {
        let updateFields = {
          name: first_name,
          email: email,
          phone_number: contact,
          designation: designation,
          department: department,
          gender: gender,
          date_of_birth: date_of_birth,
        };

        if (password) {
          const encryptedPassword = await bcrypt.hash(password, 10);
          updateFields.password = encryptedPassword;
        }

        const updated = await User.updateOne({ _id: _id }, { $set: updateFields });

        if (updated) {
          return res.status(200).json({
            status: true,
            code: 200,
            message: "User updated successfully",
          });
        }

      } catch (error) {
        // Handle errors
        return res.status(500).json({
          status: false,
          code: 500,
          message: "Something wrong",
        });
      }

    }else{
      return res.status(401).json({
        status: false,
        code: 401,
        message: "Not Authorized",
      });
    }


  }


}

export default AgentModel;
