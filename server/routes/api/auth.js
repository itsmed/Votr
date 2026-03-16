'use strict';

const express = require('express');
const pool = require('../../db');

const router = express.Router();

// POST /api/auth/logout — clears the session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('pollus_user_id');
  res.json({ ok: true });
});

// GET /api/auth/me — returns the current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// PATCH /api/auth/me — update address, preferences, or representative IDs
//
// To save the user's representatives, pass senator_api_ids and/or
// congress_member_api_ids as arrays of bioguide ID strings. The server
// resolves them to integer member IDs before persisting.
router.patch('/me', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { address, preferences, senator_api_ids, congress_member_api_ids } = req.body;
  const hasAddress = Object.prototype.hasOwnProperty.call(req.body, 'address');
  const hasPreferences = Object.prototype.hasOwnProperty.call(req.body, 'preferences');
  const hasSenators = Array.isArray(senator_api_ids);
  const hasReps = Array.isArray(congress_member_api_ids);

  try {
    // Resolve bioguide API IDs → integer member IDs when provided
    let senatorIds = req.user.senator_ids ?? [];
    let repIds = req.user.congress_member_ids ?? [];

    if (hasSenators) {
      if (senator_api_ids.length === 0) {
        senatorIds = [];
      } else {
        const { rows } = await pool.query(
          'SELECT id FROM members WHERE api_id = ANY($1)',
          [senator_api_ids]
        );
        senatorIds = rows.map((r) => r.id);
      }
    }

    if (hasReps) {
      if (congress_member_api_ids.length === 0) {
        repIds = [];
      } else {
        const { rows } = await pool.query(
          'SELECT id FROM members WHERE api_id = ANY($1)',
          [congress_member_api_ids]
        );
        repIds = rows.map((r) => r.id);
      }
    }

    const { rows } = await pool.query(
      `UPDATE users
          SET address             = CASE WHEN $1 THEN $2::text  ELSE address             END,
              preferences         = CASE WHEN $3 THEN $4::jsonb ELSE preferences         END,
              senator_ids         = $5,
              congress_member_ids = $6
        WHERE id = $7
    RETURNING id, name, email, address, preferences, senator_ids, congress_member_ids`,
      [
        hasAddress, address ?? null,
        hasPreferences, preferences ? JSON.stringify(preferences) : null,
        senatorIds,
        repIds,
        req.user.id,
      ]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me/reps — returns member rows for the user's saved representatives
router.get('/me/reps', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const senatorIds = req.user.senator_ids ?? [];
    const repIds = req.user.congress_member_ids ?? [];
    const allIds = [...senatorIds, ...repIds];

    if (allIds.length === 0) {
      return res.json({ senators: [], representatives: [] });
    }

    const { rows } = await pool.query(
      'SELECT * FROM members WHERE id = ANY($1) ORDER BY name',
      [allIds]
    );

    const senators = rows.filter((m) => senatorIds.includes(m.id));
    const representatives = rows.filter((m) => repIds.includes(m.id));

    res.json({ senators, representatives });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me/saved-members
router.get('/me/saved-members', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT m.* FROM members m
         JOIN user_saved_members usm ON usm.member_id = m.id
        WHERE usm.user_id = $1
        ORDER BY m.name`,
      [req.user.id]
    );
    res.json({ members: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/me/saved-members/:memberId
router.post('/me/saved-members/:memberId', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    await pool.query(
      `INSERT INTO user_saved_members (user_id, member_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.memberId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/me/saved-members/:memberId
router.delete('/me/saved-members/:memberId', async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    await pool.query(
      'DELETE FROM user_saved_members WHERE user_id = $1 AND member_id = $2',
      [req.user.id, req.params.memberId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
