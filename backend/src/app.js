import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/messages.routes.js';
import metaRoutes from './routes/meta.routes.js';

const app = express();

// IMPORTANT when behind a proxy (Render) to allow Secure cookies
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tg-frontend-8fa1e64y5-vignesh-bolusanis-projects.vercel.app'
  ],
  credentials: true, // allow cookies
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.send('OK'));

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/', metaRoutes);

app.use(errorHandler);

export default app;
