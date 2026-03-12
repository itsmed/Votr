import { type Member } from '@/lib/api/members';
import MemberCard from './MemberCard';

interface MemberListProps {
  members: Member[];
  emptyMessage?: string;
}

/**
 * Scrollable list of MemberCard items. The parent is expected to constrain
 * the height so this component can overflow-y-auto within it.
 */
export default function MemberList({
  members,
  emptyMessage = 'No members found.',
}: MemberListProps) {
  if (members.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-2 p-4">
      {members.map((member) => (
        <li key={member.id}>
          <MemberCard member={member} />
        </li>
      ))}
    </ul>
  );
}
