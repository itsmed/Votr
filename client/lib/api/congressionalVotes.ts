/**
 * TypeScript types for congressional vote records sourced from
 * the govinfo.gov / unitedstates/congress-legislators data set.
 *
 * Top-level vote structure (data.json per roll-call vote):
 *   - `bill`        present for bill/resolution votes
 *   - `nomination`  present for nomination confirmation votes
 *   - `amendment`   present for amendment votes (may coexist with `bill`)
 *   - neither       for pure procedural votes (adjourn, speaker election, …)
 *
 * The discriminated union `CongressionalVote` covers all four variants.
 */

// ─── Bill types ───────────────────────────────────────────────────────────────

/** Bill classification codes as they appear in `bill.type`. */
export type BillType =
  | 'hr'       // House bill (H.R.)
  | 'hres'     // House simple resolution (H.Res.)
  | 'hjres'    // House joint resolution (H.J.Res.)
  | 'hconres'  // House concurrent resolution (H.Con.Res.)
  | 's'        // Senate bill (S.)
  | 'sres'     // Senate simple resolution (S.Res.)
  | 'sjres'    // Senate joint resolution (S.J.Res.)
  | 'sconres'; // Senate concurrent resolution (S.Con.Res.)

/** Broad action categories used to group vote types. */
export type VoteCategory =
  | 'passage'
  | 'passage-suspension'
  | 'procedural'
  | 'cloture'
  | 'amendment'
  | 'nomination'
  | 'quorum'
  | 'leadership'
  | 'other';

// ─── Subject references ───────────────────────────────────────────────────────

/** Reference to the bill or resolution being voted on. */
export interface BillRef {
  congress: number;
  number: number;
  type: BillType;
  /** Present in Senate votes and some House votes. */
  title?: string;
}

/** Reference to a presidential nomination being confirmed. */
export interface NominationRef {
  /** Nomination number, e.g. "26-50". */
  number: string;
  title: string;
}

/** Reference to an amendment being considered. */
export interface AmendmentRef {
  number: number;
  /** Source chamber classification, e.g. "h-bill". */
  type: string;
  author: string;
}

// ─── Legislators ──────────────────────────────────────────────────────────────

/** House member record — 4 fields, id is a bioguide ID (e.g. "A000370"). */
export interface HouseLegislator {
  id: string;
  display_name: string;
  party: 'D' | 'R' | 'I';
  state: string;
}

/** Senate member record — 6 fields, id is a senate ID (e.g. "S429"). */
export interface SenateLegislator {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  party: 'D' | 'R' | 'I';
  state: string;
}

export type Legislator = HouseLegislator | SenateLegislator;

/**
 * Type guard: returns true when the legislator record has Senate-specific
 * first_name / last_name fields.
 */
export const isSenateLegislator = (l: Legislator): l is SenateLegislator =>
  'first_name' in l;

// ─── Vote positions ───────────────────────────────────────────────────────────

/**
 * Maps position labels to lists of legislators who cast that position.
 *
 * Standard keys: "Yea" | "Nay" | "Present" | "Not Voting"
 * Amendment keys: "Aye" | "No" | "Present" | "Not Voting"
 * Speaker election: candidate display names + "Present" | "Not Voting"
 */
export type VotePositions = Record<string, Legislator[]>;

// ─── Core vote record ─────────────────────────────────────────────────────────

interface CongressionalVoteBase {
  /** Unique identifier, e.g. "h75-119.2025". */
  vote_id: string;
  chamber: 'h' | 's';
  congress: number;
  session: string;
  number: number;
  /** ISO 8601 timestamp. */
  date: string;
  /** Specific parliamentary action, e.g. "On Passage of the Bill". */
  type: string;
  category: VoteCategory;
  question: string;
  subject?: string;
  /** Threshold required, e.g. "1/2", "3/5", "QUORUM". */
  requires: string;
  result: string;
  result_text: string;
  source_url: string;
  updated_at: string;
  /** Senate only — when the record was last modified. */
  record_modified?: string;
  votes: VotePositions;
}

// ─── Discriminated union by subject type ─────────────────────────────────────

/** Vote on a House or Senate bill / resolution. */
export interface BillVote extends CongressionalVoteBase {
  bill: BillRef;
  nomination?: never;
}

/** Vote on a presidential nomination (Senate only). */
export interface NominationVote extends CongressionalVoteBase {
  nomination: NominationRef;
  bill?: never;
  amendment?: never;
}

/**
 * Vote on an amendment to a bill. The parent `bill` reference is present;
 * `amendment` describes the specific amendment being considered.
 */
export interface AmendmentVote extends CongressionalVoteBase {
  bill: BillRef;
  amendment: AmendmentRef;
  nomination?: never;
}

/**
 * Pure procedural vote — no bill, nomination, or amendment reference.
 * Includes adjournment, speaker elections, quorum calls, etc.
 */
export interface ProceduralVote extends CongressionalVoteBase {
  bill?: never;
  nomination?: never;
  amendment?: never;
}

export type CongressionalVote =
  | BillVote
  | NominationVote
  | AmendmentVote
  | ProceduralVote;

// ─── Type guards ──────────────────────────────────────────────────────────────

export const isBillVote = (v: CongressionalVote): v is BillVote =>
  'bill' in v && v.bill != null && !('amendment' in v && v.amendment != null);

export const isAmendmentVote = (v: CongressionalVote): v is AmendmentVote =>
  'amendment' in v && v.amendment != null;

export const isNominationVote = (v: CongressionalVote): v is NominationVote =>
  'nomination' in v && v.nomination != null;

export const isProceduralVote = (v: CongressionalVote): v is ProceduralVote =>
  !('bill' in v && v.bill != null) &&
  !('nomination' in v && v.nomination != null) &&
  !('amendment' in v && v.amendment != null);

// ─── Bill-type-specific vote aliases ─────────────────────────────────────────
// Useful when you already know the bill.type and want a narrower type.

type BillVoteOf<T extends BillType> = Omit<BillVote, 'bill'> & {
  bill: BillRef & { type: T };
};

/** Vote on a House bill (H.R.). */
export type HRVote = BillVoteOf<'hr'>;

/** Vote on a House simple resolution (H.Res.). */
export type HResVote = BillVoteOf<'hres'>;

/** Vote on a House joint resolution (H.J.Res.). */
export type HJResVote = BillVoteOf<'hjres'>;

/** Vote on a House concurrent resolution (H.Con.Res.). */
export type HConResVote = BillVoteOf<'hconres'>;

/** Vote on a Senate bill (S.). */
export type SVote = BillVoteOf<'s'>;

/** Vote on a Senate simple resolution (S.Res.). */
export type SResVote = BillVoteOf<'sres'>;

/** Vote on a Senate joint resolution (S.J.Res.). */
export type SJResVote = BillVoteOf<'sjres'>;

/** Vote on a Senate concurrent resolution (S.Con.Res.). */
export type SConResVote = BillVoteOf<'sconres'>;

// ─── API response shapes ──────────────────────────────────────────────────────

export interface CongressionalVotesResponse {
  source: 'cache' | 'api';
  count: number;
  votes: CongressionalVote[];
}

export interface CongressionalVoteResponse {
  vote: CongressionalVote;
}
