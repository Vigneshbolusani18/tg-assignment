import { Router } from 'express';
import authRoutes from './auth.routes.js';
// import userRoutes from './user.routes.js'; // later

const router = Router();
router.use(authRoutes);
// router.use('/users', userRoutes);

export default router;
