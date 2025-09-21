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

// allow secure cookies behind proxy (Render/NGINX)
app.set('trust proxy', 1);

// -------- CORS (prod + dev) ----------
const allowList = new Set([
  'http://localhost:5173',
  'https://tg-frontend-8fa1e64y5-vignesh-bolusanis-projects.vercel.app',
  ...(env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',').map(s => s.trim()) : []),
]);

function isAllowed(origin) {
  if (!origin) return true; // curl/postman
  try {
    const u = new URL(origin);
    if (allowList.has(origin)) return true;
    if (u.hostname.endsWith('.vercel.app')) return true; // vercel previews
    return false;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: (origin, cb) => cb(null, isAllowed(origin)),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

app.use(cors(corsOptions));

// ✅ express 5 fix: handle OPTIONS manually
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '');
    res.set('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.set('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});
// -------------------------------------

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// health
app.get('/health', (_req, res) => res.send('OK'));

// routes
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/', metaRoutes);

// errors
app.use(errorHandler);

export default app;
