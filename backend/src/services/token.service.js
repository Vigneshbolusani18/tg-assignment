import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';

export function signAccessToken(user) {
  const payload = { id: user.id, username: user.username };
  const expiresIn = `${env.ACCESS_TOKEN_MIN}m`;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export async function issueRefreshToken(userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  return token;
}

export async function rotateRefreshToken(oldToken) {
  // revoke old, create new
  const r = await pool.query(
    `UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW()
     WHERE token = $1 AND revoked = FALSE AND expires_at > NOW()
     RETURNING user_id`,
    [oldToken]
  );
  if (r.rowCount === 0) return null;
  const userId = r.rows[0].user_id;
  const newToken = await issueRefreshToken(userId);
  return { userId, refreshToken: newToken };
}

export async function verifyRefreshToken(rawToken) {
  const r = await pool.query(
    `SELECT user_id, token, expires_at, revoked
       FROM refresh_tokens
      WHERE token = $1`,
    [rawToken]
  );
  const row = r.rows[0];
  if (!row) return null;
  if (row.revoked) return null;
  if (new Date(row.expires_at) <= new Date()) return null;
  return row.user_id;
}

export async function revokeRefreshToken(rawToken) {
  await pool.query(
    `UPDATE refresh_tokens
        SET revoked = TRUE, revoked_at = NOW()
      WHERE token = $1`,
    [rawToken]
  );
}
