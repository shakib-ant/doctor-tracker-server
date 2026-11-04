import { sendForgotPasswordMail } from "#config/email/emailFormats/sendClientContactForgotPasswordMail.js";
import EmployeeInvite from "#models/authModels/employeeInviteModel.js";
import Employee from "#models/authModels/employeeModel.js";
import { getAllTags } from "#controllers/protected/tagController.js";
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
publicRoutes.get("/tags", getAllTags);

export default publicRoutes;
