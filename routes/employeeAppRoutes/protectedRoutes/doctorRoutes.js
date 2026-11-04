import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  archiveDoctor,
} from "#controllers/protected/doctorController.js";
import {
  getPatientsByDoctor,
  createPatient,
  deletePatient,
} from "#controllers/protected/patientController.js";

const doctorRoutes = Router();

doctorRoutes.get("/", getAllDoctors);
doctorRoutes.post("/", createDoctor);
doctorRoutes.post("/create", createDoctor);
doctorRoutes.get("/:id", getDoctorById);
doctorRoutes.patch("/:id", updateDoctor);
doctorRoutes.patch("/update/:id", updateDoctor);
doctorRoutes.patch("/archive/:id", archiveDoctor);

// Nested Doctor Patients API
doctorRoutes.get("/:doctorId/patients", getPatientsByDoctor);
doctorRoutes.post("/:doctorId/patients", (req, res, next) => {
  req.body.doctor = req.params.doctorId;
  return createPatient(req, res, next);
});
doctorRoutes.delete("/:doctorId/patients/:id", deletePatient);

export default doctorRoutes;
