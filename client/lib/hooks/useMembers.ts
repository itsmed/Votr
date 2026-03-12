import { useQuery } from '@tanstack/react-query';
import { fetchMembers, type Member } from '@/lib/api/members';

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
