import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';
import { useChatStore } from '../../src/store/chatStore';

interface UserResult {
  id: string;
  name: string;
  avatar_url?: string;
}

function UserRow({ user, onPress, loading }: { user: UserResult; onPress: () => void; loading: boolean }) {
  return (
    <TouchableOpacity style={styles.userRow} activeOpacity={0.75} onPress={onPress} disabled={loading}>
      <View style={styles.avatar}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarLetter}>
            {user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userId} numberOfLines={1}>ID: {user.id}</Text>
      </View>
      <View style={[styles.dmBtn, loading && { opacity: 0.5 }]}>
        {loading
          ? <ActivityIndicator size="small" color={Colors.primary} />
          : <>
              <Ionicons name="chatbubble-outline" size={15} color={Colors.primary} />
              <Text style={styles.dmBtnText}>Написать</Text>
            </>
        }
      </View>
    </TouchableOpacity>
  );
}

export default function NewChatScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const startDM = useChatStore((s) => s.startDM);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) { setResults([]); setSearched(false); return; }

    setLoading(true);
    setSearched(true);

    // UUID pattern check — search by exact ID
    const isUUID = /^[0-9a-f-]{36}$/i.test(trimmed);
    let query = supabase.from('profiles').select('id, name, avatar_url');

    if (isUUID) {
      query = query.eq('id', trimmed);
    } else {
      query = query.ilike('name', `%${trimmed}%`).limit(20);
    }

    const { data } = await query;
    setResults(data ?? []);
    setLoading(false);
  }, []);

  const handleStartDM = async (target: UserResult) => {
    setStarting(target.id);
    try {
      const chatId = await startDM(target.id, target.name);
      router.replace(`/chat/${chatId}` as any);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось открыть чат');
      setStarting(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Новое сообщение</Text>
          <Text style={styles.headerSub}>Найдите пользователя по имени или ID</Text>
        </View>
      </View>

      {/* Search input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={Colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Имя или ID пользователя..."
            placeholderTextColor={Colors.text.disabled}
            value={query}
            onChangeText={(v) => { setQuery(v); search(v); }}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={16} color={Colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hint — show user's own ID */}
      {!searched && (
        <View style={styles.hintCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.hintText}>
            Поделитесь своим ID с другим пользователем, чтобы он мог найти вас
          </Text>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => handleStartDM(item)}
              loading={starting === item.id}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.empty}>
                <Ionicons name="person-outline" size={40} color={Colors.text.disabled} />
                <Text style={styles.emptyTitle}>Никого не найдено</Text>
                <Text style={styles.emptyText}>Попробуйте другое имя или вставьте точный ID</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  headerSub: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },

  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    padding: 0,
  },

  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: Spacing.md,
    padding: 14,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
  },

  list: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 24 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  userId: { fontSize: 11, color: Colors.text.disabled, marginTop: 2 },
  dmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}12`,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
  },
  dmBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 48, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptyText: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center', maxWidth: 260 },
});
