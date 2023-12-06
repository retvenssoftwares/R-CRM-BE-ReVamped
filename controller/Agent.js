import bcryptjs from "bcryptjs"
import data from "../model/callDetails.js"
// import Guest from '../model/Guest.js'
import User from "../model/User.js"
import guestDetail from '../model/Guest.js'
class AgentModel {
    static async AgentLogin(req, res, next) {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(422).json({
                status: false,
                code: 422,
                message: "Please fill all the required field",
            });
        }

        const findAgent = await findOne({ email })
        if (!findAgent) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "Data not found",
            });
        }

        let validPassword = await bcryptjs.compare(password, findAgent.password)

        if (!validPassword) {
            return res.status(401).json({
                status: false,
                code: 401,
                message: "Incorrect Password",
            });
        }

        const { agentId, agentext } = findAgent

    }

    static async GuestInfo(req, res, next) {

        const { phone_number } = req.body

        let findGuest = await guestDetail.findOne({ phone_number })

        if (findGuest) {
            return res.status(200).json({
                status: true,
                code: 200,
                message: "User Detail",
                data: findGuest
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
        try{
            const { guest_mobile_number } = req.body

            let findGuest = await guestDetail.findOne({ guest_mobile_number }).lean()
            if (findGuest) {
                return res.status(409).json({
                    status: false,
                    code: 409,
                    message: "User already exists",
                });
            } else {
    
                const { salutation, guest_first_name, guest_last_name, guest_mobile_number, alternate_contact, email, guest_address_1, guest_address_2, city, state, country} = req.body
    
                let agent_id = req.authData._id
    
                let newGuest = await guestDetail.create({
                    agent_id,
                    salutation, guest_first_name, guest_last_name, guest_mobile_number, alternate_contact, email, guest_address_1, guest_address_2, city, state, country, 
                })
                // return res.status(200).json({
                //     status: true,
                //     code: 200,
                //     message: "User added",
                //     data: newGuest
                // });
    
                return newGuest
            }
    
        }catch(error){
            return res.status(500).json({
                status: false,
                code: 500,
                message: error.message,
            });
        }

        

    }

    static async AddCall(req, res, next) {
        try {
            let guest_id = req?.body?.guest_id

            if (!req.body.guest_id) {
                let newuser = await AgentModel.AddGuest(req)
                guest_id = newuser._id
            }

            let agent_id = req.authData._id
            const {call_date, caller_type, start_time, end_time, hotel_name,talktime, time_to_answer, type, callback_time_date, dial_status,last_called,last_support_by, hang_up_by, arrival_date, departure_date, purpose_of_travel, remark, department, disposition,special_occassion} = req.body

        
            let newCalls = await data.create({agent_id,guest_id,call_date, caller_type, start_time, end_time, hotel_name,talktime, time_to_answer, type, callback_time_date, dial_status,last_called,last_support_by, hang_up_by, arrival_date, departure_date, purpose_of_travel, remark, department, disposition,special_occassion})
            return res.status(200).json({
                status: true,
                code: 200,
                message: "Call detail added...",
                data: newCalls
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

export default AgentModel