import {
  createRecallProfile,
  archiveRecallProfile,
  getAllRecallProfiles,
  updateRecallProfile,
} from "#controllers/protected/recallProfileController.js";

import { Router } from "express";

const recallProfileRoutes = Router();

// Get all recall profiles
recallProfileRoutes.get("/", getAllRecallProfiles);
recallProfileRoutes.post("/create", createRecallProfile);
recallProfileRoutes.patch("/update/:id", updateRecallProfile);
recallProfileRoutes.patch("/archive/:id", archiveRecallProfile);

export default recallProfileRoutes;