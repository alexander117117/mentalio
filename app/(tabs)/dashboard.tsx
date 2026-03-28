import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { MOCK_USERS } from '../../src/utils/mockData';
import { Classroom } from '../../src/types';

const currentUser = MOCK_USERS[0];

const REVENUE_DATA = [
  { month: 'Окт', value: 42000 },
  { month: 'Ноя', value: 67000 },
  { month: 'Дек', value: 53000 },
  { month: 'Янв', value: 89000 },
  { month: 'Фев', value: 74000 },
  { month: 'Мар', value: 112000 },
];
const MAX_VALUE = Math.max(...REVENUE_DATA.map((d) => d.value));

// ─── Classroom card ───────────────────────────────────────────────────────────

function ClassroomManageCard({ classroom }: { classroom: Classroom }) {
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const myCourses = courses.filter((c) => c.classroomId === classroom.id);
  const myLessons = lessons.filter((l) => myCourses.some((c) => c.id === l.courseId));

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.thumbnail}>
        {classroom.thumbnail ? (
          <Image source={{ uri: classroom.thumbnail }} style={cardStyles.thumbnailImg} />
        ) : (
          <View style={cardStyles.thumbnailPlaceholder}>
            <Ionicons name="school-outline" size={24} color={Colors.text.disabled} />
          </View>
        )}
        <View style={cardStyles.statusBadge}>
          <Text style={cardStyles.statusText}>{classroom.isPublic ? 'Публичный' : 'Приватный'}</Text>
        </View>
      </View>
      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={1}>{classroom.name}</Text>
        <View style={cardStyles.statsRow}>
          <View style={cardStyles.stat}>
            <Ionicons name="people-outline" size={12} color={Colors.text.secondary} />
            <Text style={cardStyles.statText}>{classroom.studentsCount} студентов</Text>
          </View>
          <View style={cardStyles.stat}>
            <Ionicons name="book-outline" size={12} color={Colors.text.secondary} />
            <Text style={cardStyles.statText}>{myCourses.length} курсов</Text>
          </View>
          <View style={cardStyles.stat}>
            <Ionicons name="play-circle-outline" size={12} color={Colors.text.secondary} />
            <Text style={cardStyles.statText}>{myLessons.length} уроков</Text>
          </View>
        </View>
        <View style={cardStyles.actions}>
          <TouchableOpacity
            style={cardStyles.btnPrimary}
            onPress={() => router.push(`/classroom/${classroom.id}/manage` as any)}
          >
            <Ionicons name="create-outline" size={14} color={Colors.text.inverse} />
            <Text style={cardStyles.btnPrimaryText}>Редактировать</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={cardStyles.btnSecondary}
            onPress={() => router.push(`/classroom/${classroom.id}` as any)}
          >
            <Ionicons name="eye-outline" size={14} color={Colors.text.primary} />
            <Text style={cardStyles.btnSecondaryText}>Просмотр</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  thumbnail: {
    width: 90,
    backgroundColor: Colors.surfaceSecondary,
    position: 'relative',
  },
  thumbnailImg: { width: '100%', height: '100%' },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: 10, color: '#fff', fontWeight: '500' },
  info: { flex: 1, padding: Spacing.sm, gap: 6 },
  name: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 11, color: Colors.text.secondary },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: 7,
  },
  btnPrimaryText: { fontSize: 12, fontWeight: '600', color: Colors.text.inverse },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: 7,
  },
  btnSecondaryText: { fontSize: 12, fontWeight: '500', color: Colors.text.primary },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);

  const myClassrooms = classrooms.filter((c) => c.instructor.id === currentUser.id);
  const totalStudents = myClassrooms.reduce((sum, c) => sum + c.studentsCount, 0);
  const totalCourses = courses.filter((c) => myClassrooms.some((cl) => cl.id === c.classroomId)).length;
  const totalLessons = lessons.filter((l) =>
    courses.filter((c) => myClassrooms.some((cl) => cl.id === c.classroomId)).some((c) => c.id === l.courseId)
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Дашборд</Text>
        <Text style={styles.period}>Март 2026</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Revenue card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueTop}>
            <View>
              <Text style={styles.revenueLabel}>Выручка за месяц</Text>
              <Text style={styles.revenueValue}>₽ 112 000</Text>
            </View>
            <View style={styles.revenueBadge}>
              <Ionicons name="trending-up" size={13} color={Colors.success} />
              <Text style={styles.revenueBadgeText}>+51%</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {REVENUE_DATA.map((d) => (
              <View key={d.month} style={styles.chartCol}>
                <View style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.round((d.value / MAX_VALUE) * 100)}%`,
                        backgroundColor: d.month === 'Мар' ? Colors.primary : Colors.surfaceSecondary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{d.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Metrics grid */}
        <View style={styles.grid}>
          {[
            { icon: 'people', label: 'Студентов', value: totalStudents.toLocaleString(), sub: '+124 за месяц', color: Colors.primary },
            { icon: 'school', label: 'Классов', value: String(myClassrooms.length), color: Colors.primary },
            { icon: 'book', label: 'Курсов', value: String(totalCourses), color: '#8B5CF6' },
            { icon: 'play-circle', label: 'Уроков', value: String(totalLessons), color: '#F59E0B' },
          ].map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + '18' }]}>
                <Ionicons name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              {m.sub && <Text style={styles.metricSub}>{m.sub}</Text>}
            </View>
          ))}
        </View>

        {/* Sales breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Продажи по классам</Text>
          <View style={styles.tableCard}>
            {myClassrooms.length === 0 ? (
              <View style={styles.tableEmpty}>
                <Text style={styles.tableEmptyText}>Нет классных комнат</Text>
              </View>
            ) : (
              myClassrooms.map((c, i) => {
                const share = totalStudents > 0 ? (c.studentsCount / totalStudents) * 100 : 0;
                const revenue = c.studentsCount * 990;
                return (
                  <View key={c.id} style={[styles.tableRow, i < myClassrooms.length - 1 && styles.tableRowBorder]}>
                    <View style={styles.tableLeft}>
                      <Text style={styles.tableName} numberOfLines={1}>{c.name}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${share}%` }]} />
                      </View>
                    </View>
                    <View style={styles.tableRight}>
                      <Text style={styles.tableStudents}>{c.studentsCount} уч.</Text>
                      <Text style={styles.tableRevenue}>₽{(revenue / 1000).toFixed(0)}K</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активность</Text>
          <View style={styles.tableCard}>
            {[
              { label: 'Завершили хотя бы 1 урок', value: '68%', color: Colors.success },
              { label: 'Завершили курс полностью', value: '34%', color: Colors.primary },
              { label: 'Прошли тест', value: '51%', color: '#8B5CF6' },
              { label: 'Средняя оценка теста', value: '78 / 100', color: Colors.warning },
            ].map((item, i, arr) => (
              <View key={item.label} style={[styles.tableRow, i < arr.length - 1 && styles.tableRowBorder]}>
                <Text style={styles.activityLabel}>{item.label}</Text>
                <Text style={[styles.activityValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My classrooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои классные комнаты</Text>
            <TouchableOpacity onPress={() => router.push('/classroom/create' as any)}>
              <Text style={styles.sectionAction}>+ Создать</Text>
            </TouchableOpacity>
          </View>

          {myClassrooms.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push('/classroom/create' as any)}
            >
              <Ionicons name="add-circle-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Создайте первую классную комнату</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.classroomList}>
              {myClassrooms.map((classroom) => (
                <ClassroomManageCard key={classroom.id} classroom={classroom} />
              ))}
            </View>
          )}
        </View>

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
  title: { ...Typography.h2, color: Colors.text.primary },
  period: { ...Typography.caption, color: Colors.text.secondary },
  content: { padding: Spacing.md, gap: Spacing.md },

  // Revenue
  revenueCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  revenueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  revenueLabel: { ...Typography.caption, color: Colors.text.secondary },
  revenueValue: { ...Typography.h1, color: Colors.text.primary, marginTop: 2 },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  revenueBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.success },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 6 },
  chartCol: { flex: 1, alignItems: 'center', height: '100%', gap: 4 },
  barWrap: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: Colors.text.disabled, fontWeight: '500' },

  // Metrics
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 3,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: { ...Typography.h2, color: Colors.text.primary },
  metricLabel: { ...Typography.caption, color: Colors.text.secondary },
  metricSub: { fontSize: 11, color: Colors.success, fontWeight: '600' },

  // Table
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  sectionAction: { ...Typography.caption, fontWeight: '600', color: Colors.primary },
  tableCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.md,
  },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tableLeft: { flex: 1, gap: 6 },
  tableName: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },
  progressBar: { height: 4, backgroundColor: Colors.surfaceSecondary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  tableRight: { alignItems: 'flex-end', gap: 2 },
  tableStudents: { ...Typography.caption, color: Colors.text.secondary },
  tableRevenue: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  tableEmpty: { padding: Spacing.lg, alignItems: 'center' },
  tableEmptyText: { ...Typography.body, color: Colors.text.secondary },
  activityLabel: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  activityValue: { ...Typography.body, fontWeight: '700' },

  // Classrooms
  classroomList: { gap: Spacing.sm },
  emptyCard: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  emptyTitle: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
});
