import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add Tag Name"],
      unique: true,
      trim: true,
    },

    precedence: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.Tag || model("Tag", tagSchema);