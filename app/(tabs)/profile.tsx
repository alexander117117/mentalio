import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import { MOCK_USERS, MOCK_COMMUNITIES, MOCK_POSTS } from '../../src/utils/mockData';
import { useClassroomStore } from '../../src/store/classroomStore';

const user = MOCK_USERS[0];
const myCommunities = MOCK_COMMUNITIES.filter((c) => c.isMember);
const myPosts = MOCK_POSTS.filter((p) => p.author.id === user.id);

const ACTIVITY = [
  { icon: 'time-outline',    label: 'Часов обучения',    value: '47' },
  { icon: 'checkmark-circle-outline', label: 'Уроков пройдено', value: '23' },
  { icon: 'trophy-outline',  label: 'Курсов завершено',  value: '2'  },
  { icon: 'flame-outline',   label: 'Дней подряд',       value: '12' },
];

export default function ProfileScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const enrolledClassrooms = classrooms.filter((c) => c.isEnrolled);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профиль</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/profile/settings' as any)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Avatar uri={user.avatar} name={user.name} size={72} />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/profile/edit' as any)}
            >
              <Ionicons name="create-outline" size={16} color={Colors.text.primary} />
              <Text style={styles.editBtnText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.bio}>Учусь, создаю, делюсь знаниями 🚀</Text>
        </View>

        {/* Activity stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активность</Text>
          <View style={styles.activityGrid}>
            {ACTIVITY.map((a) => (
              <View key={a.label} style={styles.activityCard}>
                <Ionicons name={a.icon as any} size={22} color={Colors.primary} />
                <Text style={styles.activityValue}>{a.value}</Text>
                <Text style={styles.activityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Enrolled courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои курсы</Text>
            <Text style={styles.sectionCount}>{enrolledClassrooms.length}</Text>
          </View>
          {enrolledClassrooms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Вы не записаны ни на один курс</Text>
            </View>
          ) : (
            <View style={styles.courseList}>
              {enrolledClassrooms.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.courseRow}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/classroom/${c.id}` as any)}
                >
                  <View style={styles.courseThumbnail}>
                    {c.thumbnail
                      ? <Image source={{ uri: c.thumbnail }} style={styles.courseThumbnailImg} />
                      : <Ionicons name="school-outline" size={20} color={Colors.text.disabled} />
                    }
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.courseInstructor}>{c.instructor.name}</Text>
                    {/* Progress bar mock */}
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '40%' }]} />
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Communities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сообщества</Text>
            <Text style={styles.sectionCount}>{myCommunities.length}</Text>
          </View>
          {myCommunities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Вы не вступили ни в одно сообщество</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communitiesRow}>
              {myCommunities.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.communityChip}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/community/${c.id}` as any)}
                >
                  <Avatar uri={c.avatar} name={c.name} size={40} />
                  <Text style={styles.communityName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.communityMembers}>{c.membersCount.toLocaleString()} чел.</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent posts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Публикации</Text>
            <Text style={styles.sectionCount}>{myPosts.length}</Text>
          </View>
          {myPosts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Нет публикаций</Text>
            </View>
          ) : (
            <View style={styles.postList}>
              {myPosts.map((p) => (
                <View key={p.id} style={styles.postRow}>
                  <Text style={styles.postTitle} numberOfLines={2}>{p.title ?? p.content}</Text>
                  <View style={styles.postMeta}>
                    <Ionicons name="heart-outline" size={13} color={Colors.text.disabled} />
                    <Text style={styles.postMetaText}>{p.likesCount}</Text>
                    <Ionicons name="chatbubble-outline" size={13} color={Colors.text.disabled} />
                    <Text style={styles.postMetaText}>{p.commentsCount}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  headerTitle: { ...Typography.h2, color: Colors.text.primary },
  settingsBtn: { padding: 4 },

  // Hero
  hero: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { ...Typography.caption, fontWeight: '500', color: Colors.text.primary },
  name: { ...Typography.h2, color: Colors.text.primary },
  email: { ...Typography.caption, color: Colors.text.secondary },
  bio: { ...Typography.body, color: Colors.text.secondary, marginTop: 4 },

  // Sections
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg, gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  // Activity
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  activityCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 4,
    alignItems: 'center',
  },
  activityValue: { ...Typography.h2, color: Colors.text.primary },
  activityLabel: { fontSize: 11, color: Colors.text.secondary, textAlign: 'center' },

  // Courses
  courseList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseThumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  courseThumbnailImg: { width: '100%', height: '100%' },
  courseInfo: { flex: 1, gap: 3 },
  courseName: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },
  courseInstructor: { fontSize: 12, color: Colors.text.secondary },
  progressBar: { height: 3, backgroundColor: Colors.surfaceSecondary, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  // Communities
  communitiesRow: { gap: Spacing.sm, paddingBottom: 4 },
  communityChip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
    width: 90,
    gap: 4,
  },
  communityName: { fontSize: 11, fontWeight: '600', color: Colors.text.primary, textAlign: 'center' },
  communityMembers: { fontSize: 10, color: Colors.text.disabled },

  // Posts
  postList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  postRow: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  postTitle: { ...Typography.body, color: Colors.text.primary },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  postMetaText: { fontSize: 12, color: Colors.text.disabled, marginRight: 8 },

  // Empty
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: { ...Typography.body, color: Colors.text.secondary },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: { ...Typography.body, color: Colors.error, fontWeight: '500' },
});
