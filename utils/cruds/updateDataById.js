import { updateObject } from "#config/space.js"; // Import the updateObject function from config

export const updateDataById = async ({ model, req, extraKey, extraQueryValue }) => {
  try {
    // Extract the ID from request parameters
    const { id } = req.params;

    // Build a scoped query if extraKey is provided
    const findQuery = extraKey && extraQueryValue ? { _id: id, [extraKey]: extraQueryValue } : { _id: id };

    // Find the existing item by ID (and scope)
    const item = await model.findOne(findQuery);
    if (!item) {
      throw new Error("Item not found"); // Throw error if item doesn't exist or doesn't belong to scope
    }

    // Helper to update a file and set req.body[field]
    const handleUpdate = async (file, field, subfolder = "images", existing = undefined) => {
      const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
      const timestamp = Date.now();
      const fileUrl = `${model.modelName.toLowerCase()}/${subfolder}/${sanitizedName}-${timestamp}`;
      await updateObject(fileUrl, file.data, existing);
      req.body[field] = fileUrl;
    };

    // image fallback - keep existing behavior
    if (req.files && req.files.image) {
      await handleUpdate(req.files.image, "image", "images", item.image);
    }

    // bookCover update
    if (req.files && req.files.bookCover) {
      await handleUpdate(req.files.bookCover, "bookCover", "images", item.bookCover);
    }

    // pdf update
    if (req.files && req.files.pdf) {
      await handleUpdate(req.files.pdf, "pdf", "pdfs", item.pdf);
    }

    // Update the item in the database with the new data, ensuring scope
    const updatedItem = await model.findOneAndUpdate(findQuery, req.body, { new: true });
    if (!updatedItem) {
      throw new Error("Item not found"); // Throw error if update fails
    }

    return updatedItem; // Return the updated item
  } catch (err) {
    throw new Error(err.message); // Re-throw the error to be handled by the controller
  }
};