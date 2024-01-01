import mongoose from "mongoose";
import Guest from "../model/Guest.js"
import User from "../model/User.js";
import callsDetails from "../model/callDetails.js"

class GuestDeatils {
    static async getCallAndGuestDetails(req, res, next) {
        const guest_mobile_number = req.query.guest_mobile_number

        if (!guest_mobile_number) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "phone number is missing"
            });
        }

        let findCalls = await Guest.aggregate([{
            $match: {
                guest_mobile_number: guest_mobile_number // Replace with the actual guestId you want to match
            }
        },
        {
            $lookup: {
                from: "calling_details",
                localField: "_id",
                foreignField: "guest_id",
                as: "calls_info"
            }
        },
        {
            $unwind: "$calls_info" // Corrected field name to "calls_info"
        },
        {
            $lookup: {
                from: "dispositions",
                localField: "calls_info.disposition", // Assuming this is correct
                foreignField: "_id",
                as: "disposition"
            }
        },
        {
            $unwind: "$disposition"
        },

        {
            $unwind: {
                path: "$calls_info"
            }
        }, {
            $sort: {
                "calls_info.call_date": -1
            }
        },
        {
            $group: {
                _id: {
                    "_id": "$_id",
                    "agent_id": "$agent_id",
                    "guest_first_name": "$guest_first_name",
                    "guest_email": "$guest_email",
                    "guest_last_name": "$guest_last_name",
                    "guest_mobile_number": "$guest_mobile_number",
                    "guest_address_1": "$guest_address_1",
                    "guest_address_2": "$guest_address_2",
                    "city": "$city",
                    "state": "$state",
                    "country": "$country",
                    "alternate_contact": "$alternate_contact",
                    "createdAt": "$createdAt",
                    "zip_code":"$zip_code",
                    "updatedAt": "$updatedAt",

                },
                calls_info: {
                    $push: {
                        $mergeObjects: [
                            "$calls_info",
                            {
                                "disposition_name": "$disposition.name"
                            }
                        ]
                    }
                }

            }
        },
            // {
            //     $project: {
            //         "_id": "$_id._id",
            //         "agent_id": "$_id.agent_id",
            //         "guest_first_name": "$_id.guest_first_name",
            //         "guest_last_name": "$_id.guest_last_name",
            //         "guest_mobile_number": "$_id.guest_mobile_number",
            //         "guest_address_1": "$_id.guest_address_1",
            //         "guest_address_2": "$_id.guest_address_2",
            //         "alternate_contact": "$_id.alternate_contact",
            //         "city": "$city",
            //         "state": "$sate",
            //         "country": "$country",
            //         "createdAt": "$_id.createdAt",
            //         "updatedAt": "$_id.updatedAt",
            //         calls_info: 1
            //     }
            // }




        ]);

        return res.status(200).json({
            success: true,
            code: 200,
            data: findCalls
        });

    }

    static async getAllGuestDetails(req, res, next) {
        let findCalls;

        if (req.authData.role === 'ADMIN') {
            console.log(req.authData._id)
            const adminId = req.authData._id; // Assuming admin's _id is available in req.authData
            let pipeline = [
                {
                    $match: {
                        created_by: new mongoose.Types.ObjectId(adminId)
                    }
                },
                {
                    $lookup: {
                        from: "guest_details",
                        localField: "_id",
                        foreignField: "agent_id",
                        as: "guests"
                    },

                },
                {
                    $unwind: "$guests"
                },
                // {
                //     $match: {
                //         "guests.date": {$gte: req.query.from , $lte: req.query.to}
                //     }
                // },
                {
                    $lookup: {
                        from: "calling_details",
                        localField: "guests._id",
                        foreignField: "guest_id",
                        as: "calls"
                    }
                },
                {
                    $unwind: "$calls"
                },
                {
                    $lookup: {
                        from: "dispositions",
                        localField: "calls.disposition",
                        foreignField: "_id",
                        as: "dispositions"
                    }
                },
                {
                    $unwind: "$dispositions"
                },
                {
                    $match: {
                        "dispositions.name": "Reservation"
                    }
                },

                {
                    $replaceRoot: { newRoot: "$guests" }
                }
            ];
            try {
                findCalls = await User.aggregate(pipeline);
                return res.status(200).json({
                    success: true,
                    code: 200,
                    data: findCalls.reverse(),
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
            console.log("gvhbjnk")
            const agentId = req.authData._id;
            let pipeline = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(agentId)
                    }
                },
                {
                    $lookup: {
                        from: "guest_details",
                        localField: "_id",
                        foreignField: "agent_id",
                        as: "guests"
                    }
                },
                {
                    $unwind: "$guests"
                },
                {
                    $lookup: {
                        from: "calling_details",
                        localField: "guests._id",
                        foreignField: "guest_id",
                        as: "calls"
                    }
                },
                {
                    $unwind: "$calls"
                },
                {
                    $lookup: {
                        from: "dispositions",
                        localField: "calls.disposition",
                        foreignField: "_id",
                        as: "dispositions"
                    }
                },
                {
                    $unwind: "$dispositions"
                },
                {
                    $match: {
                        "dispositions.name": "Reservation"
                    }
                },

                {
                    $replaceRoot: { newRoot: "$guests" }
                }
            ];

            try {
                // findCalls = await Guest.find({ agent_id: req.authData._id }).lean();
                findCalls = await User.aggregate(pipeline);
                return res.status(200).json({
                    success: true,
                    code: 200,
                    data: findCalls.reverse(),
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
        const data = await Guest.updateOne(
            { guest_mobile_number: req.body.guest_mobile_number },
            {
                $set: {
                    guest_first_name: req.body.guest_first_name,
                    guest_last_name: req.body.guest_last_name,
                    guest_mobile_number: req.body.guest_mobile_number,
                    guest_email : req.body.guest_email,
                    zip_code:req.body.zip_code,
                    state: req.body.state,
                    city: req.body.city,
                    country: req.body.country,
                    guest_address_1: req.body.guest_address_1,
                    guest_address_2: req.body.guest_address_2,
                    alternate_contact: req.body.alternate_contact
                }
            }
        )

        if (data) {
            return res.status(200).json({
                success: true,
                code: 200,
                message: "Updated successfully"
            });
        }
    }


    
   




}

export default GuestDeatils