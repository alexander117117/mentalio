import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Users, GraduationCap, Book, PlayCircle,
  TrendUp, TrendDown, PencilSimple, Eye, PlusCircle,
} from 'phosphor-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { Classroom } from '../../src/types';

const CARD_PAD = Spacing.md;
const GREEN = Colors.primary;
const GREEN_MID = '#16A34A';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, sub, value, unit, trend, trendUp,
}: {
  label: string; sub: string; value: string; unit?: string;
  trend: string; trendUp: boolean;
}) {
  return (
    <View style={mc.card}>
      <Text style={mc.label}>{label}</Text>
      <Text style={mc.sub}>{sub}</Text>
      <View style={mc.trendRow}>
        {trendUp
          ? <TrendUp size={13} color={GREEN} weight="bold" />
          : <TrendDown size={13} color={Colors.error} weight="bold" />}
        <Text style={[mc.trend, { color: trendUp ? GREEN : Colors.error }]}>{trend}</Text>
      </View>
      <View style={mc.valueRow}>
        <Text style={mc.value}>{value}</Text>
        {unit && <Text style={mc.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const mc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 3,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },
  sub: { fontSize: 11, color: Colors.text.disabled, marginTop: 1 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 8 },
  trend: { fontSize: 12, fontWeight: '700' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  value: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.5 },
  unit: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary },
});

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ totalStudents, goal }: { totalStudents: number; goal: number }) {
  const pct = Math.min(Math.round((totalStudents / goal) * 100), 100);

  return (
    <View style={gc.card}>
      <Text style={gc.title}>Цель: {goal.toLocaleString()} студентов</Text>
      <Text style={gc.sub}>Всего записавшихся</Text>
      <Text style={gc.progress}>{pct}% от цели</Text>
      <View style={gc.milestoneRow}>
        {[0, 25, 50, 75, 100].map((m) => (
          <Text key={m} style={gc.milestone}>{m}%</Text>
        ))}
      </View>
      <View style={gc.track}>
        <View style={[gc.fill, { width: `${pct}%` }]} />
        <View style={[gc.marker, { left: '75%' }]} />
      </View>
    </View>
  );
}

const gc = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 4,
  },
  title: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },
  sub: { fontSize: 11, color: Colors.text.disabled },
  progress: { fontSize: 15, fontWeight: '700', color: GREEN, marginTop: 10 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  milestone: { fontSize: 10, color: Colors.text.disabled },
  track: {
    height: 14, backgroundColor: '#E2E8F0', borderRadius: 7,
    overflow: 'hidden', marginTop: 2, position: 'relative',
  },
  fill: { height: '100%', backgroundColor: GREEN, borderRadius: 7 },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#64748B' },
});

// ─── Classroom row ────────────────────────────────────────────────────────────

function ClassroomRow({ classroom, totalStudents }: { classroom: Classroom; totalStudents: number }) {
  const courses = useClassroomStore((s) => s.courses);
  const myCourses = courses.filter((c) => c.classroomId === classroom.id);
  const share = totalStudents > 0 ? (classroom.studentsCount / totalStudents) * 100 : 0;
  const revenue = classroom.studentsCount * 990;

  return (
    <View style={cr.row}>
      <View style={cr.thumb}>
        {classroom.thumbnail
          ? <Image source={{ uri: classroom.thumbnail }} style={cr.thumbImg} />
          : <GraduationCap size={16} color={Colors.text.disabled} weight="regular" />}
      </View>
      <View style={cr.info}>
        <View style={cr.nameRow}>
          <Text style={cr.name} numberOfLines={1}>{classroom.name}</Text>
          <Text style={cr.revenue}>₽{(revenue / 1000).toFixed(0)}K</Text>
        </View>
        <View style={cr.metaRow}>
          <Text style={cr.meta}>{classroom.studentsCount} студ. · {myCourses.length} курс.</Text>
          <Text style={cr.share}>{share.toFixed(0)}%</Text>
        </View>
        <View style={cr.track}>
          <View style={[cr.fill, { width: `${share}%` }]} />
        </View>
      </View>
      <View style={cr.actions}>
        <TouchableOpacity style={cr.btn} onPress={() => router.push(`/classroom/${classroom.id}/manage` as any)}>
          <PencilSimple size={13} color={GREEN} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={cr.btn} onPress={() => router.push(`/classroom/${classroom.id}` as any)}>
          <Eye size={13} color={Colors.text.secondary} weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0',
  },
  thumb: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, flex: 1 },
  revenue: { fontSize: 13, fontWeight: '700', color: GREEN },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 11, color: Colors.text.disabled },
  share: { fontSize: 11, color: Colors.text.disabled },
  track: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%', backgroundColor: GREEN_MID, borderRadius: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  btn: {
    width: 28, height: 28, borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const user = useAuthStore((s) => s.user);

  const myClassrooms = classrooms.filter((c) =>
    c.createdBy === user?.id || c.instructor?.id === user?.id
  );
  const totalStudents = myClassrooms.reduce((sum, c) => sum + c.studentsCount, 0);
  const totalCourses = courses.filter((c) => myClassrooms.some((cl) => cl.id === c.classroomId)).length;
  const totalLessons = lessons.filter((l) =>
    courses.filter((c) => myClassrooms.some((cl) => cl.id === c.classroomId)).some((c) => c.id === l.courseId)
  ).length;

  const totalRevenue = totalStudents * 990;
  const prevRevenue = Math.round(totalRevenue * 0.78);
  const revGrowth = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  const periodLabel = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Аналитика</Text>
          <Text style={s.headerSub}>{periodLabel}</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => router.push('/classroom/create' as any)}>
          <PlusCircle size={18} color="#fff" weight="fill" />
          <Text style={s.createBtnText}>Создать</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        <GoalCard totalStudents={totalStudents} goal={500} />

        <View style={s.row}>
          <MetricCard
            label="Выручка" sub="За текущий месяц"
            value={`₽${fmt(totalRevenue)}`}
            trend={`+${revGrowth}%`} trendUp={revGrowth >= 0}
          />
          <MetricCard
            label="Студенты" sub="Всего записей"
            value={fmt(totalStudents)} unit="чел."
            trend="+12%" trendUp
          />
        </View>

        <View style={s.row}>
          <MetricCard
            label="Курсы" sub="Активных курсов"
            value={String(totalCourses)}
            trend={totalCourses > 0 ? '+1 новый' : '—'} trendUp={totalCourses > 0}
          />
          <MetricCard
            label="Уроки" sub="Всего уроков"
            value={String(totalLessons)}
            trend={totalLessons > 0 ? 'Опубликовано' : '—'} trendUp={totalLessons > 0}
          />
        </View>

        {/* Activity */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Активность студентов</Text>
          <View style={s.tableCard}>
            {[
              { label: 'Завершили хотя бы 1 урок', value: '68%', fill: 68 },
              { label: 'Прошли курс полностью',    value: '34%', fill: 34 },
              { label: 'Сдали тест',               value: '51%', fill: 51 },
              { label: 'Средний балл теста',        value: '78 / 100', fill: 78 },
            ].map((item, i, arr) => (
              <View key={item.label} style={[s.actRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={s.actLeft}>
                  <Text style={s.actLabel}>{item.label}</Text>
                  <View style={s.actTrack}>
                    <View style={[s.actFill, { width: `${item.fill}%` }]} />
                  </View>
                </View>
                <Text style={[s.actValue, { color: GREEN }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Classrooms */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Продажи по классам</Text>
            <TouchableOpacity onPress={() => router.push('/classroom/create' as any)}>
              <Text style={s.sectionAction}>+ Создать</Text>
            </TouchableOpacity>
          </View>
          <View style={s.tableCard}>
            {myClassrooms.length === 0 ? (
              <View style={s.emptyWrap}>
                <PlusCircle size={32} color={Colors.text.disabled} weight="regular" />
                <Text style={s.emptyText}>Создайте первую классную комнату</Text>
              </View>
            ) : (
              myClassrooms.map((c) => (
                <ClassroomRow key={c.id} classroom={c} totalStudents={totalStudents} />
              ))
            )}
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: CARD_PAD, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  headerSub: { fontSize: 12, color: Colors.text.disabled, marginTop: 1 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  createBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  content: { padding: CARD_PAD, gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  section: { gap: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  sectionAction: { fontSize: 13, fontWeight: '600', color: GREEN },
  tableCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0',
  },
  actLeft: { flex: 1, gap: 5 },
  actLabel: { fontSize: 13, color: Colors.text.primary },
  actTrack: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  actFill: { height: '100%', backgroundColor: GREEN, borderRadius: 2 },
  actValue: { fontSize: 13, fontWeight: '700', minWidth: 64, textAlign: 'right' },
  emptyWrap: { padding: Spacing.xl, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary, textAlign: 'center' },
});
