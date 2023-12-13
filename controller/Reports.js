import mongoose from "mongoose";
import callsDetails from "../model/callDetails.js"
import ErrorHandler from "../utils/errorHandler.js";
class Reports {

    static async getCallVolumeReport (res,req,next){
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

      return res.status(200).json({
        status: true,
        code: 200,
        message: "TODO",
        data: [
          {
            type: "Total Calls",
            totalCalls: incommingCalls + outgoingCalls,
            // Inbound: incommingCalls,
            // Outbound: outgoingCalls,
          },
        ]

        })

        }catch(error){
            return next(new ErrorHandler(error.message, 500));
        }
    }

}

export default Reports