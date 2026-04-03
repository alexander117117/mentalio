import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Image, ScrollView, Animated, Dimensions, FlatList, Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { getTag } from '../../src/constants/tags';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';
import { useLiveStore } from '../../src/store/liveStore';
import { Classroom, LiveStream } from '../../src/types';
import Avatar from '../../src/components/ui/Avatar';
import { tapLight } from '../../src/utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// ─── Calendar strip ───────────────────────────────────────────────────────────

function buildWeek() {
  const today = new Date();
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_NAMES = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

const PLATFORM_ICONS: Record<string, string> = {
  youtube: 'logo-youtube',
  zoom: 'videocam-outline',
  other: 'radio-outline',
};

function CalendarStrip({ streams }: { streams: LiveStream[] }) {
  const today = new Date();
  const week = buildWeek();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [popupVisible, setPopupVisible] = useState(false);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Центрируем сегодняшний день (индекс 3 из 7)
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 3, animated: false, viewPosition: 0.5 });
    }, 0);
  }, []);

  const showPopup = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setPopupVisible(true);
    popupAnim.setValue(0);
    Animated.spring(popupAnim, { toValue: 1, damping: 16, stiffness: 200, useNativeDriver: true }).start();
    hideTimer.current = setTimeout(() => {
      Animated.timing(popupAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setPopupVisible(false);
      });
    }, 3000);
  };

  const selectDay = (d: Date) => {
    tapLight();
    setSelectedDate(d);
    showPopup();
  };

  // Эфиры на выбранный день
  const dayEvents = streams.filter((s) => {
    const at = s.scheduledAt ?? s.startedAt;
    if (!at) return false;
    const d = new Date(at);
    return d.toDateString() === selectedDate.toDateString();
  });

  const isToday = selectedDate.toDateString() === today.toDateString();

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={week}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(d) => d.toISOString()}
        contentContainerStyle={calStyles.list}
        getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
        renderItem={({ item }) => {
          const isTodayItem = item.getDate() === today.getDate() && item.getMonth() === today.getMonth();
          const isSelected = item.toDateString() === selectedDate.toDateString();
          // Есть ли эфиры на этот день
          const hasEvents = streams.some((s) => {
            const at = s.scheduledAt ?? s.startedAt;
            return at && new Date(at).toDateString() === item.toDateString();
          });
          return (
            <TouchableOpacity
              style={[calStyles.day, isSelected && calStyles.daySelected]}
              onPress={() => selectDay(item)}
              activeOpacity={0.7}
            >
              <Text style={[calStyles.dayName, isSelected && calStyles.dayNameSelected]}>
                {DAY_NAMES[item.getDay()]}
              </Text>
              <Text style={[calStyles.dayNum, isSelected && calStyles.dayNumSelected]}>
                {item.getDate()}
              </Text>
              {(isTodayItem || hasEvents) && (
                <View style={[calStyles.dot, isSelected && calStyles.dotSelected, hasEvents && !isSelected && calStyles.dotEvent]} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Glassmorphism popup — absolute, floats over white card */}
      {popupVisible && (
        <Animated.View style={[
          calStyles.popup,
          {
            opacity: popupAnim,
            transform: [{ translateY: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
          },
        ]}>
          <View style={calStyles.popupInner}>
              <Text style={calStyles.popupDate}>
                {isToday ? 'Сегодня' : `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`}
              </Text>
              {dayEvents.length === 0 ? (
                <View style={calStyles.emptyRow}>
                  <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={calStyles.emptyText}>Нет запланированных мероприятий</Text>
                </View>
              ) : (
                dayEvents.map((ev) => (
                  <TouchableOpacity
                    key={ev.id}
                    style={calStyles.eventRow}
                    activeOpacity={0.75}
                    onPress={() => router.push(`/live/${ev.id}` as any)}
                  >
                    <View style={[calStyles.eventDot, ev.status === 'live' && calStyles.eventDotLive]} />
                    <View style={{ flex: 1 }}>
                      <Text style={calStyles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                      {ev.scheduledAt && (
                        <Text style={calStyles.eventTime}>
                          {new Date(ev.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <Ionicons name={PLATFORM_ICONS[ev.platform] as any} size={14} color="rgba(255,255,255,0.45)" />
                  </TouchableOpacity>
                ))
              )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const calStyles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.md },
  list: { gap: 4 },
  day: {
    width: 44,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  daySelected: { backgroundColor: Colors.primary },
  dayName: { fontSize: 11, fontWeight: '500', color: Colors.text.secondary },
  dayNameSelected: { color: 'rgba(255,255,255,0.7)' },
  dayNum: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  dayNumSelected: { color: Colors.text.inverse },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  dotSelected: { backgroundColor: 'rgba(255,255,255,0.7)' },
  dotEvent: { backgroundColor: Colors.live },

  // Glassmorphism popup
  popup: {
    position: 'absolute',
    top: 62,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.xl,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  blurView: {},
  popupInner: {
    padding: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(18,18,18,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  popupDate: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  eventDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', flexShrink: 0 },
  eventDotLive: { backgroundColor: Colors.live },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  eventTime: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
});

// ─── Course card (inside the white sheet) ────────────────────────────────────

function CourseCard({ classroom }: { classroom: Classroom }) {
  return (
    <TouchableOpacity
      style={cardStyles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/classroom/${classroom.id}` as any)}
    >
      <View style={cardStyles.thumb}>
        {classroom.thumbnail ? (
          <Image source={{ uri: classroom.thumbnail }} style={cardStyles.thumbImg} />
        ) : (
          <View style={cardStyles.thumbPlaceholder}>
            <Ionicons name="school-outline" size={22} color={Colors.text.disabled} />
          </View>
        )}
        {!classroom.isPublic && (
          <View style={cardStyles.paidBadge}>
            <Text style={cardStyles.paidText}>Платный</Text>
          </View>
        )}
      </View>

      <View style={cardStyles.body}>
        {classroom.tags?.length > 0 && (
          <View style={cardStyles.tagsRow}>
            {classroom.tags.slice(0, 2).map((tagId) => {
              const tag = getTag(tagId);
              if (!tag) return null;
              return (
                <View key={tagId} style={[cardStyles.tagChip, { backgroundColor: tag.background }]}>
                  <Text style={cardStyles.tagEmoji}>{tag.emoji}</Text>
                  <Text style={[cardStyles.tagLabel, { color: tag.color }]}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        )}
        <Text style={cardStyles.name} numberOfLines={2}>{classroom.name}</Text>
        <View style={cardStyles.instructor}>
          <Avatar uri={classroom.instructor.avatar} name={classroom.instructor.name} size={16} />
          <Text style={cardStyles.instructorName}>{classroom.instructor.name}</Text>
        </View>
        <View style={cardStyles.meta}>
          <Ionicons name="people-outline" size={11} color={Colors.text.disabled} />
          <Text style={cardStyles.metaText}>{classroom.studentsCount} студентов</Text>
          <View style={cardStyles.metaDot} />
          <Ionicons name="book-outline" size={11} color={Colors.text.disabled} />
          <Text style={cardStyles.metaText}>{classroom.coursesCount} курсов</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumb: {
    height: 120,
    backgroundColor: Colors.surfaceSecondary,
    position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  paidBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  paidText: { fontSize: 11, color: Colors.text.inverse, fontWeight: '600' },
  body: { padding: Spacing.sm, gap: 5 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, lineHeight: 19 },
  instructor: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  instructorName: { fontSize: 11, color: Colors.text.secondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.text.disabled },
  metaDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: Colors.text.disabled },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full },
  tagEmoji: { fontSize: 11 },
  tagLabel: { fontSize: 10, fontWeight: '700' },
});

// ─── Drawer ───────────────────────────────────────────────────────────────────

function DrawerContent({
  user, myClassrooms, translateX, closeDrawer,
}: {
  user: any;
  myClassrooms: Classroom[];
  translateX: Animated.Value;
  closeDrawer: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX }] }]}>
      {/* Account block */}
      <View style={[drawerStyles.accountBlock, { paddingTop: insets.top + 16 }]}>
        <Avatar uri={user?.avatar} name={user?.name ?? ''} size={48} />
        <View style={drawerStyles.accountInfo}>
          <Text style={drawerStyles.accountName} numberOfLines={1}>{user?.name ?? 'Пользователь'}</Text>
          <Text style={drawerStyles.accountEmail} numberOfLines={1}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <View style={drawerStyles.divider} />

      {/* Courses section */}
      <View style={drawerStyles.sectionHeader}>
        <Text style={drawerStyles.sectionTitle}>Мои курсы</Text>
        <View style={drawerStyles.badge}>
          <Text style={drawerStyles.badgeText}>{myClassrooms.length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {myClassrooms.length === 0 ? (
          <View style={drawerStyles.empty}>
            <Ionicons name="school-outline" size={28} color={Colors.text.disabled} />
            <Text style={drawerStyles.emptyText}>Вы не записаны ни на один курс</Text>
          </View>
        ) : (
          myClassrooms.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={drawerStyles.row}
              activeOpacity={0.65}
              onPress={() => { closeDrawer(); router.push(`/classroom/${c.id}` as any); }}
            >
              <View style={drawerStyles.courseThumb}>
                {c.thumbnail
                  ? <Image source={{ uri: c.thumbnail }} style={drawerStyles.courseThumbImg} />
                  : <Ionicons name="school-outline" size={18} color={Colors.text.disabled} />
                }
              </View>
              <View style={drawerStyles.rowInfo}>
                <Text style={drawerStyles.rowName} numberOfLines={1}>{c.name}</Text>
                <Text style={drawerStyles.rowSub}>{c.instructor.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.text.disabled} />
            </TouchableOpacity>
          ))
        )}

        <View style={drawerStyles.divider} />

        <TouchableOpacity
          style={drawerStyles.footerBtn}
          activeOpacity={0.7}
          onPress={() => { closeDrawer(); router.push('/(tabs)/classrooms' as any); }}
        >
          <View style={drawerStyles.footerIcon}>
            <Ionicons name="compass-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={drawerStyles.footerText}>Обзор курсов</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </Animated.View>
  );
}

const drawerStyles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  accountBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingBottom: 20,
  },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  accountEmail: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 },
  badge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  rowSub: { fontSize: 11, color: Colors.text.disabled, marginTop: 2 },
  courseThumb: {
    width: 38, height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  courseThumbImg: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', paddingTop: 32, paddingHorizontal: Spacing.lg, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginTop: 4,
  },
  footerIcon: {
    width: 34, height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center', justifyContent: 'center',
  },
  footerText: { fontSize: 14, fontWeight: '500', color: Colors.primary },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const user = useAuthStore((s) => s.user);
  const myClassrooms = classrooms.filter((c) => c.isEnrolled);
  const streams = useLiveStore((s) => s.streams);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    tapLight();
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const today = new Date();
  const monthYear = `${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`;

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Split into pairs for 2-column grid
  const pairs: Classroom[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    pairs.push(filtered.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── RED ZONE: plain background, no card ──────────────────────────── */}
      <View style={styles.topZone}>
        {/* Row: burger + month label + avatar */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => drawerOpen ? closeDrawer() : openDrawer()}
            style={styles.burgerBtn}
            activeOpacity={0.8}
          >
            <Ionicons name={drawerOpen ? 'close' : 'menu'} size={22} color={Colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>{monthYear}</Text>

          <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
            <Avatar uri={user?.avatar} name={user?.name ?? ''} size={36} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <CalendarStrip streams={streams} />
      </View>

      {/* ── GREEN ZONE: white card sheet ─────────────────────────────────── */}
      <View style={styles.sheet}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={17} color={Colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск курсов..."
            placeholderTextColor={Colors.text.disabled}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color={Colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Все курсы</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>

        {/* Course grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Image
                source={require('../../assets/images/empty-courses.png')}
                style={styles.emptyIllustration}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Нет курсов</Text>
              <Text style={styles.emptyText}>Создайте первый курс и начните обучать студентов</Text>
            </View>
          ) : (
            pairs.map((pair, i) => (
              <View key={i} style={styles.gridRow}>
                {pair.map((c) => (
                  <View key={c.id} style={styles.gridCell}>
                    <CourseCard classroom={c} />
                  </View>
                ))}
                {pair.length === 1 && <View style={styles.gridCell} />}
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents={drawerOpen ? 'box-none' : 'none'}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
        </Animated.View>
        <DrawerContent
          user={user}
          myClassrooms={myClassrooms}
          translateX={translateX}
          closeDrawer={closeDrawer}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Red zone — plain background
  topZone: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  burgerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },

  // Green zone — white card
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    ...Shadows.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text.primary, padding: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  countBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridCell: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: Spacing.lg, gap: 8 },
  emptyIllustration: { width: 200, height: 200, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  emptyText: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20 },

  // Drawer
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
});
