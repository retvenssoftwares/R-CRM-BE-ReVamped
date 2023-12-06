import mongoose from "mongoose";

const { Schema, model } = mongoose;

const call = new mongoose.Schema({
    guest_id: { type: mongoose.Types.ObjectId },
    agent_id: { type: mongoose.Types.ObjectId, },
    admin_id: { type: mongoose.Types.ObjectId, },


    // employee_status: { type: String },
    call_date: { type: String, required: true },
    start_time: { type: String, },
    disposition: { type: String },
    end_time: { type: String},
    hotel_name: {
        type: String,
    },
    time_to_answer: { type: String },
    remark: { type: String },
    talktime: { type: String },
    type: { type: String},
    dial_status: { type: String },
    last_called: { type: String },
    last_support_by: { type: String },
    hang_up_by: { type: String },
    guest_status: { type: String },
    remark: { type: String },
    purpose_of_travel :{ type: String},
    departure_date :{ type: String},
    arrival_date:{ type: String},
    special_occassion:{ type: String},
    call_back_date_time :{ type: String},
    department :{ type : String , enum : ['MARKETING', 'SALES','RESERVATION'] },
    //caller_type : { type : String},

});

const data = new mongoose.model("calling_details", call);
export default data;
