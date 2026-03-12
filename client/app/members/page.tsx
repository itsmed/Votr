'use client';

import { useState } from 'react';
import { useMembers } from '@/lib/hooks/useMembers';
import MemberList from '@/components/members/MemberList';

type Chamber = 'senate' | 'house';

/**
 * /members — lists all congressional members.
 * Desktop: two-column layout with senators on the left and representatives on the right.
 * Mobile: single-column with a tab selector to switch between chambers.
 */
export default function MembersPage() {
  const [activeChamber, setActiveChamber] = useState<Chamber>('senate');
  const { senators, representatives, isLoading, isError } = useMembers();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Members of Congress</h1>
        {!isLoading && !isError && (
          <p className="mt-0.5 text-sm text-gray-500">
            {senators.length} senators · {representatives.length} representatives
          </p>
        )}
      </header>

      {/* Mobile chamber tabs */}
      <div className="shrink-0 border-b border-gray-200 bg-white md:hidden">
        <div className="flex">
          {(['senate', 'house'] as Chamber[]).map((chamber) => (
            <button
              key={chamber}
              onClick={() => setActiveChamber(chamber)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeChamber === chamber
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {chamber === 'senate' ? 'Senate' : 'House of Representatives'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Loading members…</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-red-500">Failed to load members. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="min-h-0 flex-1 md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
          {/* Senators — hidden on mobile when House tab is active */}
          <section
            className={`flex flex-col overflow-hidden ${
              activeChamber === 'house' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="hidden shrink-0 border-b border-gray-200 bg-white px-4 py-3 md:block">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Senate
              </h2>
            </div>
            <div className="overflow-y-auto">
              <MemberList members={senators} emptyMessage="No senators found." />
            </div>
          </section>

          {/* Representatives — hidden on mobile when Senate tab is active */}
          <section
            className={`flex flex-col overflow-hidden ${
              activeChamber === 'senate' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="hidden shrink-0 border-b border-gray-200 bg-white px-4 py-3 md:block">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                House of Representatives
              </h2>
            </div>
            <div className="overflow-y-auto">
              <MemberList members={representatives} emptyMessage="No representatives found." />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
