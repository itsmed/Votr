import Link from 'next/link';
import Image from 'next/image';
import { type Member } from '@/lib/api/members';

const PARTY_STYLES: Record<string, string> = {
  Democrat: 'bg-blue-100 text-blue-800',
  Republican: 'bg-red-100 text-red-800',
  Independent: 'bg-purple-100 text-purple-800',
};

function partyStyle(party: string): string {
  return PARTY_STYLES[party] ?? 'bg-gray-100 text-gray-700';
}

interface MemberCardProps {
  member: Member;
}

/**
 * Displays a single congressional member's key details.
 * Shows district only for Representatives; omits it for Senators.
 */
export default function MemberCard({ member }: MemberCardProps) {
  const { name, district, role, party } = member;

  return (
    <Link href={`/members/${member.api_id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
    <article className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="min-w-0">
        <Image
          className="h-12 w-12 rounded-full object-cover"
          src={member.photo_url ?? '/placeholder-profile.jpg'}
          alt={`${name}'s profile picture`}
          width={48}
          height={48}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">{name}</p>
        {district != null && (
          <p className="mt-0.5 text-sm text-gray-500">District {district}</p>
        )}
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${partyStyle(party)}`}>
          {party}
        </span>
        <span className="text-xs text-gray-400">{role}</span>
      </div>
    </article>
    </Link>
  );
}
