import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const doctorSchema = new Schema(
  {
    docType: {
      type: String,
      default: "doctor",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    hospital: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience years cannot be negative"],
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: [0, "Consultation fee cannot be negative"],
      default: 0,
    },
    about: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    availableDays: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Empty",
  }
);

doctorSchema.pre(/^find/, function () {
  this.where({ docType: "doctor" });
});

doctorSchema.pre("countDocuments", function () {
  this.where({ docType: "doctor" });
});

doctorSchema.pre("save", function (next) {
  this.docType = "doctor";
  if (next) next();
});

doctorSchema.index({ docType: 1, name: 1, specialization: 1 });
doctorSchema.index({ docType: 1, specialization: 1, isActive: 1 });
doctorSchema.index({ docType: 1, isActive: 1, createdAt: -1 });
doctorSchema.index({
  name: "text",
  specialization: "text",
  department: "text",
  hospital: "text",
});

export default models.Doctor || model("Doctor", doctorSchema, "Empty");
