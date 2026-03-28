import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import { MOCK_USERS } from '../../src/utils/mockData';

const user = MOCK_USERS[0];

const MENU_SECTIONS = [
  {
    title: 'Контент',
    items: [
      { icon: 'document-text-outline', label: 'Мои публикации', value: '12' },
      { icon: 'people-outline', label: 'Мои сообщества', value: '3' },
      { icon: 'school-outline', label: 'Мои классы', value: '2' },
      { icon: 'radio-outline', label: 'Мои эфиры', value: '1' },
    ],
  },
  {
    title: 'Прочее',
    items: [
      { icon: 'chatbubble-outline', label: 'Сообщения' },
      { icon: 'bookmark-outline', label: 'Сохранённое' },
      { icon: 'settings-outline', label: 'Настройки' },
    ],
  },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профиль</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile info */}
        <View style={styles.profileSection}>
          <Avatar uri={user.avatar} name={user.name} size={72} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Редактировать</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Постов', value: '12' },
            { label: 'Сообществ', value: '3' },
            { label: 'Курсов', value: '2' },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  activeOpacity={0.6}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon as any} size={17} color={Colors.text.secondary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.value && (
                      <Text style={styles.menuValue}>{item.value}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={14} color={Colors.text.disabled} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  settingsBtn: {
    padding: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileText: {
    flex: 1,
  },
  name: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  email: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  editBtnText: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.small,
    fontWeight: '600',
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingLeft: 2,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuValue: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  logoutBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '500',
  },
});
