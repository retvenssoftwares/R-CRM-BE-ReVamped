import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pause_call_details = new mongoose.Schema({

    pause_reason :{
        type :String,
    },
    pause_time:{
        type :String,
    },
    resume_time:{
        type:String,
    },
    agent_id:{
        type: mongoose.Types.ObjectId,
    }
  
})

const pause_call = new mongoose.model("pause_call_details", pause_call_details);
export default pause_call;
