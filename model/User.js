// import mongoose  from "mongoose";

// const { Schema, model } = mongoose;

// const userSchema = new Schema(
//   {
//     name: { type: String },
//     email: { type: String },
//     phone_number: { type: Number },
//     gender : { type : String , enum : ['M', 'F'] },
//     DOB : { type: String },
//     password: { type: String, required: true},
//     role : { type : String , enum : ['ADMIN', 'AGENT', 'SUPER_ADMIN'] },
//     status : { type : String , enum : ['ACTIVE', 'INACTIVE'] },
//     isVarified : { type: Boolean, default: false },
//     otp : { type: Number },
//     expires: {type : Date},
//     isEmailVarified : { type: Boolean, default: false}
//   },
//   { versionKey: false, timestamp : true }
// );

// const User = model("user", userSchema);
// export default User;


import mongoose  from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, default: "User"},
    email: { type: String },
    phone_number: { type: Number },
    gender : { type : String , enum : ['MALE', 'FEMALE','OTHER'] },
    dob : { type: String },
    password: { type: String, required: true},
    role : { type : String, default : "ADMIN"},
    status : { type : String , enum : ['ACTIVE', 'INACTIVE'] , default : "ACTIVE"},
    is_verified : { type: Boolean, default: false },
    otp : { type: Number },
    expires: {type : Number, default : null},
    is_email_Verified : { type: Boolean, default: false},
    created_by:{type:mongoose.Types.ObjectId,enum:["ADMIN"]},
    department : {type:String},
    designation :{tyope:String},
    agent_id:{type:Number},
    agentext:{type:Number},
    coral_admin_username : {type : String},
    coral_admin_password : {type : String},
    designation : {type : String},
    department:{type:String}
  },
  { versionKey: false, timestamp : true }
);

const User = model("user", userSchema);
export default User;