import mongoose from "mongoose";

const { Schema, model } = mongoose;

const guestDetailSchema = mongoose.Schema({
    agent_id:{
       type: mongoose.Types.ObjectId
    },
    salutation:{
        type:String,
        default:""
    },

    guest_title:{
        type:String,
        default:""
        
    },
    guest_first_name:{
        type:String,
        default:""
        
    },
    guest_last_name:{
        type:String,
        default:""
    },
    guest_gender:{
        type:String,
        default:""
    },
    guest_mobile_number:{
        type:String,
        default:""
    },
    guest_email:{
        type:String,
        default:""
    },
    guest_special_request:{
        type:String,
        default:""
        
    },
    guest_address_1:{
        type:String,
        default:""
    },
    guest_address_2:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:""
    },
    zip_code:{
        type:String,
        default:""
    },
    guest_fax:{
        type:String,
        default:""
    },
    guest_device:{
        type:String,
        default:""
    },

    alternate_contact:{
        type:String,
        default:""
    }
   
   

}, {timestamps:true})

const Guest = model("guest_detail", guestDetailSchema);
export default Guest;
