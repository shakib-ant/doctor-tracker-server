import recallProfileTagModel from "#models/recallProfileTagModel.js";
import recallProfileModel from "#models/recallProfileModel.js";
import tagModel from "#models/tagModel.js";

// get all recall profile tags
export const getAllRecallProfileTags = async (req, res) => {
  try {
    const { isActive, status, recallProfileId } = req.query;

    const query = {};

    if (isActive === "true" || status === "active") {
      query.isActive = true;
    }

    if (isActive === "false" || status === "archived") {
      query.isActive = false;
    }

    if (recallProfileId) {
      query.recallProfile = recallProfileId;
    }

    const recallProfileTags = await recallProfileTagModel
      .find(query)
      .populate("recallProfile")
      .populate("tag")
      .sort({ precedence: 1, createdAt: -1 });

    // Filter out any populated fields that ended up null (e.g. if profile/tag was deleted)
    const filtered = recallProfileTags.filter(
      (item) => item.recallProfile && item.tag
    );

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Get recall profile tags error:", error);

    res.status(500).json({
      message: error.message || "Failed to get recall profile tags",
    });
  }
};

// create recall profile tag
export const createRecallProfileTag = async (req, res) => {
  try {
    const { recallProfile, tag, precedence } = req.body;

    if (!recallProfile) {
      return res.status(400).json({
        message: "Please select Recall Profile",
      });
    }

    if (!tag) {
      return res.status(400).json({
        message: "Please select Tag",
      });
    }

    // Check if relationship already exists
    const exists = await recallProfileTagModel.findOne({ recallProfile, tag });

    if (exists) {
      return res.status(400).json({
        message: "This Recall Profile is already linked to this Tag",
      });
    }

    // Check if both entities exist
    const profileObj = await recallProfileModel.findById(recallProfile);

    if (!profileObj) {
      return res.status(404).json({ message: "Recall Profile not found" });
    }

    const tagObj = await tagModel.findById(tag);

    if (!tagObj) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const recallProfileTag = await recallProfileTagModel.create({
      recallProfile,
      tag,
      precedence:
        precedence !== undefined && precedence !== ""
          ? Number(precedence)
          : 0,
      isActive: req.body.isActive === "false" ? false : true,
    });

    // Populate and return
    const populated = await recallProfileTagModel
      .findById(recallProfileTag._id)
      .populate("recallProfile")
      .populate("tag");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create recall profile tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to create recall profile tag",
    });
  }
};

// update recall profile tag
export const updateRecallProfileTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { recallProfile, tag, precedence } = req.body;

    const recallProfileTag = await recallProfileTagModel.findById(id);

    if (!recallProfileTag) {
      return res.status(404).json({
        message: "Recall Profile Tag relation not found",
      });
    }

    const updateData = {};

    if (recallProfile !== undefined) {
      const profileObj = await recallProfileModel.findById(recallProfile);

      if (!profileObj) {
        return res.status(404).json({ message: "Recall Profile not found" });
      }

      updateData.recallProfile = recallProfile;
    }

    if (tag !== undefined) {
      const tagObj = await tagModel.findById(tag);

      if (!tagObj) {
        return res.status(404).json({ message: "Tag not found" });
      }

      updateData.tag = tag;
    }

    if (precedence !== undefined) {
      updateData.precedence = precedence !== "" ? Number(precedence) : 0;
    }

    if (recallProfile !== undefined || tag !== undefined) {
      const finalProfile =
        recallProfile !== undefined ? recallProfile : recallProfileTag.recallProfile;
      const finalTag = tag !== undefined ? tag : recallProfileTag.tag;

      const exists = await recallProfileTagModel.findOne({
        recallProfile: finalProfile,
        tag: finalTag,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          message: "This Recall Profile is already linked to this Tag",
        });
      }
    }

    if (req.body.isActive === "true" || req.body.isActive === "false") {
      updateData.isActive = req.body.isActive === "true";
    }

    const updated = await recallProfileTagModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("recallProfile")
      .populate("tag");

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update recall profile tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to update recall profile tag",
    });
  }
};

// archive recall profile tag
export const archiveRecallProfileTag = async (req, res) => {
  try {
    const { id } = req.params;

    const recallProfileTag = await recallProfileTagModel.findById(id);

    if (!recallProfileTag) {
      return res.status(404).json({
        message: "Recall Profile Tag relation not found",
      });
    }

    recallProfileTag.isActive = !recallProfileTag.isActive;

    await recallProfileTag.save();

    const populated = await recallProfileTagModel
      .findById(recallProfileTag._id)
      .populate("recallProfile")
      .populate("tag");

    res.status(200).json({
      message: `Recall Profile Tag relation ${
        recallProfileTag.isActive ? "unarchived" : "archived"
      } successfully`,
      data: populated,
    });
  } catch (error) {
    console.error("Archive recall profile tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to archive recall profile tag",
    });
  }
};

export const getTagsByRecallProfile = async (req, res) => {
  const { recallProfileId } = req.params;

  try {
    const tags = await recallProfileTagModel
      .find({ recallProfile: recallProfileId, isActive: true })
      .populate("tag")
      .sort({ precedence: 1, createdAt: -1 });

    res.status(200).json(tags);
  } catch (error) {
    console.error("Get tags by recall profile error:", error);

    res.status(500).json({
      message: error.message || "Failed to get tags for recall profile",
    });
  }
};