import tagModel from "#models/tagModel.js";

// get all tags
export const getAllTags = async (req, res) => {
  try {
    const { isActive, status } = req.query;

    const query = {};

    if (isActive === "true" || status === "active") {
      query.isActive = true;
    }

    if (isActive === "false" || status === "archived") {
      query.isActive = false;
    }

    const tags = await tagModel
      .find(query)
      .sort({ precedence: 1, createdAt: -1 });

    res.status(200).json(tags);
  } catch (error) {
    console.error("Get tags error:", error);

    res.status(500).json({
      message: error.message || "Failed to get tags",
    });
  }
};

// create tag
export const createTag = async (req, res) => {
  try {
    const { name, precedence } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Please add Tag Name",
      });
    }

    const tagExists = await tagModel.findOne({ name: name.trim() });

    if (tagExists) {
      return res.status(400).json({
        message: "Tag with this name already exists",
      });
    }

    const tag = await tagModel.create({
      name: name.trim(),
      precedence:
        precedence !== undefined && precedence !== ""
          ? Number(precedence)
          : 0,
      isActive: req.body.isActive === "false" ? false : true,
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error("Create tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to create tag",
    });
  }
};

// update tag
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, precedence } = req.body;

    const tag = await tagModel.findById(id);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    const updateData = {};

    if (name !== undefined) {
      const tagExists = await tagModel.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (tagExists) {
        return res.status(400).json({
          message: "Tag with this name already exists",
        });
      }

      updateData.name = name.trim();
    }

    if (precedence !== undefined) {
      updateData.precedence = precedence !== "" ? Number(precedence) : 0;
    }

    if (req.body.isActive === "true" || req.body.isActive === "false") {
      updateData.isActive = req.body.isActive === "true";
    }

    const updatedTag = await tagModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedTag);
  } catch (error) {
    console.error("Update tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to update tag",
    });
  }
};

// archive tag
export const archiveTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await tagModel.findById(id);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    tag.isActive = !tag.isActive;

    await tag.save();

    res.status(200).json({
      message: `Tag ${tag.isActive ? "unarchived" : "archived"} successfully`,
      data: tag,
    });
  } catch (error) {
    console.error("Archive tag error:", error);

    res.status(500).json({
      message: error.message || "Failed to archive tag",
    });
  }
};