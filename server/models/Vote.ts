import type { Pool } from 'pg';

const tableName = 'votes';

const createSQL = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    bill_id   INTEGER     NOT NULL REFERENCES bills(id)  ON DELETE CASCADE,
    vote      VARCHAR(20) NOT NULL CHECK (vote IN ('Yea', 'Nay', 'Abstain')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, bill_id)  -- one vote per user per bill
  );
`;

async function createTable(pool: Pool): Promise<void> {
  await pool.query(createSQL);
}

export { tableName, createSQL, createTable };
