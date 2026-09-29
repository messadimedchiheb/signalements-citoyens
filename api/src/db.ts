import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'app',
  password: 'app',
  database: 'signalements',
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signalements (
      id SERIAL PRIMARY KEY,
      categorie VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      statut VARCHAR(20) NOT NULL DEFAULT 'NOUVEAU',
      cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}