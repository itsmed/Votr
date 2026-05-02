import type { Pool } from 'pg';

const tableName = 'comments';

const createSQL = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    bill_id   INTEGER     NOT NULL REFERENCES bills(id)  ON DELETE CASCADE,
    content   TEXT        NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function createTable(pool: Pool): Promise<void> {
  await pool.query(createSQL);
}

export { tableName, createSQL, createTable };
