import {
  createTag,
  archiveTag,
  getAllTags,
  updateTag,
} from "#controllers/protected/tagController.js";

import { Router } from "express";

const tagRoutes = Router();

tagRoutes.get("/", getAllTags);
tagRoutes.post("/create", createTag);
tagRoutes.patch("/update/:id", updateTag);
tagRoutes.patch("/archive/:id", archiveTag);

export default tagRoutes;
