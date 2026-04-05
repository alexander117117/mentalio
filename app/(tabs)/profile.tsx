import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gear, PencilSimple, GraduationCap, CaretRight, School, SignOut } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import { useAuthStore } from '../../src/store/authStore';
import { useClassroomStore } from '../../src/store/classroomStore';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const setInstructor = useAuthStore((s) => s.setInstructor);
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
          <Gear size={22} color={Colors.text.secondary} weight="regular" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Avatar uri={user?.avatar} name={user?.name ?? ''} size={72} />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/profile/edit' as any)}
            >
              <PencilSimple size={16} color={Colors.text.primary} weight="regular" />
              <Text style={styles.editBtnText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name ?? '—'}</Text>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
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
                      : <GraduationCap size={20} color={Colors.text.disabled} weight="regular" />
                    }
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.courseInstructor}>{c.instructor.name}</Text>
                  </View>
                  <CaretRight size={16} color={Colors.text.disabled} weight="regular" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Instructor toggle */}
        <View style={styles.instructorRow}>
          <View style={styles.instructorLeft}>
            <View style={styles.instructorIconWrap}>
              <GraduationCap size={18} color={Colors.primary} weight="regular" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorLabel}>Я преподаватель</Text>
              <Text style={styles.instructorDesc}>
                {user?.isInstructor
                  ? 'Дашборд выручки виден во вкладке Курсы'
                  : 'Включите, чтобы видеть аналитику курсов'}
              </Text>
            </View>
          </View>
          <Switch
            value={user?.isInstructor ?? false}
            onValueChange={(v) => setInstructor(v)}
            trackColor={{ true: Colors.primary, false: Colors.border }}
            thumbColor={Colors.surface}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <SignOut size={18} color={Colors.error} weight="regular" />
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
  bio: { ...Typography.body, color: Colors.text.secondary, marginTop: 6, lineHeight: 22 },

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

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: { ...Typography.body, color: Colors.text.secondary },

  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructorLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  instructorIconWrap: {
    width: 36, height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  instructorLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  instructorDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },

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
