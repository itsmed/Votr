'use strict';

const pool = require('../db');
const { CURRENT_CONGRESS } = require('../CONSTANTS');

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const MEMBER_LIST_LIMIT = 250;

/**
 * Returns all members from the database cache.
 * @returns {Promise<Array>} Rows from the members table, or empty array.
 */
async function getCachedMembers() {
  const result = await pool.query(
    'SELECT id, name, state, district, role, party, api_id, photo_url FROM members ORDER BY name ASC'
  );
  return result.rows;
}

/**
 * Maps a Congress.gov API member object to the database schema.
 * Role is determined by the member's most recent term chamber.
 * @param {Object} apiMember - Member object from the Congress.gov API.
 * @returns {Object} Mapped member object.
 */
function mapApiMember(apiMember) {
  const latestTerm = apiMember.terms?.item?.at(-1);
  const isRepresentative = latestTerm?.chamber === 'House of Representatives';

  return {
    name: apiMember.name,
    state: apiMember.state,
    district: apiMember.district != null ? String(apiMember.district) : null,
    role: isRepresentative ? 'Representative' : 'Senator',
    party: apiMember.partyName ?? 'Unknown',
    api_id: apiMember.bioguideId,
    photo_url: apiMember.depiction?.imageUrl ?? null,
  };
}

/**
 * Fetches all members for the current Congress from the Congress.gov API,
 * pages through all results, replaces the members table, and returns the list.
 * @returns {Promise<Array>} Inserted member rows.
 */
async function fetchAndCacheMembers() {
  const apiKey = process.env.CONGRESS_API_KEY;
  if (!apiKey) {
    throw new Error('CONGRESS_API_KEY environment variable is not set');
  }

  const allMembers = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${CONGRESS_API_BASE}/member/congress/${CURRENT_CONGRESS}?api_key=${apiKey}&limit=${MEMBER_LIST_LIMIT}&offset=${offset}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Congress.gov API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const members = data.members ?? [];
    allMembers.push(...members);

    const pagination = data.pagination;
    hasMore = pagination && offset + members.length < pagination.count;
    offset += members.length;
  }

  if (allMembers.length === 0) {
    return [];
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Full replacement — delete all existing members before inserting fresh data
    await client.query('DELETE FROM members');

    const inserted = [];
    for (const apiMember of allMembers) {
      const m = mapApiMember(apiMember);
      const result = await client.query(
        `INSERT INTO members (name, state, district, role, party, api_id, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, state, district, role, party, api_id, photo_url`,
        [m.name, m.state, m.district, m.role, m.party, m.api_id, m.photo_url]
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Returns members from the database if cached, otherwise fetches from the
 * Congress.gov API for congress ${CURRENT_CONGRESS}, replaces the DB, and returns the result.
 * @returns {Promise<{ members: Array, source: 'cache'|'api' }>}
 */
async function getMembers() {
  const cached = await getCachedMembers();
  if (cached.length > 0) {
    return { members: cached, source: 'cache' };
  }

  const members = await fetchAndCacheMembers();
  return { members, source: 'api' };
}

module.exports = { getMembers, getCachedMembers, fetchAndCacheMembers, mapApiMember };
