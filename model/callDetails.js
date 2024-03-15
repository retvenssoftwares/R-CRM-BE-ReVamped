import mongoose from "mongoose";

const { Schema, model } = mongoose;

const call = new mongoose.Schema({
    guest_id: { type: mongoose.Types.ObjectId },
    agent_id: { type: mongoose.Types.ObjectId,ref:"agent", default: "65f456b77d5ca61a3a9baea9"},
    admin_id: { type: mongoose.Types.ObjectId, },

    // employee_status: { type: String },
    call_date: { type: String, required: true },
    call_time: { type: String },
    start_time: { type: String },
    disposition: { type: mongoose.Types.ObjectId,ref:"disposition", default:"65f45b037d5ca61a3a9baeab" },
    end_time: { type: String, default: "" },
    hotel_name: { type: mongoose.Types.ObjectId,ref:"hotel", default:"65f42628e260c1a5d77f7c69" },
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
    purpose_of_travel: { type: String, default: ""  },
    departure_date: { type: String, default: "" },
    arrival_date: { type: String, default: "" },
    special_occassion: { type: String, default: "" },
    reservationId: { type: String, default: "" },
    hang_up_cause: { type: String, default: "" },
    call_back_date_time: { type: String, default: "" },
    department: { type: String, default: ""},
    caller_type: { type: String, default: ""},
    hotel_destination: { type: String, default: "" },

}, { timestamps: true });

const data = new mongoose.model("calling_details", call);
export default data;
