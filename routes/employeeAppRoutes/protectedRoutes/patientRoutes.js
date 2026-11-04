import { Router } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByDoctor,
} from "#controllers/protected/patientController.js";

const patientRoutes = Router();

patientRoutes.get("/", getAllPatients);
patientRoutes.post("/", createPatient);
patientRoutes.get("/by-doctor/:doctorId", getPatientsByDoctor);
patientRoutes.get("/:id", getPatientById);
patientRoutes.patch("/:id", updatePatient);
patientRoutes.delete("/:id", deletePatient);

export default patientRoutes;

