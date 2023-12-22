import mongoose from "mongoose";

const { Schema, model } = mongoose;

const hotelSchema = mongoose.Schema(
  {
    hotel_name: {
      type: String,
      default:""
    },

    short_code : {
      type:String,
      default:""
    },

    display_status:{
      type:String,
      default:"1"
    },

    addedBy:{
      type : String,
      default:""
    }
  },
 
  { versionKey: false }
);

const hotel = model("hotel", hotelSchema);
export default hotel;
