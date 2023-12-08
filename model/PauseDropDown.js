import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pause_call = new mongoose.Schema({

    pause_reason :{ type : String},
   
  
})

const pause_call_dropDown = new mongoose.model("pause_call_DropDown", pause_call);
export default pause_call_dropDown;