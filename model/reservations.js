import mongoose  from "mongoose";

const { Schema, model } = mongoose;

const reservationSchema = mongoose.Schema(
  {
    hotel_r_code: {
      type: String,
    },
    employee_id: {
      type: String,
      default: mongoose.Types.ObjectId,
    },
    guest_id: {
      type: String,
      default: mongoose.Types.ObjectId,
    },
    arrival_date: {
      type: String,
    },
    special_occasion: {
      type: String,
    },
    departure_date: {
      type: String,
    },
    purpose_of_travel: {
      type: String,
    },
    guest_special_request: {
      type: String,
    },
    discount: {
      type: String,
    },
    payment_mode: {
      type: String,
    },
    payment_link: {
      type: String,
    },
    billing_instructions: {
      type: String,
    },
    payment_id: {
      type: String,
    },
    business_source: {
      type: String,
    },
    market_segment: {
      type: String,
    },
    company_name: {
      type: String,
    },
    company_address: {
      type: String,
    },
    caller_type: {
      type: String,
    },
    calls_details: {
      type: String,
    },
    callback_date_time: {
      type: String,
    },
    salutation: {
      type: String,
    },
    remark: {
      type: String,
    },
    department: {
      type: String,
    },
    gst_number: {
      type: String,
    },
    reservation_type: {
      type: String,
    },
    reservation_number: {
      type: String,
    },

    made_by: {
      type: String,
      required: false,
    },

    business_source: {
      type: String,
    },
    reservation_type: {
      type: String,
    },
    total_price: {
      type: String,
    },
    room_nights: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reservation", reservationSchema);
