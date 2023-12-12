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
        // const {startDate, endDate}= req.query
        if (req.authData.role === 'ADMIN') {
            let pipeline = [{
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
                // {
                //     $lookup: {
                //         from: "calling_details",
                //         localField: "agent_id",
                //         foreignField: "agent_id",
                //         as: "calling_details",
                //     },
                // },
                // {
                //     $unwind: {
                //         path: "$calling_details",
                //         preserveNullAndEmptyArrays: false,
                //     },
                // },
            ];
            findCalls = await Guest.aggregate(pipeline);
        } else if (req.authData.role === 'AGENT') {

 
            let pipeline = [
                {
                    $match: {
                        agent_id:  new mongoose.Types.ObjectId(req.authData._id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "agent_id",
                        foreignField: "_id",
                        as: "agent",
                    }
                },
                {
                    $unwind: {
                        path: "$agent",
                        preserveNullAndEmptyArrays: false,
                    }
                },
                {
                    $project: {
                        name: "$agent.name",
                        agent_id: "$agent._id",
                        guest_first_name: 1,
                        guest_last_name: 1,
                        city: 1,
                        state: 1,
                        country: 1,
                        salutation: 1,
                        guest_mobile_number: 1,
                        guest_address_1: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
            findCalls = await Guest.aggregate(pipeline);
        }

        return res.status(200).json({
            success: true,
            code: 200,
            data: findCalls.reverse()
        });

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