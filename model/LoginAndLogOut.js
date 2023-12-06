import mongoose from "mongoose";

const { Schema, model } = mongoose;
const loginLogout = new mongoose.Schema({

    agent_id: { type: mongoose.Types.ObjectId },

    log_in_log_out_time: [{
        log_in_time :{
            type:String
        },
        log_out_time:{
            type:String
        }
    }],
    
})

const timeRecords = new mongoose.model("login_logOut_time", loginLogout);
export default timeRecords;