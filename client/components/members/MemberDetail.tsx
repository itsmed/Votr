import Image from 'next/image';
import { type MemberDetail } from '@/lib/api/members';

interface MemberDetailProps {
  member: MemberDetail;
}

const PARTY_STYLES: Record<string, string> = {
  Democrat: 'bg-blue-100 text-blue-800',
  Republican: 'bg-red-100 text-red-800',
  Independent: 'bg-purple-100 text-purple-800',
};

function partyStyle(party: string): string {
  return PARTY_STYLES[party] ?? 'bg-gray-100 text-gray-700';
}

export default function MemberDetail({ member }: MemberDetailProps) {
  const currentParty = member.partyHistory.at(-1)?.partyName ?? 'Unknown';
  const latestTerm = member.terms.at(-1);
  const role = latestTerm?.memberType ?? 'Member';

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
            {member.honorificName ? `${member.honorificName} ` : ''}{member.name}
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
