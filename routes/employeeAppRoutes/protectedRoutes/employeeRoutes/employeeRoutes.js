// Imports
import { Router } from "express";
import {archiveEmployee,getAllEmployees} from "#controllers/protected/employee/employee.js";

const employeeRoutes = Router();

// Routes

employeeRoutes.get("/", getAllEmployees);
employeeRoutes.patch("/archive/:id", archiveEmployee);


// Export
export default employeeRoutes;
