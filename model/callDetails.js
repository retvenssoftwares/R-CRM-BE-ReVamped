import mongoose from "mongoose";

const { Schema, model } = mongoose;

const call = new mongoose.Schema({
    guest_id: { type: mongoose.Types.ObjectId },
    employee_id: { type: String, },
    employee_status: { type: String },
    call_date: { type: String },
    start_time: { type: String, },
    disposition: { type: String },
    end_time: { type: String, },
    hotel_name: {
        type: String,
        default: ''
    },
    time_to_answer: { type: String },
    remark: { type: String },
    talktime: { type: String },
    caller_id: { type: String },
    type: { type: String},
    dial_status: { type: String },
    last_called: { type: String },
    last_support_by: { type: String },
    hang_up_by: { type: String },
    guest_status: { type: String },
    comments: { type: String }

});

const data = new mongoose.model("calling_details", call);
export default data;
