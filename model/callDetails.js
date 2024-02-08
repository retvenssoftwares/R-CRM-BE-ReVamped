import mongoose from "mongoose";

const { Schema, model } = mongoose;

const call = new mongoose.Schema({
    guest_id: { type: mongoose.Types.ObjectId },
    agent_id: { type: mongoose.Types.ObjectId, },
    admin_id: { type: mongoose.Types.ObjectId, },

    // employee_status: { type: String },
    call_date: { type: String, required: true },
    call_time: { type: String },
    start_time: { type: String },
    disposition: { type: mongoose.Types.ObjectId },
    end_time: { type: String, default: "" },
    hotel_name: {
        type: String,
        default: ""
    },
    time_to_answer: { type: String, default: "" },
    remark: { type: String, default: "" },
    talktime: { type: String, default: "" },
    type: { type: String, default: "" },
    dial_status: { type: String, default: "" },
    last_called: { type: String, default: "" },
    last_support_by: { type: String, default: "" },
    hang_up_by: { type: String, default: "" },
    guest_status: { type: String, default: "" },
    remark: { type: String, default: "" },
    purpose_of_travel: { type: String, enum: ['WEDDING', 'COUPLE', 'BUSINESS', 'FAMILY', 'OTHERS'] },
    departure_date: { type: String, default: "" },
    arrival_date: { type: String, default: "" },
    special_occassion: { type: String, default: "" },
    reservationId: { type: String, default: "" },
    hang_up_cause: { type: String, default: "" },
    call_back_date_time: { type: String, default: "" },
    department: { type: String, enum: ['MARKETING', 'SALES', 'RESERVATION'] },
    caller_type: { type: String, enum: ['INTERNAL_TRANSFER', 'HOTELS', 'GUEST'] },
    hotel_destination: { type: String, default: "" },

}, { timestamps: true });

const data = new mongoose.model("calling_details", call);
export default data;
