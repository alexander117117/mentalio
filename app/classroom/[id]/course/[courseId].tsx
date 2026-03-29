import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../../../src/constants/theme';
import LessonItem from '../../../../src/components/common/LessonItem';
import { FlatList } from 'react-native';
import { useClassroomStore } from '../../../../src/store/classroomStore';

export default function CourseScreen() {
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const fetchLessons = useClassroomStore((s) => s.fetchLessons);

  const course = courses.find((c) => c.id === courseId);
  // Students see only published lessons
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course?.title ?? 'Курс'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{completed} из {courseLessons.length} уроков</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <FlatList
        data={courseLessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonItem
            lesson={item}
            onPress={() => router.push(`/classroom/${id}/lesson/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Уроки ещё не добавлены</Text>
          </View>
        }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  progressSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
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
    paddingTop: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
