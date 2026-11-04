import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  archiveDoctor,
} from "#controllers/protected/doctorController.js";

const doctorRoutes = Router();

doctorRoutes.get("/", getAllDoctors);
doctorRoutes.post("/", createDoctor);
doctorRoutes.post("/create", createDoctor);
doctorRoutes.get("/:id", getDoctorById);
doctorRoutes.patch("/:id", updateDoctor);
doctorRoutes.patch("/update/:id", updateDoctor);
doctorRoutes.patch("/archive/:id", archiveDoctor);

export default doctorRoutes;

