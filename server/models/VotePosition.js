'use strict';

const tableName = 'vote_positions';

/**
 * Normalised individual member positions for each roll-call vote.
 *
 * One row per (vote, member, position) triple.
 *
 * Position labels vary by vote type:
 *   Standard bill/nomination:  Yea | Nay | Present | Not Voting
 *   Amendment (House):         Aye | No  | Present | Not Voting
 *   Speaker election:          <candidate name> | Present | Not Voting
 *
 * Legislator fields differ by chamber:
 *   House  → legislator_id is a bioguide ID  (e.g. "A000370")
 *            first_name / last_name are NULL
 *   Senate → legislator_id is a senate ID    (e.g. "S429")
 *            first_name / last_name are populated
 */
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

/**
 * Creates the vote_positions table and its indexes if they do not already exist.
 * Depends on congressional_votes being created first.
 * @param {import('pg').Pool} pool
 */
async function createTable(pool) {
  await pool.query(createSQL);
}

module.exports = { tableName, createSQL, createTable };
