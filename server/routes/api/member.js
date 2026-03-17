'use strict';

const express = require('express');
const { getMembers, getMemberDetail, getMemberAgreement } = require('../../services/memberService');

const router = express.Router();

/**
 * GET /api/member
 *
 * Returns a list of all congressional members. Checks the database cache
 * first; if empty, fetches from the Congress.gov API and persists the results.
 *
 * Response 200:
 *   { source: 'cache'|'api', count: number, members: Member[] }
 *
 * Response 500:
 *   { error: string }
 */
router.get('/', async (req, res) => {
  try {
    const { members, source } = await getMembers();
    res.json({ source, count: members.length, members });
  } catch (err) {
    console.error('GET /api/member error:', err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

/**
 * GET /api/member/:bioguideId/agreement
 *
 * Returns how often the authenticated user's congressional votes agree with
 * this member's votes. Only Yea/Nay user votes are counted.
 *
 * Response 200:
 *   { agree: number, total: number, percentage: number|null }
 *
 * Response 401:
 *   { error: string }
 *
 * Response 500:
 *   { error: string }
 */
router.get('/:bioguideId/agreement', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const result = await getMemberAgreement(req.user.id, req.params.bioguideId);
    res.json(result);
  } catch (err) {
    console.error('GET /api/member/:bioguideId/agreement error:', err);
    res.status(500).json({ error: 'Failed to compute agreement' });
  }
});

/**
 * GET /api/member/:bioguideId
 *
 * Returns detailed information for a single member from the Congress.gov API.
 *
 * Response 200: raw member object from Congress.gov
 * Response 404: { error: string }
 * Response 500: { error: string }
 */
router.get('/:bioguideId', async (req, res) => {
  try {
    const member = await getMemberDetail(req.params.bioguideId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ member });
  } catch (err) {
    console.error('GET /api/member/:bioguideId error:', err);
    res.status(500).json({ error: 'Failed to retrieve member detail' });
  }
});

module.exports = router;
