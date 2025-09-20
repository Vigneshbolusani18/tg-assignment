import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // allow Neon shared cert
  },
});

pool.on('error', (err) => {
  console.error('PG Pool error:', err);
});
