import publicRoutes from '#routes/employeeAppRoutes/publicRoutes/publicRoutes.js'
import { Router } from 'express'
// import publicRoutes from './publicRoutes/publicRoutes.js'


const consumerAppRoutes = Router()


consumerAppRoutes.use('/public', publicRoutes)

export default consumerAppRoutes