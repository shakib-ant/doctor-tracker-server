import { Router } from "express";
import { getDashboardAnalytics } from "#controllers/protected/analyticsController.js";

const analyticsRoutes = Router();

analyticsRoutes.get("/dashboard", getDashboardAnalytics);

export default analyticsRoutes;

