import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import { MOCK_USERS } from '../../src/utils/mockData';

const MOCK_CHATS = [
  {
    id: '1',
    user: MOCK_USERS[1],
    lastMessage: 'Привет! Как дела с проектом?',
    time: '14:32',
    unread: 2,
  },
  {
    id: '2',
    user: MOCK_USERS[2],
    lastMessage: 'Спасибо за материалы по React Native',
    time: '12:15',
    unread: 0,
  },
  {
    id: '3',
    user: { id: '4', name: 'Дмитрий Волков', email: 'dv@example.com', avatar: 'https://i.pravatar.cc/150?img=7', createdAt: '' },
    lastMessage: 'Когда будет следующий урок?',
    time: 'Вчера',
    unread: 1,
  },
  {
    id: '4',
    user: { id: '5', name: 'Елена Соколова', email: 'es@example.com', avatar: 'https://i.pravatar.cc/150?img=9', createdAt: '' },
    lastMessage: 'Отличный курс, рекомендую всем!',
    time: 'Пн',
    unread: 0,
  },
];

export default function ChatsScreen() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CHATS.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Сообщения</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={Colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по сообщениям..."
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            activeOpacity={0.6}
            onPress={() => router.push(`/chat/${item.user.id}` as any)}
          >
            <View style={styles.avatarWrap}>
              <Avatar uri={item.user.avatar} name={item.user.name} size={48} />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName}>{item.user.name}</Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={44} color={Colors.text.disabled} />
            <Text style={styles.emptyTitle}>Нет сообщений</Text>
            <Text style={styles.emptySubtitle}>Начните общаться с другими пользователями</Text>
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
  iconBtn: { padding: 4 },
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  chatTime: { fontSize: 12, color: Colors.text.disabled },
  chatBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatMessage: { ...Typography.caption, color: Colors.text.secondary, flex: 1, marginRight: Spacing.sm },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: Colors.text.inverse },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});
