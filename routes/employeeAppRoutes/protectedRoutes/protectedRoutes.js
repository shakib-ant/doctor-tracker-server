import { Router } from "express";
import employeeInviteRoutes from "./employeeInviteRoutes/empoloyeeInviteRoutes.js";
import employeeRoutes from "./employeeRoutes/employeeRoutes.js";
import recallProfileRoutes from "./recallProfileRoutes.js";
import tagRoutes from "./tagRoutes.js";
import recallProfileTagRoutes from "./recallProfileTagRoutes.js";
import doctorRoutes from "./doctorRoutes.js";

const protectedRoutes = Router();

protectedRoutes.use("/invites", employeeInviteRoutes);
protectedRoutes.use("/employees", employeeRoutes);
protectedRoutes.use("/recall-profiles", recallProfileRoutes);
protectedRoutes.use("/tags", tagRoutes);
protectedRoutes.use("/recall-profile-tags", recallProfileTagRoutes);
protectedRoutes.use("/doctors", doctorRoutes);

export default protectedRoutes;
