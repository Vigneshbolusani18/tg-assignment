import { created, ok, badRequest, unauthorized, conflict, serverError } from '../utils/http.js';
import { createUser, findUserByUsername, verifyPassword } from '../services/user.service.js';
import { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../services/token.service.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookies.js';
import { pool } from '../config/db.js';

export async function signup(req, res) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return badRequest(res, 'missing_fields');

    const existing = await findUserByUsername(username);
    if (existing) return conflict(res, 'username_taken');

    const user = await createUser({ username, password });
    const access_token = signAccessToken(user);
    const refresh_token = await issueRefreshToken(user.id);

    setRefreshCookie(res, refresh_token);
    return created(res, { user: { id: user.id, username: user.username }, access_token, refresh_token });
  } catch (e) {
    console.error('SIGNUP ERROR:', e);
    return serverError(res, 'signup_failed');
  }
}

export async function signin(req, res) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return badRequest(res, 'missing_fields');

    const user = await findUserByUsername(username);
    if (!user) return unauthorized(res, 'invalid_credentials');

    const okPwd = verifyPassword(password, user.password_hash);
    if (!okPwd) return unauthorized(res, 'invalid_credentials');

    const access_token = signAccessToken(user);
    const refresh_token = await issueRefreshToken(user.id);

    setRefreshCookie(res, refresh_token);
    return ok(res, { user: { id: user.id, username: user.username }, access_token, refresh_token });
  } catch (e) {
    console.error('SIGNIN ERROR:', e);
    return serverError(res, 'signin_failed');
  }
}

export async function refresh(req, res) {
  try {
    const cookieToken = req.cookies?.refresh_token;
    const bodyToken = req.body?.refresh_token;
    const token = cookieToken || bodyToken;
    if (!token) return badRequest(res, 'missing_refresh_token');

    const rotated = await rotateRefreshToken(token);
    if (!rotated) return unauthorized(res, 'invalid_refresh');

    const { userId, refreshToken } = rotated;

    const rr = await pool.query(`SELECT id, username FROM users WHERE id=$1`, [userId]);
    const u = rr.rows[0];
    const access_token = signAccessToken(u);

    setRefreshCookie(res, refreshToken);
    return ok(res, { access_token, refresh_token: refreshToken });
  } catch (e) {
    console.error('REFRESH ERROR:', e);
    return serverError(res, 'refresh_failed');
  }
}

export async function logout(req, res) {
  try {
    const cookieToken = req.cookies?.refresh_token;
    const bodyToken = req.body?.refresh_token;
    const token = cookieToken || bodyToken;
    if (!token) return badRequest(res, 'missing_refresh_token');

    await revokeRefreshToken(token);
    clearRefreshCookie(res);
    return ok(res, { ok: true });
  } catch (e) {
    console.error('LOGOUT ERROR:', e);
    return serverError(res, 'logout_failed');
  }
}

export async function me(req, res) {
  try {
    const userId = req.user.id;

    const c = await pool.query(`SELECT count FROM credits WHERE user_id=$1`, [userId]);
    const credits = c.rows[0]?.count ?? 0;

    const n = await pool.query(
      `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id=$1 AND is_read=FALSE`,
      [userId]
    );
    const notifications_unread = n.rows[0]?.unread ?? 0;

    return ok(res, { id: req.user.id, username: req.user.username, credits, notifications_unread });
  } catch (e) {
    console.error('ME ERROR:', e);
    return serverError(res);
  }
}
