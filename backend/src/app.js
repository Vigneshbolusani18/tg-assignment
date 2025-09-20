import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,               // <-- allow cookies
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());           // <-- parse cookies

app.get('/health', (req, res) => res.send('OK'));
app.use('/auth', authRoutes);
app.use(errorHandler);

export default app;
