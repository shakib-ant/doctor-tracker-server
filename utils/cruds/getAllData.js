import mongoose from 'mongoose'

export async function getAllData({ model, req = {}, extraQuery = {}, populate = '', sort = { precedence: 1,createdAt:-1 }, searchFields = [] }) {
  // Destructure req.query with default values
  const { filter = '', limit = 20, page = 1, search } = req.query || {}

  const query = {}
  if (filter) {
    query.isActive = filter === 'active'
  }


  // Handle dynamic search fields
  if (search && searchFields.length > 0) {
    query.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' }, // Case-insensitive search
    }))

    if (mongoose.Types.ObjectId.isValid(search)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(search) })
    }
  }


  try {
    const allData = await model
      .find({ ...extraQuery, ...query })
      .sort(sort)
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .populate(populate)
      .lean()
      .exec()

    const totalCount = await model.countDocuments({ ...extraQuery, ...query })

    return {
      message: 'All Data Fetched Successfully',
      data: allData,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      currentPage: parseInt(page, 10),
    }
  } catch (error) {
    throw new Error('Error fetching data: ' + error.message)
  }
}
