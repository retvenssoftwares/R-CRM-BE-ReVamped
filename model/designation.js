import mongoose from "mongoose";

const { Schema, model } = mongoose;

const designationSchema = mongoose.Schema(
  {
    designation: {
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

const designation = model("designation", designationSchema);
export default designation;
