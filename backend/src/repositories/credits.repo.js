import pool from "../db.js";

export const CreditsRepo = {
  async ensure(userId) {
    await pool.query(
      `INSERT INTO credits (user_id, count) VALUES ($1, 1250)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
  },

  async get(userId) {
    await this.ensure(userId);
    const { rows } = await pool.query(
      `SELECT count FROM credits WHERE user_id = $1`,
      [userId]
    );
    return rows[0]?.count ?? 0;
  },

  async spend(userId, amount) {
    await this.ensure(userId);
    const { rows } = await pool.query(
      `UPDATE credits
         SET count = GREATEST(0, count - $2)
       WHERE user_id = $1
       RETURNING count`,
      [userId, amount]
    );
    return rows[0]?.count ?? 0;
  },
};
