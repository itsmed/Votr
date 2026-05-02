import type { Pool } from 'pg';

const tableName = 'vote_positions';

const createSQL = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id              SERIAL PRIMARY KEY,
    vote_id         INTEGER       NOT NULL
                      REFERENCES congressional_votes(id) ON DELETE CASCADE,

    -- Position cast (Yea, Nay, Aye, No, Present, Not Voting, or candidate name)
    position        VARCHAR(100)  NOT NULL,

    -- Legislator identity
    legislator_id   VARCHAR(50)   NOT NULL,  -- bioguide or senate ID
    display_name    VARCHAR(255),
    first_name      VARCHAR(100),            -- Senate only
    last_name       VARCHAR(100),            -- Senate only
    party           CHAR(1)       CHECK (party IN ('D', 'R', 'I')),
    state           CHAR(2)
  );

  CREATE INDEX IF NOT EXISTS vote_positions_vote_id_idx
    ON ${tableName} (vote_id);

  CREATE INDEX IF NOT EXISTS vote_positions_legislator_id_idx
    ON ${tableName} (legislator_id);
`;

async function createTable(pool: Pool): Promise<void> {
  await pool.query(createSQL);
}

export { tableName, createSQL, createTable };
