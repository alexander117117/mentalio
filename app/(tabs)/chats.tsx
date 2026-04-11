import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatsCircle, PencilSimple, MagnifyingGlass, XCircle } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { useChatStore } from '../../src/store/chatStore';
import { Chat } from '../../src/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Сейчас';
  if (diffMins < 60) return `${diffMins}м`;
  if (diffDays === 0) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function ChatCard({ chat }: { chat: Chat }) {
  const avatarUri = chat.classroomThumbnail ?? chat.dmUserAvatar;
  const unread = chat.unreadCount ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/chat/${chat.id}` as any)}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <ChatsCircle size={22} color={Colors.primary} weight="regular" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Badge + time row */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              {chat.isDM ? 'Личный чат' : chat.classroomId ? 'Чат курса' : 'Чат'}
            </Text>
          </View>
          {chat.lastMessage && (
            <Text style={styles.time}>{formatTime(chat.lastMessage.createdAt)}</Text>
          )}
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>{chat.name}</Text>

        {/* Last message + unread badge */}
        <View style={styles.lastRow}>
          <Text style={[styles.lastMsg, unread > 0 && styles.lastMsgUnread]} numberOfLines={1}>
            {chat.lastMessage
              ? `${chat.lastMessage.userName}: ${chat.lastMessage.content}`
              : 'Нет сообщений'}
          </Text>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Общение</Text>
          <Text style={styles.headerTitle}>Сообщения</Text>
        </View>
        <TouchableOpacity
          style={styles.composeBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/chat/new' as any)}
        >
          <PencilSimple size={18} color={Colors.text.inverse} weight="regular" />
          <Text style={styles.composeBtnText}>Написать</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MagnifyingGlass size={15} color={Colors.text.disabled} weight="regular" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по чатам..."
          placeholderTextColor={Colors.text.disabled}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <XCircle size={15} color={Colors.text.disabled} weight="fill" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatCard chat={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Image
              source={require('../../assets/images/messages_icon.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Нет чатов</Text>
            <Text style={styles.emptySubtitle}>
              Чаты появляются при создании курса
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 16,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.text.disabled,
    lineHeight: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
    marginTop: 2,
  },
  composeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  composeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    padding: 0,
  },

  // List
  list: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 24 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },

  // Avatar
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: { flex: 1, gap: 3 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary,
    lineHeight: 16,
  },
  time: {
    fontSize: 12,
    color: Colors.text.disabled,
    fontWeight: '500',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastMsg: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  lastMsgUnread: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIllustration: { width: 220, height: 220, marginBottom: 4 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
