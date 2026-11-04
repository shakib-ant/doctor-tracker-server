import { Router } from "express";
import employeeInviteRoutes from "./employeeInviteRoutes/empoloyeeInviteRoutes.js";
import employeeRoutes from "./employeeRoutes/employeeRoutes.js";
import tagRoutes from "./tagRoutes.js";
import doctorRoutes from "./doctorRoutes.js";

const protectedRoutes = Router();

protectedRoutes.use("/invites", employeeInviteRoutes);
protectedRoutes.use("/employees", employeeRoutes);
protectedRoutes.use("/tags", tagRoutes);
protectedRoutes.use("/doctors", doctorRoutes);

export default protectedRoutes;
