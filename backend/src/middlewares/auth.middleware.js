import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/http.js';

export async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return unauthorized(res, 'missing_token');
    const decoded = jwt.verify(token, env.JWT_SECRET); // { id, username, iat, exp }
    req.user = decoded;
    next();
  } catch {
    return unauthorized(res, 'invalid_or_expired_token');
  }
}
