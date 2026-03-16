'use strict';

const tableName = 'congressional_votes';

/**
 * Stores one roll-call vote record per row.
 *
 * Subject columns are mutually exclusive — at most one of the three groups
 * (bill_*, nomination_*, amendment_*) will be populated for any given row:
 *
 *   Bill/resolution vote  → bill_congress, bill_number, bill_type, bill_title
 *   Nomination vote       → nomination_number, nomination_title
 *   Amendment vote        → bill_* columns + amendment_number, amendment_type,
 *                           amendment_author
 *   Procedural vote       → all subject columns NULL
 *
 * Bill types stored in bill_type:
 *   hr       H.R.        House bill
 *   hres     H.Res.      House simple resolution
 *   hjres    H.J.Res.    House joint resolution
 *   hconres  H.Con.Res.  House concurrent resolution
 *   s        S.          Senate bill
 *   sres     S.Res.      Senate simple resolution
 *   sjres    S.J.Res.    Senate joint resolution
 *   sconres  S.Con.Res.  Senate concurrent resolution
 *
 * Individual member positions are normalised into the vote_positions table.
 */
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

/**
 * Creates the congressional_votes table if it does not already exist.
 * @param {import('pg').Pool} pool
 */
async function createTable(pool) {
  await pool.query(createSQL);
}

module.exports = { tableName, createSQL, createTable };
