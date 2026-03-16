-- Migration 007: Add senator_ids and congress_member_ids to users

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS senator_ids          INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS congress_member_ids  INTEGER[] NOT NULL DEFAULT '{}';
