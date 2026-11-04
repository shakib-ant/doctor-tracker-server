import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const patientSchema = new Schema(
  {
    docType: {
      type: String,
      default: "patient",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters"],
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [130, "Age cannot exceed 130"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not a valid gender",
      },
      default: "Male",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    condition: {
      type: String,
      required: [true, "Medical condition is required"],
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Recovered", "Critical", "Under Observation"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Assigned doctor is required"],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "Empty",
  }
);

patientSchema.pre(/^find/, function () {
  this.where({ docType: "patient" });
});

patientSchema.pre("countDocuments", function () {
  this.where({ docType: "patient" });
});

patientSchema.pre("save", function (next) {
  this.docType = "patient";
  if (next) next();
});

patientSchema.index({ docType: 1, doctor: 1, createdAt: -1 });
patientSchema.index({ docType: 1, condition: 1 });
patientSchema.index({ docType: 1, admissionDate: -1 });
patientSchema.index({ name: "text", condition: "text" });

const Patient = models.Patient || model("Patient", patientSchema, "Empty");

export default Patient;
