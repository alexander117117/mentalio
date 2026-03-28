import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Image, ScrollView, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useClassroomStore } from '../../src/store/classroomStore';
import { MOCK_USERS, MOCK_COMMUNITIES } from '../../src/utils/mockData';
import { Classroom } from '../../src/types';
import Avatar from '../../src/components/ui/Avatar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const currentUser = MOCK_USERS[0];
const CATEGORIES = ['Все', 'Дизайн', 'Разработка', 'Маркетинг', 'Бизнес', 'Языки'];
const myCommunities = MOCK_COMMUNITIES.filter((c) => c.isMember);

function CourseCard({ classroom }: { classroom: Classroom }) {
  return (
    <TouchableOpacity
      style={courseStyles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/classroom/${classroom.id}` as any)}
    >
      <View style={courseStyles.thumbnail}>
        {classroom.thumbnail ? (
          <Image source={{ uri: classroom.thumbnail }} style={courseStyles.thumbnailImg} />
        ) : (
          <View style={courseStyles.thumbnailPlaceholder}>
            <Ionicons name="school-outline" size={32} color={Colors.text.disabled} />
          </View>
        )}
        {!classroom.isPublic && (
          <View style={courseStyles.paidBadge}>
            <Text style={courseStyles.paidText}>Платный</Text>
          </View>
        )}
      </View>
      <View style={courseStyles.info}>
        <Text style={courseStyles.name} numberOfLines={2}>{classroom.name}</Text>
        <View style={courseStyles.instructorRow}>
          <Avatar uri={classroom.instructor.avatar} name={classroom.instructor.name} size={18} />
          <Text style={courseStyles.instructorName}>{classroom.instructor.name}</Text>
        </View>
        <View style={courseStyles.meta}>
          <Ionicons name="people-outline" size={12} color={Colors.text.disabled} />
          <Text style={courseStyles.metaText}>{classroom.studentsCount.toLocaleString()} студентов</Text>
          <View style={courseStyles.dot} />
          <Ionicons name="book-outline" size={12} color={Colors.text.disabled} />
          <Text style={courseStyles.metaText}>{classroom.coursesCount} курсов</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const courseStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  thumbnail: { height: 130, backgroundColor: Colors.surfaceSecondary, position: 'relative' },
  thumbnailImg: { width: '100%', height: '100%' },
  thumbnailPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  paidBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  paidText: { fontSize: 11, color: Colors.text.inverse, fontWeight: '600' },
  info: { padding: Spacing.sm, gap: 6 },
  name: { ...Typography.body, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  instructorName: { fontSize: 12, color: Colors.text.secondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.text.disabled },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.text.disabled },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const iconScale = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateIcon = (toOpen: boolean) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, damping: 8, stiffness: 300, useNativeDriver: true }),
      ]),
      Animated.timing(iconRotate, { toValue: toOpen ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    animateIcon(true);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, damping: 18, stiffness: 200, mass: 0.9, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    animateIcon(false);
    Animated.parallel([
      Animated.spring(translateX, { toValue: -DRAWER_WIDTH, damping: 18, stiffness: 200, mass: 0.9, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const toggleDrawer = () => {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  };

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.burgerBtn} activeOpacity={0.8}>
          <Animated.View style={{
            transform: [
              { scale: iconScale },
              { rotate: iconRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
            ],
          }}>
            <Ionicons
              name={drawerOpen ? 'close' : 'menu'}
              size={24}
              color={Colors.text.primary}
            />
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>Добро пожаловать 👋</Text>
          <Text style={styles.headerTitle}>Найдите курс</Text>
        </View>
        <Avatar uri={currentUser.avatar} name={currentUser.name} size={38} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.text.disabled} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск курсов..."
              placeholderTextColor={Colors.text.disabled}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.text.disabled} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        {!search && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Популярное</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
              {filtered.map((c) => (
                <View key={c.id} style={styles.featuredItem}>
                  <CourseCard classroom={c} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{search ? 'Результаты поиска' : 'Все курсы'}</Text>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Colors.text.disabled} />
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((c) => (
                <CourseCard key={c.id} classroom={c} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Drawer overlay — последний элемент, чтобы быть поверх всего */}
      <View style={StyleSheet.absoluteFill} pointerEvents={drawerOpen ? 'box-none' : 'none'}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
          </Animated.View>
          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Мои сообщества</Text>
              <Text style={styles.drawerCount}>{myCommunities.length}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {myCommunities.length === 0 ? (
                <View style={styles.drawerEmpty}>
                  <Ionicons name="people-outline" size={32} color={Colors.text.disabled} />
                  <Text style={styles.drawerEmptyText}>Вы не вступили ни в одно сообщество</Text>
                </View>
              ) : (
                myCommunities.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.communityRow}
                    activeOpacity={0.65}
                    onPress={() => { closeDrawer(); router.push(`/community/${c.id}` as any); }}
                  >
                    <Avatar uri={c.avatar} name={c.name} size={40} />
                    <View style={styles.communityInfo}>
                      <Text style={styles.communityName}>{c.name}</Text>
                      <Text style={styles.communityMembers}>{c.membersCount.toLocaleString()} участников</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={Colors.text.disabled} />
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                style={styles.drawerFooterBtn}
                activeOpacity={0.7}
                onPress={() => { closeDrawer(); router.push('/communities' as any); }}
              >
                <Ionicons name="compass-outline" size={16} color={Colors.primary} />
                <Text style={styles.drawerFooterText}>Обзор сообществ</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
      </View>
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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  burgerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 12, color: Colors.text.secondary },
  headerTitle: { ...Typography.h2, color: Colors.text.primary, marginTop: 2 },

  // Drawer
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: { ...Typography.h3, color: Colors.text.primary, flex: 1 },
  drawerCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  communityInfo: { flex: 1 },
  communityName: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  communityMembers: { fontSize: 11, color: Colors.text.disabled, marginTop: 1 },
  drawerEmpty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  drawerEmptyText: { ...Typography.caption, color: Colors.text.secondary, textAlign: 'center' },
  drawerFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginTop: 4,
  },
  drawerFooterText: { ...Typography.body, color: Colors.primary, fontWeight: '500' },
  searchWrap: { padding: Spacing.md, paddingBottom: Spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text.primary, padding: 0 },
  categories: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },
  catTextActive: { color: Colors.text.inverse },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.sm },
  featuredList: { gap: Spacing.sm },
  featuredItem: { width: 240 },
  grid: { gap: Spacing.sm },
  empty: { alignItems: 'center', paddingVertical: 48, gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.text.secondary },
});
