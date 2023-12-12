import mongoose from "mongoose";
import Guest from "../model/Guest.js"
import User from "../model/User.js";
import callsDetails from "../model/callDetails.js"

class GuestDeatils {
    static async getCallAndGuestDetails(req, res, next) {
        const guest_mobile_number = req.query.guest_mobile_number

        let findCalls = await Guest.aggregate([{
            $match: {
                guest_mobile_number: guest_mobile_number // Replace with the actual guestId you want to match
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
            data: findCalls.reverse()
        });

    }

    static async getAllGuestDetails(req, res, next) {
        let findCalls;

        if (req.authData.role === 'ADMIN') {
            const adminId = req.authData._id; // Assuming admin's _id is available in req.authData
           
            let pipeline = [
                {
                    $match: {
                        created_by: new mongoose.Types.ObjectId(adminId)
                    }
                },
                {
                    $lookup: {
                        from: "guest_details", // Replace "guests" with the actual collection name
                        localField: "_id",
                        foreignField: "agent_id",
                        as: "guests"
                    }
                }
            ];

            try {
                findCalls = await User.aggregate(pipeline);
                return res.status(200).json({
                    success: true,
                    code: 200,
                    data: findCalls.reverse()
                });
            } catch (err) {
                // Handle error appropriately
                return res.status(500).json({
                    success: false,
                    code: 500,
                    error: err.message
                });
            }
        } else if (req.authData.role === 'AGENT') {
            try {
                findCalls = await Guest.find({ agent_id: req.authData._id }).lean();
                return res.status(200).json({
                    success: true,
                    code: 200,
                    data: findCalls.reverse()
                });
            } catch (err) {
                // Handle error appropriately
                return res.status(500).json({
                    success: false,
                    code: 500,
                    error: err.message
                });
            }
        }
    }

    static async updateGuestDeatils(req, res, next) {
        await Guest.updateOne(
            { guest_mobile_number: req.query.guest_mobile_number },
            {
                $set: {
                    guest_first_name: req.body.guest_first_name,
                    guest_last_name: req.bdy.guest_last_name,
                    guest_mobile_number: req.body.guest_mobile_number,
                    guest_address_1: req.body.guest_address_1,
                    guest_address_2: req.body.guest_address_2,
                    alternate_contact: req.body.alternate_contact
                }
            }
        )
    }


}

export default GuestDeatils