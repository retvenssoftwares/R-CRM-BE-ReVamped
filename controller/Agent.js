import bcryptjs from "bcryptjs";
import callDetails from "../model/callDetails.js";
// import Guest from '../model/Guest.js'
import User from "../model/User.js";
import guestDetail from "../model/Guest.js";

import mongoose from "mongoose";
import { randomString } from "../middleware/custom.js";
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

      let newCalls = await callDetails.create({
        agent_id,
        guest_id,
        call_date,
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
        reservationIds : randomString(7),
        departure_date,
        purpose_of_travel,
        remark,
        department,
        disposition,
        special_occassion,
        hotel_destination: req.body.hotel_destination.toUpperCase(),
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

      let reservation_call = await callDetails.countDocuments({
        department: "RESERVATION",
      });
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

      let data1 = {
        total_call: total_call,
        total_incoming_call: total_incoming_call,
        total_outgoing_call: total_outgoing_call,
        today_call: today_call,
        today_incoming_call: today_incoming_call,
        today_outgoing_call: today_outgoing_call,
        today_outgoing_call: today_outgoing_call,
        reservation_call: reservation_call,
        reservation_incoming_call: reservation_incoming_call,
        reservation_outgoing_call: reservation_outgoing_call,
        reservation_today: reservation_today,
        reservation_incoming_today: reservation_incoming_today,
        reservation_outgoing_today: reservation_outgoing_today,
        total_missed_call: total_missed_call,
        no_answer: no_answer,
        abandoned: abandoned,
      };

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
          $project: {
            hotel_name: 1,
            guest_name: "$guest.guest_first_name",
            guest_last_name: "$guest.guest_last_name",
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
        condition.unshift({
          $match: {
            hotel_name: req.query.hotel_name,
          },
        });
      }

      if (!req.query.disposition) {
        condition.unshift({
          $match: {
            $or: [
              {
                disposition: "Follow Up - Reservation",
              },
              {
                disposition: "Follow Up - No Reservation",
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
      return res.status(500).json({
        status: false,
        code: 500,
        message: error.message,
      });
    }
  }

  static async dispositionGraph(req, res, next) {
    try {
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

  static async hotelNameList(req, res, next) {
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
}

export default AgentModel;
