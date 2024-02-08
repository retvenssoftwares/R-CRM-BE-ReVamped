import mongoose from "mongoose";
import callsDetails from "../model/callDetails.js";
import Disposition from "../model/Disposition.js";
import ErrorHandler from "../utils/errorHandler.js";
import dispositionDetails from "../model/Disposition.js";
import { formatTime } from "../utils/formattime.js";
import User from "../model/User.js";
class Reports {
  // static async getCallVolumeReport(req, res, next) {
  //   try {
  //     // Admin Id from AuthData
  //     const admin_Id = req.authData?._id;

  //     // Total Calls
  //     const incommingCalls = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type: "Inbound",
  //     });
  //     const outgoingCalls = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type: "Outbound",
  //     });

  //     // Counting attended calls when type is "Connected"
  //     const connectedCalls = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type: "Inbound",
  //       dial_status: "Connected",
  //     });

  //     //Incoming Calls Count/Inbound
  //     const IncomingCallsCount = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type: "Inbound"
  //     })

  //     //Outgoing calls Count/Outbound
  //     const OutgoingCallsCount = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type: "Outbound"
  //     })

  //     //Missed call count
  //     const missedCallsCount = await callsDetails.countDocuments({
  //       admin_id: new mongoose.Types.ObjectId(admin_Id),
  //       type:"Inbound",
  //       dial_status: "Disconnected",

  //     })

  //     return res.status(200).json({
  //       status: true,
  //       code: 200,
  //       message: "TODO",
  //       data: [
  //         {
  //           type: "Total Calls",
  //           totalCalls: incommingCalls + outgoingCalls,
  //           attendedCalls: connectedCalls,
  //           InboundCalls: incommingCalls,
  //           OutboundCalls: outgoingCalls,
  //           MissedCalls: missedCallsCount
  //         },
  //       ]

  //     })

  //   } catch (error) {
  //     return next(new ErrorHandler(error.message, 500));
  //   }
  // }

  static async getCallVolumeReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;
      // Aggregate pipeline to group data by call_date and calculate counts
      const callVolumeData = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true }, // Ensure call_date exists
          },
        },
        {
          $group: {
            _id: "$call_date",
            totalCalls: { $sum: 1 },
            attendedCalls: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "Inbound"] },
                  { $cond: [{ $eq: ["$dial_status", "Connected"] }, 1, 0] },
                  0,
                ],
              },
            },
            inboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] },
            },
            outboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] },
            },
            missedCalls: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "Inbound"] },
                      { $eq: ["$dial_status", "Disconnected"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            date: "$_id",
            totalCalls: 1,
            attendedCalls: 1,
            inboundCalls: 1,
            outboundCalls: 1,
            missedCalls: 1,
          },
        },
        {
          $sort: { date: -1 }, // Sort results by date in ascending order
        },
      ]);
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Call volume data grouped by date",
        data: callVolumeData,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async getCallDurationReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      //Total call duration
      const totalDuration = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true },
          },
        },
        {
          $group: {
            _id: "$call_date",
            totalDurationInSeconds: {
              $sum: {
                $add: [
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                        },
                      },
                      3600,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                        },
                      },
                      60,
                    ],
                  },
                  {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2],
                    },
                  },
                ],
              },
            },
            inboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] },
            },
            inboundDuration: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "Inbound"] },
                  {
                    $add: [
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                            },
                          },
                          3600,
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                            },
                          },
                          60,
                        ],
                      },
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2],
                        },
                      },
                    ],
                  },
                  0,
                ],
              },
            },
            outboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] },
            },
            outboundDuration: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "Outbound"] },
                  {
                    $add: [
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                            },
                          },
                          3600,
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                            },
                          },
                          60,
                        ],
                      },
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2],
                        },
                      },
                    ],
                  },
                  0,
                ],
              },
            },
            minDuration: { $min: "$talktime" },
            maxDuration: { $max: "$talktime" },
            totalCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            date: "$_id",
            totalDurationInSeconds: 1,
            totalCount: 1,
            inboundDuration: 1,
            inboundCalls: 1,
            outboundDuration: 1,
            outboundCalls: 1,
            minDuration: 1,
            maxDuration: 1,
          },
        },
        {
          $sort: { date: -1 },
        },
      ]);

      const data = [];
      totalDuration.map((item) => {
        const totalSeconds = item?.totalDurationInSeconds;
        const totalCount = item?.totalCount;
        const inboundTotalCount = item?.inboundCalls;
        const inboundTotalSeconds = item?.inboundDuration;
        const outboundTotalCount = item?.outboundCalls;
        const outboundsTotalSeconds = item?.outboundDuration;
        // Convert total duration to HH:MM:SS format

        const Totaltime = formatTime(totalSeconds);
        const inboundTotalTime = formatTime(inboundTotalSeconds);
        const outboundTotalTime = formatTime(outboundsTotalSeconds);

        const averageDurationSeconds =
          totalCount > 0 ? totalSeconds / totalCount : 0;
        const inboundAverageDurationSeconds =
          inboundTotalCount > 0 ? inboundTotalSeconds / inboundTotalCount : 0;
        const outboundAverageDurationSeconds =
          outboundTotalCount > 0
            ? outboundsTotalSeconds / outboundTotalCount
            : 0;

        const avgTime = formatTime(averageDurationSeconds);
        const avginboundTime = formatTime(inboundAverageDurationSeconds);
        const avgoutboundTime = formatTime(outboundAverageDurationSeconds);

        // Extract min and max durations from aggregation result
        const minDuration =
          totalDuration.length > 0 ? totalDuration[0].minDuration : "00:00:00";
        const maxDuration =
          totalDuration.length > 0 ? totalDuration[0].maxDuration : "00:00:00";

        // Function to format duration in HH:MM:SS format
        const formatDuration = (duration) => {
          const [hours, minutes, seconds] = duration.split(":").map(Number);
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        // Format min and max durations
        const formattedMinDuration = formatDuration(minDuration);
        const formattedMaxDuration = formatDuration(maxDuration);

        const details = [
          {
            totalCalls: totalCount,
            date: item.date,
            totalDuration: Totaltime,
            averageDuration: avgTime,
            inboundsCalls: inboundTotalCount,
            outboundsCalls: outboundTotalCount,
            inboundTotalDuration: inboundTotalTime,
            inboundAverageDuration: avginboundTime,
            outboundTotalDuration: outboundTotalTime,
            outboundAverageDuration: avgoutboundTime,
            minDuration: formattedMinDuration,
            maxDuration: formattedMaxDuration,
          },
        ];

        data.push(details);
      });

      // Respond with the total call duration for all agents of the particular admin
      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [].concat(...data),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async getCallOutComeReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;
      // Counting dispositions
      const dispositionCounts = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true }, // Ensure call_date exists
            disposition: { $exists: true, $ne: null }, // Filter out null or non-existent dispositions
          },
        },
        {
          $group: {
            _id: {
              disposition: "$disposition",
              date: "$call_date", // Replace with your actual date field
            }, // Group by disposition
            count: { $sum: 1 }, // Count occurrences of each disposition
          },
        },
        {
          $lookup: {
            from: "dispositions", // Assuming dispositions are stored in a collection named "dispositions"
            localField: "_id.disposition",
            foreignField: "_id",
            as: "dispositionData",
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id from the output
            date: "$_id.date",
            disposition: { $arrayElemAt: ["$dispositionData.name", 0] }, // Get the name of the disposition from the lookup
            count: 1, // Include the count in the output
          },
        },
        {
          $sort: { date: -1 },
        },
      ]);

      //Total duration for reservation call
      const totalDuration = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true }, // Ensure call_date exists
          },
        },

        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "dispositions",
          },
        },
        {
          $unwind: "$dispositions",
        },
        {
          $match: {
            "dispositions.name": "Reservation",
          },
        },
        {
          $group: {
            _id: "$call_date",
            connectedCalls: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "Inbound"] },
                      { $eq: ["$dial_status", "Connected"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            missedCalls: {
              $sum: {
                $cond: [{ $eq: ["$dial_status", "Disconnected"] }, 1, 0],
              },
            },
            AbandonedCalls: {
              $sum: { $cond: [{ $eq: ["$dial_status", "Rejected"] }, 1, 0] },
            },
            totalDurationInSeconds: {
              $sum: {
                $add: [
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                        },
                      },
                      3600,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                        },
                      },
                      60,
                    ],
                  },
                  {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2],
                    },
                  },
                ],
              },
            },
            totalCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            date: "$_id",
            totalDurationInSeconds: 1,
            missedCalls: 1,
            AbandonedCalls: 1,
            connectedCalls: 1,
          },
        },
        {
          $sort: { date: -1 },
        },
      ]);

      const data = [];
      totalDuration.map((item) => {
        const totalSeconds = item?.totalDurationInSeconds;
        const totalCount = item?.totalCount;
        const formattedDuration = formatTime(totalSeconds);

        const averageDurationSeconds =
          totalCount > 0 ? totalSeconds / totalCount : 0;
        const formattedAvgDuration = formatTime(averageDurationSeconds);

        const details = [
          {
            date: item.date,
            ReservationCallDuration: formattedDuration,
            avgReservationCallDuration: formattedAvgDuration,
          },
        ];

        data.push(details);
      });

      const a = [].concat(...data);
      const original = [];
      a.map((item) => {
        const f = dispositionCounts;
        f.map((item2) => {
          if (item2.date === item.date) {
            const data = [
              {
                ReservationCallDuration: item?.ReservationCallDuration,
                date: item?.date,
                avgReservationCallDuration: item?.avgReservationCallDuration,
                count: item2?.count,
                disposition: item2?.disposition,
              },
            ];
            original.push(data);
          } else {
            const data = [
              {
                ReservationCallDuration: item?.ReservationCallDuration,
                date: item?.date,
                avgReservationCallDuration: item?.avgReservationCallDuration,
              },
            ];
            original.push(data);
          }
        });
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [].concat(...original),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////

  static async getFirstCallResolutionReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      // Total Calls
      const aggregationPipeline = [
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true }, // Ensure call_date exists
          },
        },
        {
          $group: {
            _id: "$call_date",
            count: { $sum: 1 },
            inboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] },
            },
            outboundCalls: {
              $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] },
            },
            connectedCalls: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "Inbound"] },
                      { $eq: ["$dial_status", "Connected"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            date: "$_id",
            inboundCalls: 1,
            outboundCalls: 1,
            connectedCalls: 1,
          },
        },
      ];

      const results = await callsDetails.aggregate(aggregationPipeline);

      const data = [];
      results.map((item) => {
        const inbound = item?.inboundCalls;
        const outbound = item?.outboundCalls;
        const connected = item?.connectedCalls;

        const details = [
          {
            inbound,
            date: item.date,
            outbound,
            connected,
          },
        ];

        data.push(details);
      });

      // Extract counts for each type

      // Find the first inbound call made by each agent with different guest IDs
      const firstInboundCallsByAgent = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            type: "Inbound",
            call_date: { $exists: true },
            guest_id: { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              agent_id: "$agent_id",
              guest_id: "$guest_id",
              date: "$call_date",
            },
            firstCall: { $min: "$call_date" },
            records: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "records.disposition",
            foreignField: "_id",
            as: "matched_dispositions",
          },
        },
        {
          $unwind: "$matched_dispositions",
        },
        {
          $match: {
            "matched_dispositions.name": "Reservation",
          },
        },
        {
          $group: {
            _id: { date: "$_id.date" },
            FCR: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            FCR: 1,
          },
        },
      ]);

      // The result will contain an array of objects, each representing FCR for a specific dat

      const a = [].concat(...data);
      const original = [];
      a.map((item) => {
        const f = firstInboundCallsByAgent;
        f.map((item2) => {
          if (item2.date === item.date) {
            const data = [
              {
                inbound: item?.inbound,
                date: item?.date,
                outbound: item?.outbound,
                connected: item?.connected,
                FCR: item2?.FCR,
              },
            ];
            original.push(data);
          } else {
            const data = [
              {
                inbound: item?.inbound,
                date: item?.date,
                outbound: item?.outbound,
                connected: item?.connected,
              },
            ];
            original.push(data);
          }
        });
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [].concat(...original),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

  static async getAgentPerformance(req, res, next) {
    const agentPerformance = await callsDetails.aggregate([
      {
        $match: {
          agent_id: new mongoose.Types.ObjectId(req.authData._id),
          call_date: { $exists: true },
        },
      },

      {
        $lookup: {
          from: "users", // Target collection
          localField: "agent_id", // Field from the calls collection
          foreignField: "_id", // Field from the guests collection
          as: "agent_info", // Alias for the joined documents
        },
      },

      {
        $unwind: "$agent_info",
      },

      {
        $group: {
          _id: "$call_date",
          totalDurationInSeconds: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    {
                      $toInt: {
                        $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                      },
                    },
                    3600,
                  ],
                },
                {
                  $multiply: [
                    {
                      $toInt: {
                        $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                      },
                    },
                    60,
                  ],
                },
                {
                  $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2] },
                },
              ],
            },
          },
          inboundCalls: {
            $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] },
          },
          outboundCalls: {
            $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] },
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ["$dial_status", "Disconnected"] }, 1, 0] },
          },
          AbandonedCalls: {
            $sum: { $cond: [{ $eq: ["$dial_status", "Rejected"] }, 1, 0] },
          },
          totalCount: { $sum: 1 },
          agent_id: { $first: "$agent_info._id" }, // Save the agent_id for later use
          agent_name: { $first: "$agent_info.name" },
        },
      },

      {
        $project: {
          _id: 0, // Exclude the _id field from the output
          date: "$_id",
          agent_id: 1, // Include the agent_id field in the output
          agent_name: 1, // Include the agent_name field in the output
          totalDurationInSeconds: 1,
          inboundCalls: 1,
          AbandonedCall: 1,
          missedCalls: 1,
          outboundCalls: 1,
          totalCount: 1,
        },
      },
    ]);

    const data = [];

    agentPerformance.map((item) => {
      const details = [
        {
          date: item?.date,
          agent_id: item?.agent_id,
          agent_name: item?.agent_name,
          formattedOutboundDuration: formatTime(item?.totalDurationInSeconds),
          inboundCalls: item?.inboundCalls,
          AbandonedCalls: item?.AbandonedCall,
          missedCalls: item?.missedCalls,
          outboundCalls: item?.outboundCalls,
          totalCount: item?.totalCount,
        },
      ];

      data.push(details);
    });

    // reservation call count
    const reservationCount = await callsDetails.aggregate([
      {
        $match: {
          agent_id: new mongoose.Types.ObjectId(req.authData._id),
          call_date: { $exists: true, $ne: null },
          // Add any other conditions if needed
        },
      },
      {
        $lookup: {
          from: "dispositions",
          localField: "disposition",
          foreignField: "_id",
          as: "dispositions",
        },
      },
      {
        $unwind: "$dispositions",
      },
      {
        $match: {
          "dispositions.name": "Reservation",
        },
      },
      {
        $group: {
          _id: "$call_date",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    const a = [].concat(...data);
    const original = [];
    a.map((item) => {
      const f = reservationCount;
      f.map((item2) => {
        if (item2.date === item.date) {
          const data = [
            {
              formattedOutboundDuration: item?.formattedOutboundDuration,
              date: item?.date,
              agent_id: item?.agent_id,
              agent_name: item?.agent_name,
              inboundCalls: item?.inboundCalls,
              missedCalls: item2?.missedCalls,
              outboundCalls: item2?.outboundCalls,
              totalCount: item?.totalCount,
              count: item2?.count,
            },
          ];
          original.push(data);
        } else {
          const data = [
            {
              date: item?.date,
              agent_id: item?.agent_id,
              agent_name: item?.agent_name,
              inboundCalls: item?.inboundCalls,
              missedCalls: item2?.missedCalls,
              outboundCalls: item2?.outboundCalls,
              totalCount: item?.totalCount,
            },
          ];
          original.push(data);
        }
      });
    });

    return res.status(200).json({
      status: true,
      code: 200,
      data: [].concat(...original),
    });
  }

  static async getCallHealthReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData._id;

      // Total Call
      //Total call duration
      const totalDuration = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true },
          },
        },
        {
          $group: {
            _id: "$call_date",
            totalDurationInSeconds: {
              $sum: {
                $add: [
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0],
                        },
                      },
                      3600,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1],
                        },
                      },
                      60,
                    ],
                  },
                  {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2],
                    },
                  },
                ],
              },
            },
            totalCount: { $sum: 1 },
            // incommingCalls: { $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] } },
            // outboundCalls: { $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] } },
            disconnectedRecords: {
              $sum: {
                $cond: [{ $eq: ["$dial_status", "Disconnected"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            date: "$_id",
            totalDurationInSeconds: 1,
            totalCount: 1,
            disconnectedRecords: 1,
          },
        },
      ]);

      // console.log(totalDuration)

      const duration = [];
      totalDuration.map((item) => {
        const totalDurationInSeconds = item?.totalDurationInSeconds;

        const formattedDuration = formatTime(totalDurationInSeconds);

        const averageDurationSeconds =
          item?.totalCount > 0 ? totalDurationInSeconds / item?.totalCount : 0;

        const missedCallRate =
          (item?.disconnectedRecords / item?.totalCount) * 100 > 0
            ? (item?.disconnectedRecords / item?.totalCount) * 100
            : 0;

        const formattedAvgDuration = formatTime(averageDurationSeconds);
        const data = [
          {
            formattedDuration,
            date: item?.date,
            formattedAvgDuration,
            missedCallRate,
          },
        ];

        duration.push(data);
      });

      // console.log(duration)

      //Avg hold time
      const averageHoldTime = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true },
          },
        },
        {
          $group: {
            _id: "$call_date",
            totalHoldTime: {
              $sum: {
                $cond: {
                  if: { $ne: ["$hold_time", ""] },
                  then: {
                    $add: [
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [
                                { $split: ["$hold_time", ":"] },
                                0,
                              ],
                            },
                          },
                          3600,
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $toInt: {
                              $arrayElemAt: [
                                { $split: ["$hold_time", ":"] },
                                1,
                              ],
                            },
                          },
                          60,
                        ],
                      },
                      {
                        $toInt: {
                          $arrayElemAt: [{ $split: ["$hold_time", ":"] }, 2],
                        },
                      },
                    ],
                  },
                  else: 0,
                },
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            averageHoldTimeInSeconds: { $divide: ["$totalHoldTime", "$count"] },
          },
        },
      ]);

      const avg = [];
      averageHoldTime.map((item) => {
        const averageHoldTime =
          item?.averageHoldTimeInSeconds > 0
            ? item?.averageHoldTimeInSeconds
            : 0;

        const averageHoldTimeInHHMMSS = formatTime(averageHoldTime);

        const data = [
          {
            averageHoldTimeInHHMMSS: averageHoldTimeInHHMMSS,
            date: item?.date,
          },
        ];
        avg.push(data);
      });

      const originalAvg = [].concat(...avg);
      const a = [].concat(...duration);

      const result = a.map((item) => {
        const matchingAvg = originalAvg.find(
          (item2) => item2.date === item.date
        );

        if (matchingAvg) {
          return {
            formattedDuration: item.formattedDuration,
            date: item.date,
            formattedAvgDuration: item.formattedAvgDuration,
            missedCallRate: item.missedCallRate,
            averageHoldTimeInHHMMSS: matchingAvg.averageHoldTimeInHHMMSS,
          };
        } else {
          return {
            formattedDuration: item.formattedDuration,
            date: item.date,
            missedCallRate: item.missedCallRate,
            formattedAvgDuration: item.formattedAvgDuration,
          };
        }
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Call Health Report",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
      });
    }
  }

  static async agentLoginTime(req, res) {
    try {
      let pipeline = [{
        $match: {
          role: "AGENT"
        },
      },
      {
        $lookup: {
          from: "login_logout_times",
          localField: "_id",
          foreignField: "agent_id",
          as: "loginLogoutData",
        },
      },
      {
        $unwind: "$loginLogoutData",
      },
      {
        $lookup: {
          from: "calling_details",
          localField: "_id",
          foreignField: "agent_id",
          as: "callingData",
        },
      },

      {
        $project: {
          _id: 1,
          role: { $ifNull: ["$role", ""] },
          name: { $ifNull: ["$name", ""] },
          email: { $ifNull: ["$email", ""] },
          designation: { $ifNull: ["$designation", ""] },
          profile_pic: { $ifNull: ["$profile_pic", ""] },
          log_in_time: {
            $ifNull: [
              { $arrayElemAt: ["$loginLogoutData.log_in_log_out_time.log_in_time", 0] },
              "",
            ],
          },
          log_out_time: {
            $ifNull: [
              { $arrayElemAt: ["$loginLogoutData.log_in_log_out_time.log_out_time", 0] },
              "",
            ],
          },
          callingDataCount: { $size: "$callingData" },
        },
      },


      ];

      if (req.query._id) {
        pipeline.push({
          $match: {
            _id: new mongoose.Types.ObjectId(req.query._id),
          }
        })
      }
      const agentData = await User.aggregate(pipeline);

      const mappedAgentData = agentData.map((agent) => {
        const logInTime = agent.log_in_time;
        const logOutTime = agent.log_out_time;

        // Function to calculate the time difference and format as HH:MM:SS
        const calculateTotalTime = () => {
          if (logInTime && logOutTime) {
            const diffMilliseconds = new Date(logOutTime) - new Date(logInTime);
            const hours = Math.floor(diffMilliseconds / 3600000);
            const minutes = Math.floor((diffMilliseconds % 3600000) / 60000);
            const seconds = Math.floor((diffMilliseconds % 60000) / 1000);
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }
          return "";
        };

        // Calculate total_time using the function
        const total_time = calculateTotalTime();

        return {
          ...agent,
          total_time,
        };
      });


      return res.status(200).json({
        status: true,
        code: 200,
        data: mappedAgentData,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
      });
    }
  }

  static async callDataAnalysis(req, res) {
    try {
      const callingData = await callsDetails.find().select('agent_id hang_up_cause call_date call_time dial_status guest_id end_time talktime hotel_destination').lean();
      const users = await User.find({}, '_id name').lean();
      // console.log('users: ', users);
      const mappedCallData = await Promise.all(callingData.map((call) => {
        const getAgentNames = users.find((user) => user._id.toString() === call.agent_id.toString());
        // console.log('getAgentNames: ', getAgentNames);
        return {
          ...call._doc,
          agent_id: call.agent_id,
          guest_id: call.guest_id || "",
          hotel_destination: call.hotel_destination || "",
          start_stamp: call.call_date + " " + call.call_time || "",
          end_stamp: call.call_date + " " + call.end_time || "",
          duration: call.talktime || "",
          call_status: call.dial_status || "",
          agent_name: getAgentNames ? getAgentNames.name : "",
          hang_up_cause: call.hangup_cause || "",
        }
      }));

      return res.status(200).json({
        status: true,
        code: 200,
        data: mappedCallData
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
      })
    }
  }

  static async dispositionAnalysis(req, res) {
    try {
      const callingData = await callsDetails.aggregate([
        {
          $match: {}
        },

        {
          $lookup: {
            from: "users",
            localField: "agent_id",
            foreignField: "_id",
            as: "userData"
          }
        },

        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "dispositionData"
          }
        },

        {
          $lookup: {
            from: "guest_details",
            localField: "guest_id",
            foreignField: "_id",
            as: "guestData"
          }
        },

        {
          $unwind: "$userData"
        },

        {
          $unwind: "$guestData"
        },
        {
          $unwind: "$dispositionData"
        },

        {
          $project: {
            call_date: { $ifNull: ["$call_date", ""] },
            type: { $ifNull: ["$type", ""] },
            agent_id: { $ifNull: ["$agent_id", ""] },
            agent_name: { $ifNull: ["$userData.name", ""] },
            guest_id: { $ifNull: ["$guest_id", ""] },
            phone_number: { $ifNull: ["$guestData.guest_mobile_number", ""] },
            call_disposition: { $ifNull: ["$dispositionData.name", ""] },
            next_action_date: { $ifNull: ["$call_back_date_time", ""] }
          }
        }
      ]);

      return res.status(200).json({
        status: true,
        code: 200,
        data: callingData,
      })
    } catch (error) {
      console.log(error);
      res.status(200).json({
        status: false,
        code: 500,
        error: "Internal Server Error",
      })
    }
  }

  static async callSummary(req, res) {
    try {
      const callingData = await callsDetails.find().select('agent_id hang_up_cause call_date call_time dial_status guest_id end_time talktime hotel_destination').lean();
      const users = await User.find({}, '_id name').lean();
      // console.log('users: ', users);
      const mappedCallData = await Promise.all(callingData.map((call) => {
        const getAgentNames = users.find((user) => user._id.toString() === call.agent_id.toString());
        // console.log('getAgentNames: ', getAgentNames);
        return {
          ...call._doc,
          agent_id: call.agent_id,
          guest_id: call.guest_id || "",
          hotel_destination: call.hotel_destination || "",
          start_stamp: call.call_date + " " + call.call_time || "",
          end_stamp: call.call_date + " " + call.end_time || "",
          duration: call.talktime || "",
          call_status: call.dial_status || "",
          agent_name: getAgentNames ? getAgentNames.name : "",
          hang_up_cause: call.hangup_cause || "",
        }
      }));

      const callingData2 = await callsDetails.aggregate([
        {
          $match: {}
        },

        {
          $lookup: {
            from: "users",
            localField: "agent_id",
            foreignField: "_id",
            as: "userData"
          }
        },

        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "dispositionData"
          }
        },

        {
          $lookup: {
            from: "guest_details",
            localField: "guest_id",
            foreignField: "_id",
            as: "guestData"
          }
        },

        {
          $unwind: "$userData"
        },

        {
          $unwind: "$guestData"
        },
        {
          $unwind: "$dispositionData"
        },

        {
          $project: {
            call_date: { $ifNull: ["$call_date", ""] },
            type: { $ifNull: ["$type", ""] },
            agent_id: { $ifNull: ["$agent_id", ""] },
            agent_name: { $ifNull: ["$userData.name", ""] },
            guest_id: { $ifNull: ["$guest_id", ""] },
            phone_number: { $ifNull: ["$guestData.guest_mobile_number", ""] },
            call_disposition: { $ifNull: ["$dispositionData.name", ""] },
            next_action_date: { $ifNull: ["$call_back_date_time", ""] }
          }
        }
      ]);

      return res.status(200).json({
        status: true,
        code: 200,
        callingData: mappedCallData,
        dispositionData: callingData2,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
        error: "Internal Server Error",
      })
    }
  }
}


export default Reports;
