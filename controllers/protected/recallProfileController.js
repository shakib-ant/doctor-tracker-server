import { deleteObject, uploadObject } from "#config/space.js";
import recallProfileModel from "#models/recallProfileModel.js";
import recallProfileTagModel from "#models/recallProfileTagModel.js";
import tagModel from "#models/tagModel.js";

const parseJsonField = (value, fallback = []) => {
  if (!value) return fallback;

  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getTodayParts = () => {
  const today = new Date();

  return {
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

const getBirthdayExpr = ({ birthdayType, month }) => {
  const today = getTodayParts();

  if (birthdayType === "today") {
    return {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, today.month] },
        { $eq: [{ $dayOfMonth: "$dateOfBirth" }, today.day] },
      ],
    };
  }

  if (birthdayType === "upcoming") {
    return {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, today.month] },
        { $gt: [{ $dayOfMonth: "$dateOfBirth" }, today.day] },
      ],
    };
  }

  if (birthdayType === "recent") {
    return {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, today.month] },
        { $lt: [{ $dayOfMonth: "$dateOfBirth" }, today.day] },
      ],
    };
  }

  if (month) {
    return {
      $eq: [{ $month: "$dateOfBirth" }, Number(month)],
    };
  }

  return null;
};

const getBirthdayDay = (profile) => {
  const date = new Date(profile.dateOfBirth);
  return date.getDate();
};

const sortProfilesByBirthday = (profiles, type) => {
  return profiles.sort((a, b) => {
    if (type === "recent") {
      return getBirthdayDay(b) - getBirthdayDay(a);
    }

    return getBirthdayDay(a) - getBirthdayDay(b);
  });
};

// get all recall profiles
export const getAllRecallProfiles = async (req, res) => {
  try {
    const { isActive, status, search, name, birthdayType, month } = req.query;

    const query = {};

    if (isActive === "true" || status === "active") {
      query.isActive = true;
    }

    if (isActive === "false" || status === "archived") {
      query.isActive = false;
    }

    const searchValue = search || name;

    if (searchValue) {
      query.name = {
        $regex: escapeRegex(searchValue),
        $options: "i",
      };
    }

    const birthdayExpr = getBirthdayExpr({
      birthdayType,
      month,
    });

    if (birthdayExpr) {
      query.$expr = birthdayExpr;
    }

    let recallProfiles = await recallProfileModel
      .find(query)
      .sort({ createdAt: -1 });

    if (birthdayType || month) {
      recallProfiles = sortProfilesByBirthday(recallProfiles, birthdayType);
    }

    const profileIds = recallProfiles.map((p) => p._id);

    const relations = await recallProfileTagModel
      .find({ recallProfile: { $in: profileIds }, isActive: true })
      .populate("tag");

    const profileTagsMap = {};

    relations.forEach((rel) => {
      if (rel.tag && rel.tag.isActive) {
        const pid = rel.recallProfile.toString();

        if (!profileTagsMap[pid]) {
          profileTagsMap[pid] = [];
        }

        profileTagsMap[pid].push(rel.tag.name);
      }
    });

    const recallProfilesWithTags = recallProfiles.map((p) => {
      const json = p.toJSON();

      json.tags = profileTagsMap[p._id.toString()] || [];

      return json;
    });

    res.status(200).json(recallProfilesWithTags);
  } catch (error) {
    console.error("Get recall profiles error:", error);

    res.status(500).json({
      message: error.message || "Failed to get recall profiles",
    });
  }
};

// create recall profile
export const createRecallProfile = async (req, res) => {
  try {
    console.log("RECALL PROFILE BODY:", req.body);
    console.log("RECALL PROFILE FILES:", req.files);

    const { name, dateOfBirth } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Please add Name",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        message: "Please add Date of Birth",
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        message: "Please add Image",
      });
    }

    const tags = parseJsonField(req.body.tags, []);
    const socialLinks = parseJsonField(req.body.socialLinks, []);

    const file = req.files.image;

    const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
    const timestamp = Date.now();

    const fileUrl = `recall-profiles/${timestamp}-${sanitizedName}`;

    await uploadObject(fileUrl, file.data);

    const recallProfile = await recallProfileModel.create({
      name,
      image: fileUrl,
      dateOfBirth,
      socialLinks,
      isActive: req.body.isActive === "false" ? false : true,
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const trimmed = tagName.trim();

        if (!trimmed) continue;

        const tagDoc = await tagModel.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") } },
          { $setOnInsert: { name: trimmed, isActive: true } },
          { upsert: true, new: true }
        );

        await recallProfileTagModel.findOneAndUpdate(
          { recallProfile: recallProfile._id, tag: tagDoc._id },
          { $setOnInsert: { isActive: true } },
          { upsert: true, new: true }
        );
      }
    }

    const json = recallProfile.toJSON();

    json.tags = tags;

    res.status(201).json(json);
  } catch (error) {
    console.error("Create recall profile error:", error);

    res.status(500).json({
      message: error.message || "Failed to create recall profile",
    });
  }
};

// update recall profile
export const updateRecallProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const recallProfile = await recallProfileModel.findById(id);

    if (!recallProfile) {
      return res.status(404).json({
        message: "Recall profile not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    let tags = null;

    if (req.body.tags) {
      tags = parseJsonField(req.body.tags, []);
      delete updateData.tags;
    }

    if (req.body.socialLinks) {
      updateData.socialLinks = parseJsonField(req.body.socialLinks, []);
    }

    if (req.body.isActive === "true" || req.body.isActive === "false") {
      updateData.isActive = req.body.isActive === "true";
    }

    if (req.files && req.files.image) {
      if (recallProfile.image) {
        await deleteObject(recallProfile.image);
      }

      const file = req.files.image;

      const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
      const timestamp = Date.now();

      const fileUrl = `recall-profiles/${timestamp}-${sanitizedName}`;

      await uploadObject(fileUrl, file.data);

      updateData.image = fileUrl;
    }

    const updatedRecallProfile = await recallProfileModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (tags !== null && Array.isArray(tags)) {
      await recallProfileTagModel.deleteMany({ recallProfile: id });

      for (const tagName of tags) {
        const trimmed = tagName.trim();

        if (!trimmed) continue;

        const tagDoc = await tagModel.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") } },
          { $setOnInsert: { name: trimmed, isActive: true } },
          { upsert: true, new: true }
        );

        await recallProfileTagModel.findOneAndUpdate(
          { recallProfile: id, tag: tagDoc._id },
          { $setOnInsert: { isActive: true } },
          { upsert: true, new: true }
        );
      }
    }

    const activeRelations = await recallProfileTagModel
      .find({ recallProfile: id, isActive: true })
      .populate("tag");

    const json = updatedRecallProfile.toJSON();

    json.tags = activeRelations
      .filter((rel) => rel.tag && rel.tag.isActive)
      .map((rel) => rel.tag.name);

    res.status(200).json(json);
  } catch (error) {
    console.error("Update recall profile error:", error);

    res.status(500).json({
      message: error.message || "Failed to update recall profile",
    });
  }
};

// archive recall profile
export const archiveRecallProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const recallProfile = await recallProfileModel.findById(id);

    if (!recallProfile) {
      return res.status(404).json({
        message: "Recall profile not found",
      });
    }

    recallProfile.isActive = !recallProfile.isActive;

    await recallProfile.save();

    const activeRelations = await recallProfileTagModel
      .find({ recallProfile: id, isActive: true })
      .populate("tag");

    const json = recallProfile.toJSON();

    json.tags = activeRelations
      .filter((rel) => rel.tag && rel.tag.isActive)
      .map((rel) => rel.tag.name);

    res.status(200).json({
      message: `Recall profile ${recallProfile.isActive ? "unarchived" : "archived"
        } successfully`,
      data: json,
    });
  } catch (error) {
    console.error("Archive recall profile error:", error);

    res.status(500).json({
      message: error.message || "Failed to archive recall profile",
    });
  }
};