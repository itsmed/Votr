import { useVotes, type VoteRow } from '@votr/shared';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHAMBER_LABEL: Record<string, string> = { h: 'House', s: 'Senate' };
const CHAMBER_COLOR: Record<string, string> = { h: '#2563eb', s: '#7c3aed' };
const CHAMBER_BG: Record<string, string> = { h: '#eff6ff', s: '#f5f3ff' };

function VoteCard({ vote, onPress }: { vote: VoteRow; onPress: () => void }) {
  const chamberColor = CHAMBER_COLOR[vote.chamber] ?? '#374151';
  const chamberBg = CHAMBER_BG[vote.chamber] ?? '#f3f4f6';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <Text style={[styles.badge, { color: chamberColor, backgroundColor: chamberBg }]}>
          {CHAMBER_LABEL[vote.chamber] ?? vote.chamber.toUpperCase()}
        </Text>
        <Text style={styles.date}>{new Date(vote.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.question} numberOfLines={2}>{vote.question}</Text>
      {vote.result && (
        <Text style={styles.result} numberOfLines={1}>{vote.result}</Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Votes tab — lists congressional votes, tapping navigates to the detail/voting screen.
 */
export default function VotesScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useVotes({ limit: 50 });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load votes.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.votes ?? []}
        keyExtractor={(item) => item.vote_id}
        renderItem={({ item }) => (
          <VoteCard
            vote={item}
            onPress={() => router.push(`/vote/${encodeURIComponent(item.vote_id)}` as never)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#dc2626', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  date: { fontSize: 12, color: '#6b7280' },
  question: { fontSize: 15, fontWeight: '500', color: '#111827', lineHeight: 22 },
  result: { marginTop: 6, fontSize: 13, color: '#6b7280' },
});
