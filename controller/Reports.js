import mongoose from "mongoose";
import callsDetails from "../model/callDetails.js"
import ErrorHandler from "../utils/errorHandler.js";
class Reports {

    static async getCallVolumeReport (req,res,next){
        try{
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

      //Incoming Calls Count/Inbound
      const IncomingCallsCount = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type:"Inbound"
      })

      //Outgoing calls Count/Outbound
      const OutgoingCallsCount = await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type:"Outbound"
      })

      //Missed call count
      const missedCallsCount =await callsDetails.countDocuments({
        admin_id: new mongoose.Types.ObjectId(admin_Id),
        type: "Inbound",
        dial_status: "Disconnected",

      })


      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          {
            type: "Total Calls",
            totalCalls: incommingCalls + outgoingCalls,
            attendedCalls: connectedCalls,
             InboundCalls: incommingCalls,
             OutboundCalls: outgoingCalls,
             MissedCalls:missedCallsCount
          },
        ]

        })

        }catch(error){
            return next(new ErrorHandler(error.message, 500));
        }
    }

}

export default Reports