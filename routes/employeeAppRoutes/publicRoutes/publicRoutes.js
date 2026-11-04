import { sendForgotPasswordMail } from "#config/email/emailFormats/sendClientContactForgotPasswordMail.js";
import EmployeeInvite from "#models/authModels/employeeInviteModel.js";
import Employee from "#models/authModels/employeeModel.js";
import { getAllRecallProfiles } from "#controllers/protected/recallProfileController.js";
import { getAllTags } from "#controllers/protected/tagController.js";
import {
  getAllRecallProfileTags,
  getTagsByRecallProfile,
} from "#controllers/protected/recallProfileTagController.js";
import { authRoutes } from "antopolis-express-utils/auth/authRoutes.js";
import { Router } from "express";

const models = {
  employee: Employee,
  employeeInvite: EmployeeInvite,
};

const publicRoutes = Router();

publicRoutes.use(
  "/auth",
  authRoutes({
    router: publicRoutes,
    models,
    sendForgotPasswordMail,
    folderName: "projectName/employee",
  })
);

// Public view-only routes
publicRoutes.get("/recall-profiles", getAllRecallProfiles);
publicRoutes.get("/tags", getAllTags);
publicRoutes.get("/recall-profile-tags", getAllRecallProfileTags);
publicRoutes.get("/recall-profile-tags/:recallProfileId", getTagsByRecallProfile);

export default publicRoutes;