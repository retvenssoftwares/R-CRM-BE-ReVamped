import mongoose  from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    phone_number: { type: Number },
    gender : { type : String , enum : ['MALE', 'FEMALE','OTHER'] },
    dob : { type: String },
    password: { type: String, required: true},
    role : { type : String , enum : ['ADMIN', 'AGENT', 'SUPER_ADMIN', 'GUEST'] },
    status : { type : String , enum : ['ACTIVE', 'INACTIVE'] },
    is_verified : { type: Boolean, default: false },
    otp : { type: Number },
    expires: {type : Date},
    is_email_Verified : { type: Boolean, default: false},
    created_by:{type:mongoose.Types.ObjectId,enum:["ADMIN"]},
    agent_id:{type:Number},
    agentext:{type:Number},
    address_1:{type:String},
    address_2:{type:String},
    city : {type:String},
    state : {type:String},
    country : {type:String},
    zip_code : {type:String},
    location:{type:String},

  },
  { versionKey: false, timestamp : true }
);

const User = model("user", userSchema);
export default User;
