import mongoose from "mongoose";

const { Schema, model } = mongoose;

const departmentSchema = mongoose.Schema(
  {
    department_name: {
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

const department = model("department", departmentSchema);
export default department;
