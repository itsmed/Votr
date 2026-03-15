'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMemberDetail } from '@/lib/hooks/useMembers';
import MemberDetail from '@/components/members/MemberDetail';

interface PageParams {
  bioguideId: string;
}

export default function MemberDetailPage({ params }: { params: Promise<PageParams> }) {
  const { bioguideId } = use(params);
  const { member, isLoading, isError } = useMemberDetail(bioguideId);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/members" className="text-sm text-blue-600 hover:underline">
          ← Members
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {isLoading && <p className="text-sm text-gray-400">Loading member…</p>}
        {isError && <p className="text-sm text-red-500">Failed to load member. Please try again.</p>}
        {!isLoading && !isError && member && <MemberDetail member={member} />}
      </main>
    </div>
  );
}
