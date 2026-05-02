import type { Pool } from 'pg';

const tableName = 'congressional_votes';

const createSQL = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    id                 SERIAL PRIMARY KEY,

    -- Identity
    vote_id            VARCHAR(50)   NOT NULL UNIQUE,  -- e.g. "h75-119.2025"
    chamber            CHAR(1)       NOT NULL CHECK (chamber IN ('h', 's')),
    congress           INTEGER       NOT NULL,
    session            VARCHAR(10)   NOT NULL,
    number             INTEGER       NOT NULL,

    -- Timing
    date               TIMESTAMPTZ   NOT NULL,
    updated_at         TIMESTAMPTZ,
    record_modified    TIMESTAMPTZ,   -- Senate only

    -- Vote metadata
    type               VARCHAR(255)  NOT NULL,  -- parliamentary action type
    category           VARCHAR(50),
    question           TEXT          NOT NULL,
    subject            TEXT,
    requires           VARCHAR(20),
    result             VARCHAR(100),
    result_text        VARCHAR(255),
    source_url         TEXT,

    -- Bill / resolution reference (nullable)
    bill_congress      INTEGER,
    bill_number        INTEGER,
    bill_type          VARCHAR(10)   CHECK (
                         bill_type IS NULL OR bill_type IN (
                           'hr','hres','hjres','hconres',
                           's','sres','sjres','sconres'
                         )
                       ),
    bill_title         TEXT,

    -- Nomination reference (nullable, Senate only)
    nomination_number  VARCHAR(50),
    nomination_title   TEXT,

    -- Amendment reference (nullable; coexists with bill columns)
    amendment_number   INTEGER,
    amendment_type     VARCHAR(50),
    amendment_author   TEXT
  );
`;

async function createTable(pool: Pool): Promise<void> {
  await pool.query(createSQL);
}

export { tableName, createSQL, createTable };
