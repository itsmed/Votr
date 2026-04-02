import {
  useVoteDetail,
  useUserCongressionalVote,
  useMyReps,
  type VoteRow,
  type VotePositionRow,
  type UserCongressionalVote,
  type UserVotePosition,
  type Member,
} from '@votr/shared';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@votr/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHAMBER_LABEL: Record<string, string> = { h: 'House', s: 'Senate' };

function findRepPosition(
  rep: Member,
  positions: Record<string, VotePositionRow[]>
): string | null {
  const repLastName = rep.name.split(',')[0].trim();
  for (const [label, legislators] of Object.entries(positions)) {
    const found = legislators.some(
      (l) =>
        l.legislator_id === rep.api_id ||
        (l.last_name !== null &&
          l.party !== null &&
          l.last_name === repLastName &&
          rep.party.startsWith(
            l.party === 'D' ? 'Democrat' : l.party === 'R' ? 'Republican' : 'Independent'
          ))
    );
    if (found) return label;
  }
  return null;
}

function MetaGrid({ vote }: { vote: VoteRow }) {
  const items = [
    { label: 'Chamber', value: CHAMBER_LABEL[vote.chamber] ?? vote.chamber.toUpperCase() },
    { label: 'Result', value: vote.result_text ?? vote.result },
    { label: 'Requires', value: vote.requires },
    { label: 'Congress', value: vote.congress != null ? String(vote.congress) : null },
    { label: 'Session', value: vote.session },
    { label: 'Vote #', value: vote.number != null ? String(vote.number) : null },
  ].filter((i): i is { label: string; value: string } => i.value != null);

  return (
    <View style={styles.metaGrid}>
      {items.map(({ label, value }) => (
        <View key={label} style={styles.metaCell}>
          <Text style={styles.metaLabel}>{label}</Text>
          <Text style={styles.metaValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

interface VotingButtonsProps {
  userVote: UserCongressionalVote | null;
  isCasting: boolean;
  onVote: (position: UserVotePosition) => Promise<void>;
}

function VotingButtons({ userVote, isCasting, onVote }: VotingButtonsProps) {
  const positions: UserVotePosition[] = ['Yea', 'Nay', 'Abstain'];
  return (
    <View style={styles.votingSection}>
      <Text style={styles.sectionTitle}>
        My Vote{userVote ? `  —  ${userVote.position}` : ''}
      </Text>
      <View style={styles.voteButtons}>
        {positions.map((pos) => {
          const isSelected = userVote?.position === pos;
          const selectedBg =
            pos === 'Yea' ? '#dcfce7' : pos === 'Nay' ? '#fee2e2' : '#f3f4f6';
          const selectedBorder =
            pos === 'Yea' ? '#86efac' : pos === 'Nay' ? '#fca5a5' : '#9ca3af';
          const selectedText =
            pos === 'Yea' ? '#166534' : pos === 'Nay' ? '#991b1b' : '#111827';

          return (
            <TouchableOpacity
              key={pos}
              onPress={() => onVote(pos)}
              disabled={isCasting}
              style={[
                styles.voteButton,
                isSelected
                  ? { backgroundColor: selectedBg, borderColor: selectedBorder }
                  : styles.voteButtonUnselected,
              ]}
            >
              <Text
                style={[
                  styles.voteButtonText,
                  { color: isSelected ? selectedText : '#374151' },
                ]}
              >
                {pos}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Vote detail screen — shows vote metadata, lets the user cast their own vote,
 * and shows how their representatives voted.
 */
export default function VoteDetailScreen() {
  const { voteId } = useLocalSearchParams<{ voteId: string }>();
  const router = useRouter();
  const decodedId = decodeURIComponent(voteId ?? '');

  const { data, isLoading, isError } = useVoteDetail(decodedId);
  const { userVote, cast, isCasting } = useUserCongressionalVote(decodedId);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: false,
  });
  const hasReps =
    (currentUser?.senator_ids?.length ?? 0) > 0 ||
    (currentUser?.congress_member_ids?.length ?? 0) > 0;
  const { data: repsData } = useMyReps(hasReps);

  const chamber = data?.vote.chamber;
  const myReps =
    repsData && chamber
      ? chamber === 's'
        ? repsData.senators
        : repsData.representatives
      : [];

  const repPositions = myReps
    .map((rep) => ({ rep, position: findRepPosition(rep, data?.positions ?? {}) }))
    .filter((r): r is { rep: Member; position: string } => r.position !== null);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Votes</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
      {isError && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load vote.</Text>
        </View>
      )}

      {data && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Question */}
          <Text style={styles.question}>{data.vote.question}</Text>
          {data.vote.subject && data.vote.subject !== data.vote.question && (
            <Text style={styles.subject}>{data.vote.subject}</Text>
          )}

          {/* Metadata */}
          <MetaGrid vote={data.vote} />

          {/* Bill reference */}
          {data.vote.bill_type && (
            <View style={styles.refSection}>
              <Text style={styles.sectionTitle}>Bill</Text>
              <Text style={styles.refText}>
                {data.vote.bill_type.toUpperCase()} {data.vote.bill_number}
                {data.vote.bill_title ? ` — ${data.vote.bill_title}` : ''}
              </Text>
            </View>
          )}

          {/* User voting */}
          <VotingButtons userVote={userVote} isCasting={isCasting} onVote={cast} />

          {/* Reps' votes */}
          {repPositions.length > 0 && (
            <View style={styles.refSection}>
              <Text style={styles.sectionTitle}>My Representatives</Text>
              {repPositions.map(({ rep, position }) => (
                <Text key={rep.api_id} style={styles.repRow}>
                  <Text style={styles.repName}>{rep.name.replace(/,\s*/, ' ').trim()}</Text>
                  {': '}
                  {position}
                </Text>
              ))}
            </View>
          )}

          {/* All positions */}
          {Object.entries(data.positions).map(([label, legislators]) =>
            legislators.length > 0 ? (
              <View key={label} style={styles.refSection}>
                <Text style={styles.sectionTitle}>
                  {label} ({legislators.length})
                </Text>
                <Text style={styles.legislatorList}>
                  {legislators
                    .map((l) => l.display_name ?? l.legislator_id)
                    .join(', ')}
                </Text>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#dc2626', fontSize: 14 },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { alignSelf: 'flex-start' },
  backText: { fontSize: 14, color: '#2563eb' },
  scroll: { padding: 16, gap: 20 },
  question: { fontSize: 18, fontWeight: '600', color: '#111827', lineHeight: 26 },
  subject: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaCell: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '45%',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metaLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  metaValue: { fontSize: 13, color: '#111827', marginTop: 2 },
  votingSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  voteButtons: { flexDirection: 'row', gap: 8 },
  voteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  voteButtonUnselected: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  voteButtonText: { fontSize: 14, fontWeight: '600' },
  refSection: { gap: 4 },
  refText: { fontSize: 14, color: '#111827' },
  repRow: { fontSize: 14, color: '#374151', lineHeight: 22 },
  repName: { fontWeight: '600' },
  legislatorList: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
});
