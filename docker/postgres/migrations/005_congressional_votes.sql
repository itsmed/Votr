-- Migration 005: Congressional roll-call votes and member positions
--
-- congressional_votes  one row per roll-call vote (bill, nomination,
--                      amendment, or procedural)
-- vote_positions       normalised member positions (Yea/Nay/Aye/No/…)
--
-- bill_type values:
--   hr       H.R.        House bill
--   hres     H.Res.      House simple resolution
--   hjres    H.J.Res.    House joint resolution
--   hconres  H.Con.Res.  House concurrent resolution
--   s        S.          Senate bill
--   sres     S.Res.      Senate simple resolution
--   sjres    S.J.Res.    Senate joint resolution
--   sconres  S.Con.Res.  Senate concurrent resolution

CREATE TABLE IF NOT EXISTS congressional_votes (
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
  type               VARCHAR(255)  NOT NULL,
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

CREATE TABLE IF NOT EXISTS vote_positions (
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
  ON vote_positions (vote_id);

CREATE INDEX IF NOT EXISTS vote_positions_legislator_id_idx
  ON vote_positions (legislator_id);
