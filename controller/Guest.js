import mongoose from "mongoose";
import Guest from "../model/Guest.js"
import callsDetails from "../model/callDetails.js"

class GuestDeatils {
    static async getCallAndGuestDetails(req, res, next) {
        const guest_id = req.body.guest_id
        let findCalls = await Guest.aggregate([{
            $match: {
                _id: new mongoose.Types.ObjectId(guest_id) // Replace with the actual guestId you want to match
            }
        },
        {
            $lookup: {
                from: "calling_details",            // Target collection
                localField: "_id",     // Field from the calls collection
                foreignField: "guest_id",       // Field from the guests collection
                as: "calls_info"            // Alias for the joined documents
            }
        },
        
        ]);

        return res.status(200).json({
            success: true,
            code: 200,
            data : findCalls
          });

    }
}

export default GuestDeatils