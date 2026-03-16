import { type VoteRow, type VotePositionRow } from '@/lib/api/congressionalVotes';
import { type Member } from '@/lib/api/members';

const CHAMBER_LABEL: Record<string, string> = { h: 'House', s: 'Senate' };

/** Converts "Last, First" → "First Last". Leaves other formats unchanged. */
function displayName(name: string): string {
  if (!name.includes(',')) return name;
  const [last, first] = name.split(', ');
  return `${first} ${last}`.trim();
}

/**
 * Finds the position label for a rep.
 *
 * House positions store bioguide IDs in legislator_id — matches directly.
 * Senate positions store LIS IDs (e.g. "S370") in legislator_id — bioguide
 * IDs won't match, so we fall back to last_name + state.
 */
function findPosition(
  rep: Member,
  positions: Record<string, VotePositionRow[]>
): string | null {

  for (const [label] of Object.entries(positions)) {
    return label;
  }
  return null;
}

interface VoteDetailProps {
  vote: VoteRow;
  positions: Record<string, VotePositionRow[]>;
  myReps?: Member[];
}

function PositionSection({ label, legislators }: { label: string; legislators: VotePositionRow[] }) {
  if (legislators.length === 0) return null;
  return (
    <section>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label} <span className="font-normal normal-case">({legislators.length})</span>
      </h3>
      <ul className="flex flex-wrap gap-1">
        {legislators.map((leg) => (
          <li
            key={leg.legislator_id}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
          >
            {leg.display_name ?? leg.legislator_id}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function VoteDetail({ vote, positions, myReps }: VoteDetailProps) {
  const positionEntries = Object.entries(positions);
  const repPositions = myReps
  ?.map((rep) => ({ rep, position: findPosition(rep, positions) }))
  .filter(({ position }) => position !== null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
            {CHAMBER_LABEL[vote.chamber] ?? vote.chamber.toUpperCase()}
          </span>
          {vote.category && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {vote.category}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(vote.date).toLocaleString()}
          </span>
        </div>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">{vote.question}</h1>
        {vote.subject && vote.subject !== vote.question && (
          <p className="mt-1 text-sm text-gray-500">{vote.subject}</p>
        )}
      </div>

      {/* Metadata grid */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Type', value: vote.type },
          { label: 'Result', value: vote.result_text ?? vote.result },
          { label: 'Requires', value: vote.requires },
          { label: 'Congress', value: vote.congress },
          { label: 'Session', value: vote.session },
          { label: 'Vote #', value: vote.number },
        ].map(({ label, value }) =>
          value != null ? (
            <div key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <dt className="text-xs font-medium text-gray-500">{label}</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{String(value)}</dd>
            </div>
          ) : null
        )}
      </dl>

      {/* Bill reference */}
      {vote.bill_type && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Bill</h2>
          <p className="text-sm text-gray-900">
            {vote.bill_type.toUpperCase()} {vote.bill_number}
            {vote.bill_title ? ` — ${vote.bill_title}` : ''}
          </p>
        </section>
      )}

      {/* Nomination reference */}
      {vote.nomination_title && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Nomination</h2>
          <p className="text-sm text-gray-900">{vote.nomination_title}</p>
        </section>
      )}

      {/* Amendment reference */}
      {vote.amendment_author && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Amendment</h2>
          <p className="text-sm text-gray-900">
            #{vote.amendment_number} — {vote.amendment_author}
          </p>
        </section>
      )}

      {/* My reps' positions — shown instead of full positions when reps are saved */}
      {repPositions.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-700">My Representatives</h2>
          <ul className="flex flex-col gap-1">
            {repPositions.map(({ rep, position }) => (
              <li key={rep.api_id} className="text-sm text-gray-900">
                <span className="font-medium">{displayName(rep.name)}</span>
                {': '}
                <span>{position}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        positionEntries.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-700">Positions</h2>
            {positionEntries.map(([label, legislators]) => (
              <PositionSection key={label} label={label} legislators={legislators} />
            ))}
          </section>
        )
      )}

      {/* Source link */}
      {vote.source_url && (
        <a
          href={vote.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800"
        >
          Official source →
        </a>
      )}
    </div>
  );
}
