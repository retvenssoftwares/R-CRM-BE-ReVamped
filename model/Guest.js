import mongoose from "mongoose";

const { Schema, model } = mongoose;

const guestDetailSchema = mongoose.Schema({
    agent_id:{
       type: mongoose.Types.ObjectId
    },
    salutation:{
        type:String
    },

    guest_title:{
        type:String,
        
    },
    guest_first_name:{
        type:String,
        
    },
    guest_last_name:{
        type:String,
        
    },
    guest_gender:{
        type:String,
        
    },
    guest_mobile_number:{
        type:String,
        
    },
    guest_email:{
        type:String,
        
    },
    guest_special_request:{
        type:String,
        
    },
    guest_address_1:{
        type:String,
        
    },
    guest_address_2:{
        type:String,
        
    },
    guest_city:{
        type:String,
        
    },
    guest_state:{
        type:String,
        
    },
    guest_country:{
        type:String,
        
    },
    guest_zip_code:{
        type:String,
        
    },
    guest_fax:{
        type:String,
        
    },
    guest_device:{
        type:String,
        
    },
 

    guest_location:{
        type:String,
        
    },
    alternate_contact:{
        type:String
    }
   
   
  

        

}, {timestamps:true})

const Guest = model("guest_detail", guestDetailSchema);
export default Guest;
