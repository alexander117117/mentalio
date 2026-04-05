import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  Modal, Animated, Image, Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, GraduationCap, Plus, MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { COURSE_TAGS } from '../../src/constants/tags';
import ClassroomCard from '../../src/components/common/ClassroomCard';
import { useClassroomStore } from '../../src/store/classroomStore';

type Segment = 'mine' | 'discover';

// Попробуем загрузить иллюстрацию — если файла нет, покажем заглушку
let illustration: number | null = null;
try {
  illustration = require('../../assets/images/classroom-illustration.png');
} catch {}

const SHEET_HEIGHT = 480;

function CreateClassroomModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // небольшая задержка чтобы компонент успел отрендериться
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            damping: 16,
            stiffness: 200,
            mass: 0.8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[modalStyles.backdrop, { opacity }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[modalStyles.sheet, { transform: [{ translateY }] }]}>
        {/* Close button */}
        <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
          <X size={20} color={Colors.text.secondary} weight="regular" />
        </TouchableOpacity>

        {/* Illustration */}
        <View style={modalStyles.illustrationWrap}>
          {illustration ? (
            <Image source={illustration} style={modalStyles.illustration} resizeMode="contain" />
          ) : (
            <View style={modalStyles.illustrationPlaceholder}>
              <GraduationCap size={72} color={Colors.text.disabled} weight="regular" />
            </View>
          )}
        </View>

        {/* Text */}
        <Text style={modalStyles.title}>Создайте классную комнату</Text>
        <Text style={modalStyles.subtitle}>
          Добавляйте курсы, уроки, материалы и тесты. Принимайте студентов бесплатно или платно.
        </Text>

        {/* CTA */}
        <TouchableOpacity
          style={modalStyles.createBtn}
          onPress={() => {
            onClose();
            setTimeout(() => router.push('/classroom/create' as any), 250);
          }}
          activeOpacity={0.85}
        >
          <Plus size={20} color={Colors.text.inverse} weight="bold" />
          <Text style={modalStyles.createBtnText}>Создать классную комнату</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 44,
    paddingTop: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    width: 200,
    height: 180,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  illustrationPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  createBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ClassroomsScreen() {
  const classrooms = useClassroomStore((s) => s.classrooms);
  const fetchClassrooms = useClassroomStore((s) => s.fetchClassrooms);
  const [segment, setSegment] = useState<Segment>('mine');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(useCallback(() => { fetchClassrooms(); }, []));

  const data = classrooms.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesSegment = segment === 'mine' ? c.isEnrolled : c.isPublic;
    const matchesTag = activeTag ? (c.tags ?? []).includes(activeTag) : true;
    return matchesSearch && matchesSegment && matchesTag;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Классные комнаты</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color={Colors.text.primary} weight="bold" />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentBar}>
        {([['mine', 'Мои'], ['discover', 'Обзор']] as [Segment, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.segmentBtn, segment === key && styles.segmentActive]}
            onPress={() => setSegment(key)}
          >
            <Text style={[styles.segmentText, segment === key && styles.segmentTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <MagnifyingGlass size={16} color={Colors.text.disabled} weight="regular" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          placeholderTextColor={Colors.text.disabled}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tag filter strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagStrip}
        style={styles.tagStripWrap}
      >
        <TouchableOpacity
          style={[styles.tagFilterChip, activeTag === null && styles.tagFilterChipActive]}
          onPress={() => setActiveTag(null)}
        >
          <Text style={[styles.tagFilterText, activeTag === null && styles.tagFilterTextActive]}>
            Все
          </Text>
        </TouchableOpacity>
        {COURSE_TAGS.map((tag) => {
          const isActive = activeTag === tag.id;
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagFilterChip,
                isActive && { backgroundColor: tag.background, borderColor: tag.color },
              ]}
              onPress={() => setActiveTag(isActive ? null : tag.id)}
            >
              <Text style={styles.tagFilterEmoji}>{tag.emoji}</Text>
              <Text style={[styles.tagFilterText, isActive && { color: tag.color, fontWeight: '700' }]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ClassroomCard classroom={item} />
          </View>
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            {segment === 'mine' ? (
              <>
                <Image
                  source={require('../../assets/images/empty-courses.png')}
                  style={styles.emptyIllustration}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitle}>Нет курсов</Text>
                <Text style={styles.emptyText}>
                  Создайте первый курс и начните обучать студентов
                </Text>
              </>
            ) : (
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            )}
          </View>
        }
      />

      <CreateClassroomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  segmentTextActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    padding: 0,
  },
  list: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  emptyIllustration: { width: 200, height: 200, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Tag filter strip
  tagStripWrap: { maxHeight: 44 },
  tagStrip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagFilterChipActive: {
    backgroundColor: Colors.surfaceSecondary,
    borderColor: Colors.text.primary,
  },
  tagFilterEmoji: { fontSize: 13 },
  tagFilterText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },
  tagFilterTextActive: { color: Colors.text.primary, fontWeight: '700' },
});
