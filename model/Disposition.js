import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dispositionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default:""
    },
  },
  { versionKey: false }
);

const Disposition = model("disposition", dispositionSchema);
export default Disposition;
