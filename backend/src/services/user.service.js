import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

export async function createUser({ username, password }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hash = bcrypt.hashSync(password, 10);

    const userRes = await client.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at`,
      [username, hash]
    );
    const user = userRes.rows[0];

    await client.query(
      `INSERT INTO credits (user_id, count) VALUES ($1, DEFAULT)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    await client.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [user.id, 'Welcome! You have 1,250 credits to start with.']
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findUserByUsername(username) {
  const r = await pool.query(
    `SELECT id, username, password_hash FROM users WHERE username = $1`,
    [username]
  );
  return r.rows[0] || null;
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}
