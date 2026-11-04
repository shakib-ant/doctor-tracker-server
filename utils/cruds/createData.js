import { uploadObject } from "#config/space.js"; // Import the uploadObject function from config
import { validationResult } from "express-validator"; // Import validationResult for form validation

export const createData = async ({ model, req, extraKey, extraQueryValue }) => {
    // Validate the request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new Error("Validation failed"); // Throw error if validation fails (can be customized to include details)
    }

    try {
        // Helper to upload a file and set req.body[field]
        const handleUpload = async (file, field, subfolder = "images") => {
            const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
            const timestamp = Date.now();
            const fileUrl = `${model.modelName.toLowerCase()}/${subfolder}/${sanitizedName}-${timestamp}`;
            await uploadObject(fileUrl, file.data);
            req.body[field] = fileUrl;
        };

        // image fallback - keep existing behavior
        if (req.files && req.files.image) {
            await handleUpload(req.files.image, "image", "images");
        }

        // bookCover upload
        if (req.files && req.files.bookCover) {
            await handleUpload(req.files.bookCover, "bookCover", "images");
        }

        // pdf upload
        if (req.files && req.files.pdf) {
            await handleUpload(req.files.pdf, "pdf", "pdfs");
        }

        // If scoped by an extra query field (e.g., book), enforce it on the created item
        if (extraKey && extraQueryValue) {
            req.body[extraKey] = extraQueryValue;
        }

        // Create a new item instance with the validated req.body data
        const item = new model(req.body);
        // Save the new item to the database
        await item.save();
        return item; // Return the created item
    } catch (err) {
        throw new Error(err.message); // Re-throw the error to be handled by the controller
    }
};