export const getSinlgeDataById = async ({ model, req }) => {

    try {
        const item = await model.findById(req.params.id);
        if (!item) {
            throw new Error("Item not found");
        }
        return item;
    } catch (err) {
        throw new Error(err.message); // Throw error to be caught in controller
    }
};