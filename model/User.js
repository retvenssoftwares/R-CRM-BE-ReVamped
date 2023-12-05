import mongoose, { Types, Model } from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    phone_number: { type: Number },
    gender : { type : String , enum : ['M', 'F'] },
    DOB : { type: String },
    password: { type: String, required: true},
    role : { type : String , enum : ['ADMIN', 'AGENT', 'SUPER_ADMIN'] },
    status : { type : String , enum : ['ACTIVE', 'INACTIVE'] },
    isVarified : { type: Boolean, default: false },
    otp : { type: Number },
    expires: {type : Date},
    isEmailVarified : { type: Boolean, default: false}
  },
  { versionKey: false, timestamp : true }
);

const User = model("user", userSchema);
export default User;
