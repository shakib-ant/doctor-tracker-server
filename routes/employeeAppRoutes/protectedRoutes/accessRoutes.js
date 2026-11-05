import { Router } from "express";
import {
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getAllStaffUsers,
  updateUserRole,
  toggleUserStatus,
  directAddAdmin,
} from "#controllers/protected/accessController.js";

const accessRoutes = Router();

accessRoutes.get("/requests", getAccessRequests);
accessRoutes.patch("/approve/:id", approveAccessRequest);
accessRoutes.delete("/reject/:id", rejectAccessRequest);
accessRoutes.get("/users", getAllStaffUsers);
accessRoutes.patch("/role/:id", updateUserRole);
accessRoutes.patch("/status/:id", toggleUserStatus);
accessRoutes.post("/invite", directAddAdmin);

export default accessRoutes;

