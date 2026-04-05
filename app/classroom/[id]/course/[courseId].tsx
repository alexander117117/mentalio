import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Check, Clock, PlayCircle, Paperclip, CheckCircle, CaretRight, ArrowLeft, Book } from 'phosphor-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../../../src/constants/theme';
import { useClassroomStore } from '../../../../src/store/classroomStore';
import { Lesson } from '../../../../src/types';

function LessonCard({ lesson, index, classroomId }: { lesson: Lesson; index: number; classroomId: string }) {
  const minutes = Math.floor(lesson.duration / 60);
  const seconds = lesson.duration % 60;
  const durationText = minutes > 0 ? `${minutes} мин` : `${lesson.duration} сек`;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/classroom/${classroomId}/lesson/${lesson.id}` as any)}
    >
      {/* Left: number/check circle */}
      <View style={[styles.numCircle, lesson.isCompleted && styles.numCircleDone]}>
        {lesson.isCompleted ? (
          <Check size={15} color="#fff" weight="bold" />
        ) : (
          <Text style={styles.numText}>{index + 1}</Text>
        )}
      </View>

      {/* Center: info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{lesson.title}</Text>
        <View style={styles.cardMeta}>
          {lesson.duration > 0 && (
            <View style={styles.metaItem}>
              <Clock size={12} color={Colors.text.disabled} weight="regular" />
              <Text style={styles.metaText}>{durationText}</Text>
            </View>
          )}
          {lesson.videoUrl ? (
            <View style={styles.metaItem}>
              <PlayCircle size={12} color={Colors.primary} weight="regular" />
              <Text style={[styles.metaText, { color: Colors.primary }]}>Видео</Text>
            </View>
          ) : null}
          {lesson.materials.length > 0 && (
            <View style={styles.metaItem}>
              <Paperclip size={12} color={Colors.text.disabled} weight="regular" />
              <Text style={styles.metaText}>{lesson.materials.length} файлов</Text>
            </View>
          )}
          {lesson.quiz && (
            <View style={styles.metaItem}>
              <CheckCircle size={12} color={Colors.text.disabled} weight="regular" />
              <Text style={styles.metaText}>Тест</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: arrow */}
      {lesson.isCompleted
        ? <CheckCircle size={18} color={Colors.success} weight="fill" />
        : <CaretRight size={18} color={Colors.text.disabled} weight="regular" />
      }
    </TouchableOpacity>
  );
}

export default function CourseScreen() {
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const fetchLessons = useClassroomStore((s) => s.fetchLessons);

  const course = courses.find((c) => c.id === courseId);
  const courseLessons = lessons
    .filter((l) => l.courseId === courseId && !l.isDraft)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (courseId) fetchLessons(courseId);
  }, [courseId]);

  const completed = courseLessons.filter((l) => l.isCompleted).length;
  const progress = courseLessons.length > 0 ? (completed / courseLessons.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course?.title ?? 'Курс'}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{completed} из {courseLessons.length} уроков пройдено</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
      </View>

      {/* Lesson list */}
      <FlatList
        data={courseLessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LessonCard lesson={item} index={index} classroomId={id} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Book size={40} color={Colors.text.disabled} weight="regular" />
            <Text style={styles.emptyText}>Уроки ещё не добавлены</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },

  progressSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 16,
    gap: 8,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 13, color: Colors.text.secondary },
  progressPercent: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },

  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.sm,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numCircleDone: { backgroundColor: Colors.success },
  numText: { fontSize: 14, fontWeight: '700', color: Colors.text.secondary },

  cardBody: { flex: 1, gap: 5 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.text.disabled },

  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.text.secondary },
});
