import mongoose from "mongoose";
import callsDetails from "../model/callDetails.js";
import Disposition from "../model/Disposition.js"
import ErrorHandler from "../utils/errorHandler.js";
import dispositionDetails from "../model/Disposition.js"
import { formatTime } from "../utils/formatTime.js"
class Reports {

  static async getCallVolumeReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      // Aggregate pipeline to group data by call_date and calculate counts
      const callVolumeData = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            call_date: { $exists: true } // Ensure call_date exists
          }
        },
        {
          $group: {
            _id: "$call_date",
            totalCalls: { $sum: 1 },
            attendedCalls: {
              $sum: {
                $cond: [{ $eq: ["$type", "Inbound"] }, { $cond: [{ $eq: ["$dial_status", "Connected"] }, 1, 0] }, 0]
              }
            },
            inboundCalls: { $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] } },
            outboundCalls: { $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] } },
            missedCalls: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$type", "Inbound"] }, { $eq: ["$dial_status", "Disconnected"] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            date: "$_id",
            totalCalls: 1,
            attendedCalls: 1,
            inboundCalls: 1,
            outboundCalls: 1,
            missedCalls: 1
          }
        },
        {
          $sort: { date: -1 } // Sort results by date in ascending order
        }
      ]);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Call volume data grouped by date",
        data: callVolumeData
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
            call_date: { $exists: true }
          }
        },
        {
          $group: {
            _id: "$call_date",
            totalDurationInSeconds: {
              $sum: {
                $add: [
                  { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0] } }, 3600] },
                  { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1] } }, 60] },
                  { $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2] } }
                ]
              }
            },
            inboundCalls: { $sum: { $cond: [{ $eq: ["$type", "Inbound"] }, 1, 0] } },
            inboundDuration: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "Inbound"] },
                  {
                    $add: [
                      { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0] } }, 3600] },
                      { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1] } }, 60] },
                      { $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2] } }
                    ]
                  },
                  0
                ]
              }
            },
            outboundCalls: { $sum: { $cond: [{ $eq: ["$type", "Outbound"] }, 1, 0] } },
            outboundDuration: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "Outbound"] },
                  {
                    $add: [
                      { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0] } }, 3600] },
                      { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1] } }, 60] },
                      { $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2] } }
                    ]
                  },
                  0
                ]
              }
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
            maxDuration: 1
          }
        },
        {
          $sort : {date : -1},
        }
      ]);


      const data = []
      totalDuration.map((item) => {
        const totalSeconds = item?.totalDurationInSeconds;
        const totalCount = item?.totalCount;
        const inboundTotalCount = item?.inboundCalls;
        const inboundTotalSeconds = item?.inboundDuration;
        const outboundTotalCount = item?.outboundCalls;
        const outboundsTotalSeconds = item?.outboundDuration;
        // Convert total duration to HH:MM:SS format

        const Totaltime = formatTime(totalSeconds)
        const inboundTotalTime = formatTime(inboundTotalSeconds)
        const outboundTotalTime = formatTime(outboundsTotalSeconds)

        
        const averageDurationSeconds = totalCount > 0 ? totalSeconds / totalCount : 0;
        const inboundAverageDurationSeconds = inboundTotalCount > 0 ? inboundTotalSeconds / inboundTotalCount : 0;
        const outboundAverageDurationSeconds = outboundTotalCount > 0 ? outboundsTotalSeconds / outboundTotalCount : 0;

        const avgTime = formatTime(averageDurationSeconds)
        const avginboundTime = formatTime(inboundAverageDurationSeconds)
        const avgoutboundTime = formatTime(outboundAverageDurationSeconds)


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

        const details = [{
            totalCalls: totalCount,
            date : item.date,
            totalDuration: Totaltime,
            averageDuration: avgTime,
            inboundsCalls : inboundTotalCount,
            outboundsCalls : outboundTotalCount,
            inboundTotalDuration: inboundTotalTime,
            inboundAverageDuration: avginboundTime,
            outboundTotalDuration: outboundTotalTime,
            outboundAverageDuration: avgoutboundTime,
            minDuration: formattedMinDuration,
            maxDuration: formattedMaxDuration
        }]

        data.push(details)
      })

      // Respond with the total call duration for all agents of the particular admin
      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data : data
      });
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler(error.message, 500));
    }
  }



  static async getCallOutComeReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      // Counting attended calls when type is "Connected"
      const connectedCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
        dial_status: "Connected",
      });

      // Counting missed calls when type is "Outbound"
      const missedCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Disconnected",
      });

      // Counting abandoned calls when type is "Outbound"
      const AbandonedCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        dial_status: "Rejected",
      });

      // Counting dispositions
      const dispositionCounts = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            disposition: { $exists: true, $ne: null }, // Filter out null or non-existent dispositions
          },
        },
        {
          $group: {
            _id: "$disposition", // Group by disposition
            count: { $sum: 1 }, // Count occurrences of each disposition
          },
        },
        {
          $lookup: {
            from: "dispositions", // Assuming dispositions are stored in a collection named "dispositions"
            localField: "_id",
            foreignField: "_id",
            as: "dispositionData",
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id from the output
            disposition: { $arrayElemAt: ["$dispositionData.name", 0] }, // Get the name of the disposition from the lookup
            count: 1, // Include the count in the output
          },
        },
      ]);

      //Total duration for reservation call
      const totalDuration = await callsDetails.aggregate([
        {
          $match: { admin_id: new mongoose.Types.ObjectId(admin_Id) },
        },
        {
          $lookup: {
            from: "dispositions",
            localField: "disposition",
            foreignField: "_id",
            as: "dispositions"
          }
        },
        {
          $unwind: "$dispositions"
        },
        {
          $match: {
            "dispositions.name": "Reservation",
          }
        },
        {
          $group: {
            _id: null,
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
      ]);
      // Extract total duration from aggregation result
      const totalSeconds =
        totalDuration.length > 0 ? totalDuration[0].totalDurationInSeconds : 0;
      console.log(totalSeconds);
      const totalCount =
        totalDuration.length > 0 ? totalDuration[0].totalCount : 0;
      console.log(totalCount);
      // Convert total duration to HH:MM:SS format
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      // Calculate average call duration
      const averageDurationSeconds =
        totalCount > 0 ? totalSeconds / totalCount : 0;
      console.log(averageDurationSeconds)
      // Convert average duration to HH:MM:SS format
      const avgHours = Math.floor(averageDurationSeconds / 3600);
      const avgMinutes = Math.floor((averageDurationSeconds % 3600) / 60);
      const avgSeconds = Math.floor(averageDurationSeconds % 60);
      const formattedAvgDuration = `${avgHours
        .toString()
        .padStart(2, "0")}:${avgMinutes
          .toString()
          .padStart(2, "0")}:${avgSeconds.toString().padStart(2, "0")}`;

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          {
            type: "Total Calls",
            attendedCalls: connectedCalls,
          },
        ]

      })

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));

    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////

  static async getFirstCallResolutionReport(req, res, next) {
    try {
      // Admin Id from AuthData
      const admin_Id = req.authData?._id;

      // Total Calls
      const incommingCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
      });
      const outgoingCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Outbound",
      });

      // Counting attended calls when type is "Connected"
      const connectedCalls = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
        dial_status: "Connected",
      });


      // Find the first inbound call made by each agent with different guest IDs
      const firstInboundCallsByAgent = await callsDetails.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(admin_Id),
            type: "Inbound",
            guest_id: { $exists: true } // Assuming there's a field for guest ID
          }
        },
        {
          $group: {
            _id: { agent_id: "$agent_id", guest_id: "$guest_id" }, // Grouping by agent_id and guest_id
            firstCall: { $min: "$call_date" }, // Finding the minimum call date (first call)
            records: { $push: "$$ROOT" } // Pushing all records for later retrieval
          }
        },
        {
          $group: {
            _id: "$_id.guest_id", // Grouping by guest_id only
            firstCalls: {
              $push: {
                firstCall: "$firstCall",
                records: "$records"
              }
            }
          }
        },
        {
          $lookup: {
            from: "dispositions", // Assuming the Disposition collection name
            localField: "firstCalls.records.disposition",
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
            _id: null,
            FCR: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            FCR: 1,
          },
        },



      ]);
      console.log(firstInboundCallsByAgent)

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          {
            type: "Total Calls",
            totalCalls: incommingCalls + outgoingCalls,
            attendedCalls: connectedCalls,
            FCRCount: firstInboundCallsByAgent[0].FCR || ''
          },
        ],
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
        },
      },

      {
        $lookup: {
          from: "users",            // Target collection
          localField: "agent_id",     // Field from the calls collection
          foreignField: "_id",       // Field from the guests collection
          as: "agent_info"            // Alias for the joined documents
        }
      },

      {
        $unwind: "$agent_info"
      },

      {
        $group: {
          _id: null,
          totalDurationInSeconds: {
            $sum: {
              $add: [
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 0] } }, 3600] },
                { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 1] } }, 60] },
                { $toInt: { $arrayElemAt: [{ $split: ["$talktime", ":"] }, 2] } },
              ],
            },
          },
          totalCount: { $sum: 1 },
          agent_id: { $first: "$agent_info._id" }, // Save the agent_id for later use
          agent_name: { $first: "$agent_info.name" },
        },
      },

      {
        $project: {
          _id: 0, // Exclude the _id field from the output
          agent_id: 1, // Include the agent_id field in the output
          agent_name: 1, // Include the agent_name field in the output
          totalDurationInSeconds: 1,
          totalCount: 1,
        }
      },
    ]);


    // reservation call count
    const [incomingCallsCount, reservationCount] = await Promise.all([
      callsDetails.countDocuments({ agent_id: new mongoose.Types.ObjectId(req.authData._id) }),
      dispositionDetails.countDocuments({ name: "Reservation" }),
    ]);

    // abandonedCall count
    const AbandonedCall = await callsDetails.countDocuments({
      agent_id: new mongoose.Types.ObjectId(req.authData._id),
      dial_status: "Rejected"
    })

    //missed call count

    const MissedCall = await callsDetails.countDocuments({
      agent_id: new mongoose.Types.ObjectId(req.authData._id),
      dial_status: "Disconnected"
    })


    const outboundHours = Math.floor(agentPerformance[0].totalDurationInSeconds / 3600);
    const outboundMinutes = Math.floor((agentPerformance[0].totalDurationInSeconds % 3600) / 60);
    const outboundSeconds = agentPerformance[0].totalDurationInSeconds % 60;

    const formattedOutboundDuration = `${outboundHours.toString().padStart(2, '0')}:${outboundMinutes.toString().padStart(2, '0')}:${outboundSeconds.toString().padStart(2, '0')}`;

    //console.log(incomingCallsCount-AbandonedCall-reservationCount)
    return res.status(200).json({
      status: true,
      code: 200,
      data: {
        agent_id: agentPerformance[0].agent_id,
        agent_name: agentPerformance[0].agent_name,
        formattedInboundDuration: formattedOutboundDuration,
        totalCount: agentPerformance[0].totalCount,
        reservationCount: reservationCount,
        AbandonedCall: AbandonedCall,
        MissedCall: MissedCall
        // Include other fields from agentPerformance as needed
      }
    })
  }



}

export default Reports