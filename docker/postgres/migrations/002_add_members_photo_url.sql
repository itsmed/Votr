-- Migration 002: Add photo_url column to members table

ALTER TABLE members ADD COLUMN IF NOT EXISTS photo_url TEXT;
