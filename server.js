import cors from 'cors';
import environment from 'dotenv';
import express from 'express';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import routes from './routes/routes.js';

environment.config();
const port = process.env.PORT || 5000;
connectDB();
const app = express();

app.use(cors('*'));
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  }),
);

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Doctor Tracker REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.use(express.static('public'));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│  🚀 DOCTOR TRACKER BACKEND REST API IS ONLINE & RUNNING      │
├──────────────────────────────────────────────────────────────┤
│  • Mode        : ${String(process.env.NODE_ENV || 'development').padEnd(43)} │
│  • Port        : ${String(port).padEnd(43)} │
│  • Base URL    : ${`http://localhost:${port}/api`.padEnd(43)} │
│  • Healthcheck : ${`http://localhost:${port}/`.padEnd(43)} │
│  • Doctors API : ${`/api/employeeApp/protected/doctors`.padEnd(43)} │
│  • Patients API: ${`/api/employeeApp/protected/patients`.padEnd(43)} │
│  • Analytics   : ${`/api/employeeApp/protected/analytics/dashboard`.padEnd(43)} │
│  • Auth Login  : ${`/api/employeeApp/public/auth/login`.padEnd(43)} │
└──────────────────────────────────────────────────────────────┘
  ✔ Server listening for client requests from doctorTrackerAdmin
  `);
});
