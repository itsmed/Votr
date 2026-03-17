'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type MemberDetail, type AgreementResponse } from '@/lib/api/members';
import { useMemberSharedVotes } from '@/lib/hooks/useMembers';

interface MemberDetailProps {
  member: MemberDetail;
  agreement?: AgreementResponse | null;
}

const PARTY_STYLES: Record<string, string> = {
  Democrat: 'bg-blue-100 text-blue-800',
  Republican: 'bg-red-100 text-red-800',
  Independent: 'bg-purple-100 text-purple-800',
};

function partyStyle(party: string): string {
  return PARTY_STYLES[party] ?? 'bg-gray-100 text-gray-700';
}

/**
 * SVG donut pie chart showing agree/disagree split.
 * Uses the r≈15.9 trick so circumference ≈ 100, making strokeDasharray
 * values directly equal to percentages.
 */
function AgreementPie({ percentage }: { percentage: number }) {
  return (
    <svg viewBox="0 0 36 36" className="h-24 w-24 shrink-0" aria-hidden="true">
      {/* Disagree background ring */}
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fee2e2" strokeWidth="3.8" />
      {/* Agree arc — starts at the top (offset 25 = 25% of circumference = 90°) */}
      <circle
        cx="18" cy="18" r="15.9"
        fill="none"
        stroke="#22c55e"
        strokeWidth="3.8"
        strokeDasharray={`${percentage} ${100 - percentage}`}
        strokeDashoffset="25"
        strokeLinecap="round"
      />
      {/* Percentage label */}
      <text x="18" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#111827">
        {percentage}%
      </text>
    </svg>
  );
}

export default function MemberDetail({ member, agreement }: MemberDetailProps) {
  const currentParty = member.partyHistory.at(-1)?.partyName ?? 'Unknown';
  const latestTerm = member.terms.at(-1);
  const role = latestTerm?.memberType ?? 'Member';

  const [showSharedVotes, setShowSharedVotes] = useState(false);
  const { votes, isLoading: votesLoading, isError: votesError } = useMemberSharedVotes(
    member.bioguideId,
    showSharedVotes
  );

  // directOrderName is "First Last" — grab the first word for the agreement label
  const directOrderName = (member as unknown as Record<string, string>)['directOrderName'];
  const firstName = directOrderName?.split(' ')[0] ?? member.name;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Image
          src={member.depiction?.imageUrl ?? '/placeholder-profile.jpg'}
          alt={`${member.name}'s profile picture`}
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            {member.honorificName ? `${member.honorificName} ` : ''}{directOrderName}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{member.state}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${partyStyle(currentParty)}`}>
              {currentParty}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {role}
            </span>
            {member.currentMember && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Current Member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Agreement with user */}
      {agreement && agreement.percentage !== null && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-4">
            <AgreementPie percentage={agreement.percentage} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                You agree with {firstName} {agreement.percentage}% of the time
              </p>
              <button
                onClick={() => setShowSharedVotes((v) => !v)}
                className="mt-0.5 text-xs text-blue-600 hover:underline"
              >
                Based on {agreement.total} shared vote{agreement.total !== 1 ? 's' : ''}
                {' '}— {showSharedVotes ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {showSharedVotes && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              {votesLoading && (
                <p className="text-sm text-gray-400">Loading shared votes…</p>
              )}
              {votesError && (
                <p className="text-sm text-red-500">Failed to load shared votes.</p>
              )}
              {!votesLoading && !votesError && votes.length === 0 && (
                <p className="text-sm text-gray-400">No shared votes found.</p>
              )}
              {!votesLoading && !votesError && votes.length > 0 && (
                <ul className="flex flex-col divide-y divide-gray-100">
                  {votes.map((v) => (
                    <li key={v.vote_id}>
                      <Link
                        href={`/votes/${encodeURIComponent(v.vote_id)}`}
                        className="flex items-start justify-between gap-3 py-2.5 hover:bg-gray-50 -mx-4 px-4 transition-colors"
                      >
                        <span className="text-sm text-gray-900 leading-snug">{v.question}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.agreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {v.agreed ? 'Agreed' : 'Disagreed'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-2xl font-semibold text-gray-900">{member.sponsoredLegislation.count}</p>
          <p className="mt-0.5 text-xs text-gray-500">Bills Sponsored</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p className="text-2xl font-semibold text-gray-900">{member.cosponsoredLegislation.count}</p>
          <p className="mt-0.5 text-xs text-gray-500">Bills Cosponsored</p>
        </div>
      </div>

      {/* Website */}
      {member.officialWebsiteUrl && (
        <a
          href={member.officialWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800"
        >
          Official Website →
        </a>
      )}

      {/* Terms */}
      {member.terms.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Terms Served</h2>
          <ol className="relative border-l border-gray-200">
            {[...member.terms].reverse().map((term, i) => (
              <li key={i} className="mb-3 ml-4">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-white bg-gray-300" />
                <p className="text-sm font-medium text-gray-800">
                  {term.chamber} · {term.congress}th Congress
                </p>
                <p className="text-xs text-gray-400">
                  {term.startYear}–{term.endYear ?? 'present'}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
