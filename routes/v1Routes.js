import { Router } from "express";
import { protectForEmployee } from "#middlewares/authMiddleware.js";
import { loginEmployee, requestAccess } from "#controllers/public/authController.js";
import doctorRoutes from "./employeeAppRoutes/protectedRoutes/doctorRoutes.js";
import patientRoutes from "./employeeAppRoutes/protectedRoutes/patientRoutes.js";
import analyticsRoutes from "./employeeAppRoutes/protectedRoutes/analyticsRoutes.js";
import accessRoutes from "./employeeAppRoutes/protectedRoutes/accessRoutes.js";
import tagRoutes from "./employeeAppRoutes/protectedRoutes/tagRoutes.js";

const v1 = Router();

const authRouter = Router();
authRouter.post("/login", loginEmployee);
authRouter.post("/request-access", requestAccess);
v1.use("/auth", authRouter);

v1.use("/doctors", protectForEmployee, doctorRoutes);
v1.use("/patients", protectForEmployee, patientRoutes);
v1.use("/analytics", protectForEmployee, analyticsRoutes);
v1.use("/access", protectForEmployee, accessRoutes);
v1.use("/tags", tagRoutes);

export default v1;
