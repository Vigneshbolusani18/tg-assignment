import { Router } from 'express';
import { signup, signin, refresh, logout, me } from '../controllers/auth.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const r = Router();

r.post('/signup', signup);
r.post('/signin', signin);
r.post('/refresh', refresh);
r.post('/logout', logout);
r.get('/me', authGuard, me);

export default r;
