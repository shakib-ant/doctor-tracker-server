import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const recallProfileTagSchema = new Schema(
  {
    recallProfile: {
      type: Schema.Types.ObjectId,
      ref: "RecallProfile",
      required: [true, "Please select Recall Profile"],
    },
    tag: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      required: [true, "Please select Tag"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of relations
recallProfileTagSchema.index({ recallProfile: 1, tag: 1 }, { unique: true });

export default models.RecallProfileTag ||
  model("RecallProfileTag", recallProfileTagSchema);
