import { Router } from "express";
import employeeInviteRoutes from "./employeeInviteRoutes/empoloyeeInviteRoutes.js";
import employeeRoutes from "./employeeRoutes/employeeRoutes.js";
import accessRoutes from "./accessRoutes.js";
import tagRoutes from "./tagRoutes.js";
import doctorRoutes from "./doctorRoutes.js";
import patientRoutes from "./patientRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";

const protectedRoutes = Router();

protectedRoutes.use("/invites", employeeInviteRoutes);
protectedRoutes.use("/employees", employeeRoutes);
protectedRoutes.use("/access", accessRoutes);
protectedRoutes.use("/tags", tagRoutes);
protectedRoutes.use("/doctors", doctorRoutes);
protectedRoutes.use("/patients", patientRoutes);
protectedRoutes.use("/analytics", analyticsRoutes);

export default protectedRoutes;
