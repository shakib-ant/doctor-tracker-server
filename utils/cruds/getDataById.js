export const getDataById = async ({ model, req, populate = '', extraKey, extraQueryValue }) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error('ID is required');

    // Build a scoped query if extraKey is provided
    const findQuery = extraKey && extraQueryValue ? { _id: id, [extraKey]: extraQueryValue } : { _id: id };

    let query = model.findOne(findQuery);
    if (populate) query = query.populate(populate);

    const item = await query.lean().exec();
    if (!item) throw new Error('Item not found');

    return item;
  } catch (err) {
    throw new Error(err.message);
  }
};
