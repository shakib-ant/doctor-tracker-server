import { sendForgotPasswordMail } from "#config/email/emailFormats/sendClientContactForgotPasswordMail.js";
import EmployeeInvite from "#models/authModels/employeeInviteModel.js";
import Employee from "#models/authModels/employeeModel.js";
import { getAllTags } from "#controllers/protected/tagController.js";
import { loginEmployee, requestAccess } from "#controllers/public/authController.js";
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

// Standard REST direct login routes
publicRoutes.post("/auth/login", loginEmployee);
publicRoutes.post("/login", loginEmployee);

// Public access / join request routes
publicRoutes.post("/auth/request-access", requestAccess);
publicRoutes.post("/request-access", requestAccess);

// Public view-only routes
publicRoutes.get("/tags", getAllTags);

export default publicRoutes;
