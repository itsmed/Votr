import pool from './index';
import * as User from '../models/User';
import * as Member from '../models/Member';
import * as Bill from '../models/Bill';
import * as Vote from '../models/Vote';
import * as Comment from '../models/Comment';
import * as CongressionalVote from '../models/CongressionalVote';
import * as VotePosition from '../models/VotePosition';

const SCHEMA_MIGRATIONS_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version    VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const MODELS = [User, Member, Bill, Vote, Comment, CongressionalVote, VotePosition];

async function setup(): Promise<void> {
  console.log('Setting up database tables…\n');

  await pool.query(SCHEMA_MIGRATIONS_SQL);
  console.log('  ✓ schema_migrations');

  for (const model of MODELS) {
    await model.createTable(pool);
    console.log(`  ✓ ${model.tableName}`);
  }

  console.log('\nDone.');
}

setup()
  .catch((err: Error) => {
    console.error('Setup failed:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
