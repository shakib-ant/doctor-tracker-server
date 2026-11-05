import { Router } from "express";
import v1Routes from "./v1Routes.js";
import employeeAppRoutes from "./employeeAppRoutes/employeeAppRoutes.js";
import consumerAppRoutes from "./consumerAppRoutes/consumerAppRoutes.js";

const routes = Router();

routes.use("/v1", v1Routes);
routes.use("/", v1Routes);
routes.use("/employeeApp", employeeAppRoutes);
routes.use("/consumerApp", consumerAppRoutes);

export default routes;
