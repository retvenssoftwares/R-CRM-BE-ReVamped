import mongoose  from "mongoose";

const { Schema, model } = mongoose;

const reservationSchema = mongoose.Schema(
  {
    hotel_r_code: {
      type: String,
      default:""
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
      default:""
    },
    special_occasion: {
      type: String,
      default:""
    },
    departure_date: {
      type: String,
      default:""
    },
    purpose_of_travel: {
      type: String,
      default:""
    },
    guest_special_request: {
      type: String,
      default:""
    },
    discount: {
      type: String,
      default:""
    },
    payment_mode: {
      type: String,
      default:""
    },
    payment_link: {
      type: String,
      default:""
    },
    billing_instructions: {
      type: String,
      default:""
    },
    payment_id: {
      type: String,
      default:""
    },
    business_source: {
      type: String,
      default:""
    },
    market_segment: {
      type: String,
      default:""
    },
    company_name: {
      type: String,
      default:""
    },
    company_address: {
      type: String,
      default:""
    },
    caller_type: {
      type: String,
      default:""
    },
    calls_details: {
      type: String,
      default:""
    },
    callback_date_time: {
      type: String,
      default:""
    },
    salutation: {
      type: String,
      default:""
    },
    remark: {
      type: String,
      default:""
    },
    department: {
      type: String,
      default:""
    },
    gst_number: {
      type: String,
      default:""
    },
    reservation_type: {
      type: String,
      default:""

    },
    reservation_number: {
      type: String,
      default:""
    },

    made_by: {
      type: String,
      required: false,
      default:""
    },

    business_source: {
      type: String,
      default:""
    },
    reservation_type: {
      type: String,
      default:""
    },
    total_price: {
      type: String,
      default:""
    },
    room_nights: {
      type: String,
      default:""
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reservation", reservationSchema);
