// import Client from "#models/clientsModel.js";

import { Router } from "express";
import employeeInviteRoutes from "./employeeInviteRoutes/empoloyeeInviteRoutes.js";
import employeeRoutes from "./employeeRoutes/employeeRoutes.js";
import recallProfileRoutes from "./recallProfileRoutes.js";
import tagRoutes from "./tagRoutes.js";
import recallProfileTagRoutes from "./recallProfileTagRoutes.js";

const protectedRoutes = Router();

protectedRoutes.use("/invites", employeeInviteRoutes);
protectedRoutes.use("/employees", employeeRoutes);
protectedRoutes.use("/recall-profiles", recallProfileRoutes);
protectedRoutes.use("/tags", tagRoutes);
protectedRoutes.use("/recall-profile-tags", recallProfileTagRoutes);



export default protectedRoutes;