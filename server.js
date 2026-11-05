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

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  }),
);

app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.get(['/', '/api'], (_req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Doctor Tracker REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Database connection middleware for API routes
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api', routes);

app.use(express.static('public'));

app.use(errorHandler);

// Listen locally only
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port} (${process.env.NODE_ENV || 'development'})`);
  });
}

export default app;
