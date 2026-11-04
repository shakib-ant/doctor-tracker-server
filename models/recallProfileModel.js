import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export const SOCIAL_PLATFORMS = [
  "website",
  "wikipedia",
  "facebook",
  "instagram",
  "x",
  "youtube",
  "linkedin",
  "imdb",
  "spotify",
  "tiktok",
  "threads",
  "snapchat",
  "pinterest",
  "reddit",
  "telegram",
  "whatsapp",
  "discord",
  "github",
  "twitch",
  "soundcloud",
];

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: SOCIAL_PLATFORMS,
      required: [true, "Please select social platform"],
    },

    url: {
      type: String,
      required: [true, "Please add social link"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const recallProfileSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add Name"],
    },

    image: {
      type: String,
      required: [true, "Please add Image"],
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Please add Date of Birth"],
    },

    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.RecallProfile ||
  model("RecallProfile", recallProfileSchema);