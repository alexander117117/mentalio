import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import { MOCK_USERS } from '../../src/utils/mockData';

type NotifType = 'like' | 'comment' | 'enroll' | 'lesson' | 'system';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatarUser?: typeof MOCK_USERS[0];
}

const MOCK_NOTIFS: Notification[] = [
  {
    id: '1',
    type: 'enroll',
    title: 'Новый студент',
    body: 'Пётр Смирнов записался на ваш курс «React Native с нуля до Pro»',
    time: '5 мин назад',
    read: false,
    avatarUser: MOCK_USERS[1],
  },
  {
    id: '2',
    type: 'like',
    title: 'Новый лайк',
    body: 'Мария Козлова оценила вашу публикацию',
    time: '1 ч назад',
    read: false,
    avatarUser: MOCK_USERS[2],
  },
  {
    id: '3',
    type: 'comment',
    title: 'Комментарий',
    body: 'Пётр Смирнов прокомментировал урок «Введение в React Native»',
    time: '3 ч назад',
    read: true,
    avatarUser: MOCK_USERS[1],
  },
  {
    id: '4',
    type: 'lesson',
    title: 'Урок завершён',
    body: '5 студентов завершили урок «Настройка рабочего окружения»',
    time: 'Вчера',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Добро пожаловать в Mentalio',
    body: 'Создайте свою классную комнату и начните обучать студентов уже сегодня',
    time: '3 дня назад',
    read: true,
  },
];

const ICON_MAP: Record<NotifType, { name: string; color: string; bg: string }> = {
  like:    { name: 'heart',           color: '#EF4444', bg: '#FEF2F2' },
  comment: { name: 'chatbubble',      color: '#3B82F6', bg: '#EFF6FF' },
  enroll:  { name: 'person-add',      color: Colors.success, bg: Colors.successSurface },
  lesson:  { name: 'play-circle',     color: '#8B5CF6', bg: '#F5F3FF' },
  system:  { name: 'notifications',   color: Colors.warning, bg: Colors.warningSurface },
};

function NotifItem({ item }: { item: Notification }) {
  const icon = ICON_MAP[item.type];
  return (
    <TouchableOpacity style={[styles.row, !item.read && styles.rowUnread]} activeOpacity={0.6}>
      <View style={styles.iconSide}>
        {item.avatarUser ? (
          <View style={styles.avatarWrap}>
            <Avatar uri={item.avatarUser.avatar} name={item.avatarUser.name} size={42} />
            <View style={[styles.iconBadge, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name as any} size={11} color={icon.color} />
            </View>
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name as any} size={20} color={icon.color} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const unreadCount = MOCK_NOTIFS.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Уведомления</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount} новых</Text>
          </View>
        )}
      </View>

      <FlatList
        data={MOCK_NOTIFS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotifItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={44} color={Colors.text.disabled} />
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
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
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.h2, color: Colors.text.primary },
  headerBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  headerBadgeText: { fontSize: 11, color: Colors.text.inverse, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
  },
  rowUnread: { backgroundColor: '#F8F8F8' },
  iconSide: { width: 44 },
  avatarWrap: { position: 'relative', width: 44, height: 44 },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'space-between' },
  notifTitle: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifBody: { ...Typography.caption, color: Colors.text.secondary, lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.text.disabled },
  separator: { height: 1, backgroundColor: Colors.border },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text.secondary },
});
