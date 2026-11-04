import { Router } from "express"

import employeeAppRoutes from "./employeeAppRoutes/employeeAppRoutes.js"
import consumerAppRoutes from "./consumerAppRoutes/consumerAppRoutes.js"

const routes = Router()

routes.use('/employeeApp',  employeeAppRoutes)
routes.use("/consumerApp",consumerAppRoutes )


export default routes