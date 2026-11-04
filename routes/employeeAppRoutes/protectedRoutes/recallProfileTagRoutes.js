import {
  createRecallProfileTag,
  archiveRecallProfileTag,
  getAllRecallProfileTags,
  updateRecallProfileTag,
} from "#controllers/protected/recallProfileTagController.js";

import { Router } from "express";

const recallProfileTagRoutes = Router();

recallProfileTagRoutes.get("/", getAllRecallProfileTags);
recallProfileTagRoutes.post("/create", createRecallProfileTag);
recallProfileTagRoutes.patch("/update/:id", updateRecallProfileTag);
recallProfileTagRoutes.patch("/archive/:id", archiveRecallProfileTag);

export default recallProfileTagRoutes;
