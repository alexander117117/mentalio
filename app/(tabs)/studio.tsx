import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar, TrendUp, TrendDown, GraduationCap, Users, Book, Gear, Eye, Plus } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { Classroom } from '../../src/types';
import { tapLight } from '../../src/utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MONTH_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const MONTH_FULL = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

interface MonthData {
  month: string;
  monthFull: string;
  purchases: number;
  revenue: number;
  profit: number;
}

// ─── Interactive line chart ───────────────────────────────────────────────────

function MetricLineChart({ data, getValue, getLabel, selectedIndex, onSelect, color, cardWidth }: {
  data: MonthData[];
  getValue: (d: MonthData) => number;
  getLabel: (d: MonthData) => string;
  selectedIndex: number;
  onSelect: (i: number) => void;
  color: string;
  cardWidth: number;
}) {
  const CHART_W = cardWidth;
  const CHART_H = 100;
  const PAD_X = 16;
  const PAD_TOP = 26;
  const PAD_BOT = 10;

  const maxVal = Math.max(...data.map(getValue), 1);

  const points = data.map((d, i) => {
    const x = PAD_X + (i / (data.length - 1)) * (CHART_W - PAD_X * 2);
    const y = PAD_TOP + (1 - getValue(d) / maxVal) * (CHART_H - PAD_TOP - PAD_BOT);
    return { x, y };
  });

  const areaPath = [
    `M ${points[0].x} ${CHART_H}`,
    `L ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map((p, i) => {
      const prev = points[i];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    }),
    `L ${points[points.length - 1].x} ${CHART_H}`,
    'Z',
  ].join(' ');

  const linePath = [
    `M ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map((p, i) => {
      const prev = points[i];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    }),
  ].join(' ');

  const selPt = points[selectedIndex];
  const labelX = Math.max(28, Math.min(CHART_W - 28, selPt.x));
  const gradId = `grad_${color.replace('#', '')}`;

  return (
    <View>
      {/* Chart + invisible tap columns overlay */}
      <View style={{ width: CHART_W, height: CHART_H }}>
        <Svg width={CHART_W} height={CHART_H} style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.18" />
              <Stop offset="1" stopColor={color} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gradId})`} />
          <Path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === selectedIndex ? 6 : 3}
              fill={i === selectedIndex ? color : Colors.surface}
              stroke={color}
              strokeWidth={i === selectedIndex ? 0 : 1.5}
            />
          ))}
          <SvgText
            x={labelX}
            y={selPt.y - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={color}
          >
            {getLabel(data[selectedIndex])}
          </SvgText>
        </Svg>
        {/* Full-height tap zones — one per month column */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
          {data.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={{ flex: 1, height: CHART_H }}
              onPress={() => { tapLight(); onSelect(i); }}
              activeOpacity={0.01}
            />
          ))}
        </View>
      </View>

      {/* Month labels row */}
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {data.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
            onPress={() => { tapLight(); onSelect(i); }}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
          >
            <Text style={[
              chartStyles.monthLabel,
              i === selectedIndex && { color, fontWeight: '700' },
            ]}>
              {d.month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  monthLabel: { fontSize: 10, color: Colors.text.disabled, fontWeight: '500' },
});

// ─── Bar chart (purchases) ────────────────────────────────────────────────────

function BarChart({ data, getValue, getLabel, selectedIndex, onSelect, color }: {
  data: MonthData[];
  getValue: (d: MonthData) => number;
  getLabel: (d: MonthData) => string;
  selectedIndex: number;
  onSelect: (i: number) => void;
  color: string;
}) {
  const maxVal = Math.max(...data.map(getValue), 1);
  const BAR_MAX_H = 56;
  const LABEL_AREA = 20;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + LABEL_AREA, gap: 5 }}>
        {data.map((d, i) => {
          const barH = Math.max((getValue(d) / maxVal) * BAR_MAX_H, 4);
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              style={{ flex: 1, alignItems: 'center', height: BAR_MAX_H + LABEL_AREA, justifyContent: 'flex-end' }}
              onPress={() => { tapLight(); onSelect(i); }}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Text style={{ fontSize: 10, fontWeight: '700', color, marginBottom: 3, textAlign: 'center' }}>
                  {getLabel(d)}
                </Text>
              )}
              <View style={{
                width: '100%',
                height: barH,
                backgroundColor: isSelected ? color : color + '28',
                borderRadius: 5,
              }} />
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6, gap: 5 }}>
        {data.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => { tapLight(); onSelect(i); }}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
          >
            <Text style={[chartStyles.monthLabel, i === selectedIndex && { color, fontWeight: '700' }]}>
              {d.month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Revenue dashboard ────────────────────────────────────────────────────────

const BENTO_GAP = 8;
const CARD_PAD = 28; // 14px on each side
const FULL_CHART_W = SCREEN_WIDTH - Spacing.md * 2 - CARD_PAD;
const HALF_CHART_W = (SCREEN_WIDTH - Spacing.md * 2 - BENTO_GAP) / 2 - CARD_PAD;

function RevenueDashboard({ myClassrooms }: { myClassrooms: Classroom[] }) {
  const [revIdx, setRevIdx] = useState(5);
  const [purIdx, setPurIdx] = useState(5);
  const [proIdx, setProIdx] = useState(5);

  const chartData: MonthData[] = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const courseCount = myClassrooms.length;
      const factor = (i + 1) / 6;
      const purchases = Math.round(courseCount * factor * (3 + Math.random() * 4));
      const revenue = Math.round(purchases * (1500 + Math.random() * 2000));
      const profit = Math.round(revenue * 0.9);
      return {
        month: MONTH_SHORT[d.getMonth()],
        monthFull: MONTH_FULL[d.getMonth()],
        purchases,
        revenue,
        profit,
      };
    });
  }, [myClassrooms.length]);

  const today = new Date();
  const currentMonthFull = MONTH_FULL[today.getMonth()];

  const revSel = chartData[revIdx];
  const revPrev = revIdx > 0 ? chartData[revIdx - 1] : null;
  const growthPct = revPrev && revPrev.revenue > 0
    ? Math.round(((revSel.revenue - revPrev.revenue) / revPrev.revenue) * 100)
    : null;

  const purSel = chartData[purIdx];
  const purPrev = purIdx > 0 ? chartData[purIdx - 1] : null;
  const purGrowth = purPrev && purPrev.purchases > 0
    ? Math.round(((purSel.purchases - purPrev.purchases) / purPrev.purchases) * 100)
    : null;

  const proSel = chartData[proIdx];
  const proPrev = proIdx > 0 ? chartData[proIdx - 1] : null;
  const proGrowth = proPrev && proPrev.profit > 0
    ? Math.round(((proSel.profit - proPrev.profit) / proPrev.profit) * 100)
    : null;

  const formatMoney = (n: number) =>
    n >= 1000000 ? `₽${(n / 1000000).toFixed(1)}м`
    : n >= 1000 ? `₽${(n / 1000).toFixed(1)}k`
    : `₽${n}`;

  return (
    <View style={dashStyles.wrapper}>
      {/* Header row */}
      <View style={dashStyles.headerRow}>
        <View>
          <Text style={dashStyles.headerSub}>Аналитика доходов</Text>
          <Text style={dashStyles.headerMonth}>{currentMonthFull}</Text>
        </View>
        <View style={dashStyles.betaBadge}>
          <Text style={dashStyles.betaText}>BETA</Text>
        </View>
      </View>

      {/* Bento grid */}
      <View style={dashStyles.bento}>

        {/* Revenue — full width hero */}
        <View style={dashStyles.bentoCard}>
          <View style={dashStyles.bentoCardHeader}>
            <Text style={dashStyles.metricTagText}>выручка</Text>
            {growthPct !== null && (
              <View style={[dashStyles.growthBadge, { backgroundColor: growthPct >= 0 ? '#EBF5FF' : '#FEF2F2' }]}>
                {growthPct >= 0
                  ? <TrendUp size={11} color={Colors.primary} weight="regular" />
                  : <TrendDown size={11} color={Colors.error} weight="regular" />}
                <Text style={[dashStyles.growthText, { color: growthPct >= 0 ? Colors.primary : Colors.error }]}>
                  {growthPct >= 0 ? '+' : ''}{growthPct}%
                </Text>
              </View>
            )}
          </View>
          <Text style={dashStyles.selectedMonth}>{revSel.monthFull}</Text>
          <Text style={dashStyles.bentoValue}>{formatMoney(revSel.revenue)}</Text>
          <Text style={dashStyles.bentoDesc}>Общая сумма платежей студентов за курсы в этом месяце</Text>
          <MetricLineChart
            data={chartData}
            getValue={(d) => d.revenue}
            getLabel={(d) => formatMoney(d.revenue)}
            selectedIndex={revIdx}
            onSelect={setRevIdx}
            color={Colors.primary}
            cardWidth={FULL_CHART_W}
          />
        </View>

        {/* Bottom row: Purchases (bar) + Profit (line) */}
        <View style={dashStyles.bentoRow}>

          {/* Purchases — bar chart */}
          <View style={[dashStyles.bentoCard, { flex: 1 }]}>
            <View style={dashStyles.bentoCardHeader}>
              <Text style={dashStyles.metricTagText}>покупки</Text>
              {purGrowth !== null && (
                <View style={[dashStyles.growthBadge, { backgroundColor: purGrowth >= 0 ? '#EBF5FF' : '#FEF2F2' }]}>
                  {purGrowth >= 0
                    ? <TrendUp size={10} color={Colors.primary} weight="regular" />
                    : <TrendDown size={10} color={Colors.error} weight="regular" />}
                  <Text style={[dashStyles.growthText, { color: purGrowth >= 0 ? Colors.primary : Colors.error }]}>
                    {purGrowth >= 0 ? '+' : ''}{purGrowth}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={dashStyles.selectedMonth}>{purSel.monthFull}</Text>
            <Text style={dashStyles.bentoValueSm}>{purSel.purchases}</Text>
            <BarChart
              data={chartData}
              getValue={(d) => d.purchases}
              getLabel={(d) => String(d.purchases)}
              selectedIndex={purIdx}
              onSelect={setPurIdx}
              color={Colors.primary}
            />
          </View>

          {/* Profit — line chart */}
          <View style={[dashStyles.bentoCard, { flex: 1 }]}>
            <View style={dashStyles.bentoCardHeader}>
              <Text style={dashStyles.metricTagText}>прибыль</Text>
              {proGrowth !== null && (
                <View style={[dashStyles.growthBadge, { backgroundColor: proGrowth >= 0 ? '#EBF5FF' : '#FEF2F2' }]}>
                  {proGrowth >= 0
                    ? <TrendUp size={10} color={Colors.primary} weight="regular" />
                    : <TrendDown size={10} color={Colors.error} weight="regular" />}
                  <Text style={[dashStyles.growthText, { color: proGrowth >= 0 ? Colors.primary : Colors.error }]}>
                    {proGrowth >= 0 ? '+' : ''}{proGrowth}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={dashStyles.selectedMonth}>{proSel.monthFull}</Text>
            <Text style={dashStyles.bentoValueSm}>{formatMoney(proSel.profit)}</Text>
            <MetricLineChart
              data={chartData}
              getValue={(d) => d.profit}
              getLabel={(d) => formatMoney(d.profit)}
              selectedIndex={proIdx}
              onSelect={setProIdx}
              color={Colors.primary}
              cardWidth={HALF_CHART_W}
            />
          </View>

        </View>

      </View>

      <Text style={dashStyles.disclaimer}>
        * Данные носят ознакомительный характер до подключения платёжного модуля.
      </Text>
    </View>
  );
}

const dashStyles = StyleSheet.create({
  wrapper: { gap: 12 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerSub: { fontSize: 11, color: Colors.text.disabled, lineHeight: 16 },
  headerMonth: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginTop: 2 },
  betaBadge: { paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#F5F3FF', borderRadius: BorderRadius.sm },
  betaText: { fontSize: 9, fontWeight: '800', color: '#8B5CF6', letterSpacing: 0.5 },

  bento: { gap: 8 },
  bentoRow: { flexDirection: 'row', gap: BENTO_GAP },

  bentoCard: {
    backgroundColor: '#F0F5FF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#D4E2FF',
    padding: 14,
    gap: 6,
    ...Shadows.sm,
  },

  bentoCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  metricTagText: { fontSize: 11, color: Colors.text.disabled, lineHeight: 16 },

  selectedMonth: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  bentoValue: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, lineHeight: 30 },
  bentoValueSm: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, lineHeight: 26 },
  bentoDesc: { fontSize: 11, color: Colors.text.disabled, lineHeight: 16 },

  growthBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  growthText: { fontSize: 11, fontWeight: '700' },

  disclaimer: { fontSize: 10, color: Colors.text.disabled, lineHeight: 14, fontStyle: 'italic' },
});

// ─── Classroom card ───────────────────────────────────────────────────────────

function ClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardThumb}>
        {classroom.thumbnail
          ? <Image source={{ uri: classroom.thumbnail }} style={styles.cardThumbImg} />
          : <View style={styles.cardThumbPlaceholder}>
              <GraduationCap size={28} color={Colors.text.disabled} weight="regular" />
            </View>
        }
        <View style={styles.visibilityBadge}>
          <Text style={styles.visibilityText}>{classroom.isPublic ? 'Публичный' : 'Приватный'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{classroom.name}</Text>
        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Users size={12} color={Colors.text.secondary} weight="regular" />
            <Text style={styles.statText}>{classroom.studentsCount}</Text>
          </View>
          <View style={styles.stat}>
            <Book size={12} color={Colors.text.secondary} weight="regular" />
            <Text style={styles.statText}>{classroom.coursesCount} курсов</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.manageBtn}
            activeOpacity={0.7}
            onPress={() => { tapLight(); router.push(`/classroom/${classroom.id}/manage` as any); }}
          >
            <Gear size={14} color={Colors.text.primary} weight="regular" />
            <Text style={styles.manageBtnText}>Управлять</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewBtn}
            activeOpacity={0.7}
            onPress={() => { tapLight(); router.push(`/classroom/${classroom.id}` as any); }}
          >
            <Eye size={14} color={Colors.text.secondary} weight="regular" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function StudioScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const classrooms = useClassroomStore((s) => s.classrooms);
  const myClassrooms = classrooms.filter((c) => c.instructor?.id === user?.id);
  const isInstructor = user?.isInstructor ?? false;

  const handleCreate = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Требуется аккаунт',
        'Зарегистрируйтесь или войдите в аккаунт',
        [
          { text: 'Войти', onPress: () => router.push('/login' as any) },
          { text: 'Отмена', style: 'cancel' },
        ]
      );
      return;
    }
    tapLight();
    router.push('/classroom/create' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.topZone}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topSub}>Создание контента</Text>
            <Text style={styles.topTitle}>Мои курсы</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={handleCreate}>
            <Plus size={18} color={Colors.text.inverse} weight="bold" />
            <Text style={styles.createBtnText}>Создать</Text>
          </TouchableOpacity>
        </View>

        {myClassrooms.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{myClassrooms.length}</Text>
              <Text style={styles.statChipLabel}>Курсов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>
                {myClassrooms.reduce((s, c) => s + c.studentsCount, 0)}
              </Text>
              <Text style={styles.statChipLabel}>Студентов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>
                {myClassrooms.reduce((s, c) => s + c.coursesCount, 0)}
              </Text>
              <Text style={styles.statChipLabel}>Разделов</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>

          {isInstructor && myClassrooms.length > 0 && (
            <RevenueDashboard myClassrooms={myClassrooms} />
          )}

          {isInstructor && myClassrooms.length === 0 && (
            <View style={styles.instructorHint}>
              <ChartBar size={20} color="#8B5CF6" weight="regular" />
              <Text style={styles.instructorHintText}>
                Создайте первый курс, чтобы начать получать аналитику доходов
              </Text>
            </View>
          )}

          {myClassrooms.length === 0 ? (
            <View style={styles.empty}>
              <Image
                source={require('../../assets/images/empty-courses.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Нет курсов</Text>
              <Text style={styles.emptySubtitle}>
                Создайте первый курс и начните обучать студентов
              </Text>
              <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.8} onPress={handleCreate}>
                <Plus size={16} color={Colors.text.inverse} weight="bold" />
                <Text style={styles.emptyBtnText}>Создать курс</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myClassrooms.map((c) => <ClassroomCard key={c.id} classroom={c} />)
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topZone: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 20,
    gap: 16,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topSub: { fontSize: 11, color: Colors.text.disabled, lineHeight: 16 },
  topTitle: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, marginTop: 2 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md,
    paddingVertical: 10, borderRadius: BorderRadius.md,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.inverse },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statChip: { flex: 1, alignItems: 'center', gap: 2 },
  statChipValue: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  statChipLabel: { fontSize: 11, color: Colors.text.secondary },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  sheet: {
    flex: 1, backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, ...Shadows.sm,
  },
  sheetContent: { padding: Spacing.md, gap: Spacing.md },

  instructorHint: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, backgroundColor: '#F5F3FF',
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: '#DDD6FE',
  },
  instructorHintText: { flex: 1, fontSize: 13, color: '#6D28D9', lineHeight: 19 },

  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadows.sm,
  },
  cardThumb: { height: 140, backgroundColor: Colors.surfaceSecondary, position: 'relative' },
  cardThumbImg: { width: '100%', height: '100%' },
  cardThumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  visibilityBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  visibilityText: { fontSize: 11, color: '#fff', fontWeight: '500' },
  cardBody: { padding: Spacing.md, gap: Spacing.sm },
  cardName: { ...Typography.body, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  cardStats: { flexDirection: 'row', gap: Spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: Colors.text.secondary },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  manageBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  manageBtnText: { fontSize: 13, fontWeight: '500', color: Colors.text.primary },
  previewBtn: {
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingTop: 32, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  emptyIllustration: { width: 220, height: 220, marginBottom: 4 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: {
    ...Typography.body, color: Colors.text.secondary,
    textAlign: 'center', lineHeight: 22, maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl,
    paddingVertical: 13, borderRadius: BorderRadius.md, marginTop: Spacing.sm,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text.inverse },
});
