import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dispositionSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { versionKey: false }
);

const Disposition = model("disposition", dispositionSchema);
export default Disposition;
