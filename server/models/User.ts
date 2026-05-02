import type { Pool } from 'pg';

const tableName = 'users';

const createSQL = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senator_ids INTEGER[] NOT NULL DEFAULT '{}',
    congress_member_ids INTEGER[] NOT NULL DEFAULT '{}'
  );
`;

async function createTable(pool: Pool): Promise<void> {
  await pool.query(createSQL);
}

export { tableName, createSQL, createTable };
