import { useQuery } from '@tanstack/react-query';
import { fetchMembers, fetchMemberDetail, type Member, type MemberDetail } from '@/lib/api/members';

export interface UseMembersResult {
  senators: Member[];
  representatives: Member[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useMembers(): UseMembersResult {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });

  const senators = data?.members.filter((m) => m.role === 'Senator') ?? [];
  const representatives = data?.members.filter((m) => m.role === 'Representative') ?? [];

  return { senators, representatives, isLoading, isError, error: error as Error | null };
}

interface UseMemberDetailResult {
  member: MemberDetail | null;
  isLoading: boolean;
  isError: boolean;
}

export function useMemberDetail(bioguideId: string): UseMemberDetailResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['member', bioguideId],
    queryFn: () => fetchMemberDetail(bioguideId),
  });

  return { member: data?.member ?? null, isLoading, isError };
}
