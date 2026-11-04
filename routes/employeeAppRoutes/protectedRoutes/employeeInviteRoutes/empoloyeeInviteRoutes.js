// Imports
import { Router } from "express";
import {
    deleteInvite,
    getAllInvites,
    inviteEmployee,
    resendInvite
} from "#controllers/protected/employeeInvite/employeeInvite.js";

const employeeInviteRoutes = Router();

// Routes

employeeInviteRoutes.route("/").get(getAllInvites).post(inviteEmployee);
employeeInviteRoutes.delete("/deleteInvite/:id", deleteInvite);
employeeInviteRoutes.post('/resendInvite/:id', resendInvite)

// Export
export default employeeInviteRoutes;
