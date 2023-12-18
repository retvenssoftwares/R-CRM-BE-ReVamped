import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dispositionSchema = mongoose.Schema(
  {
    name: {
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

const Disposition = model("disposition", dispositionSchema);
export default Disposition;
