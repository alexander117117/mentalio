import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useChatStore } from '../../src/store/chatStore';
import { Chat } from '../../src/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function ChatRow({ chat }: { chat: Chat }) {
  return (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${chat.id}` as any)}
    >
      <View style={styles.chatThumb}>
        {chat.classroomThumbnail ? (
          <Image source={{ uri: chat.classroomThumbnail }} style={styles.chatThumbImg} />
        ) : (
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.text.disabled} />
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          {chat.lastMessage && (
            <Text style={styles.chatTime}>{formatTime(chat.lastMessage.createdAt)}</Text>
          )}
        </View>
        <Text style={styles.chatLast} numberOfLines={1}>
          {chat.lastMessage
            ? `${chat.lastMessage.userName}: ${chat.lastMessage.content}`
            : 'Нет сообщений'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatsScreen() {
  const [search, setSearch] = useState('');
  const chats = useChatStore((s) => s.chats);
  const fetchChats = useChatStore((s) => s.fetchChats);

  useEffect(() => { fetchChats(); }, []);

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Сообщения</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={Colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по чатам..."
            placeholderTextColor={Colors.text.disabled}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatRow chat={item} />}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={44} color={Colors.text.disabled} />
            <Text style={styles.emptyTitle}>Нет сообщений</Text>
            <Text style={styles.emptySubtitle}>
              Чаты создаются при создании курса
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.h2, color: Colors.text.primary },
  searchWrap: { padding: Spacing.md, paddingBottom: Spacing.sm, backgroundColor: Colors.surface },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text.primary, padding: 0 },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  chatThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  chatThumbImg: { width: '100%', height: '100%' },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, flex: 1 },
  chatTime: { fontSize: 12, color: Colors.text.disabled, marginLeft: 8 },
  chatLast: { fontSize: 13, color: Colors.text.secondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});
