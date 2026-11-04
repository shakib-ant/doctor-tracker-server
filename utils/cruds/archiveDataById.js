
export const archiveDataById = async ({ model, req, extraKey, extraQueryValue }) => {
  try {
    const { id } = req.params;

    // Build a scoped query if extraKey is provided
    const findQuery = extraKey && extraQueryValue ? { _id: id, [extraKey]: extraQueryValue } : { _id: id };

    const item = await model.findOne(findQuery);
    if (!item) throw new Error("Item not found");

    // Determine new isActive value: if caller provided explicit value, use it; otherwise toggle
    let newIsActive;
    if (req.body && typeof req.body.isActive !== 'undefined') {
      newIsActive = req.body.isActive;
    } else {
      newIsActive = !item.isActive;
    }

    const updated = await model.findOneAndUpdate(findQuery, { isActive: newIsActive }, { new: true });
    if (!updated) throw new Error("Failed to update item");

    return updated;
  } catch (err) {
    throw new Error(err.message);
  }
};
