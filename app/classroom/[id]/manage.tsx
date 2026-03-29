import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants/theme';
import { useClassroomStore } from '../../../src/store/classroomStore';

export default function ClassroomManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const fetchCourses = useClassroomStore((s) => s.fetchCourses);
  const fetchLessons = useClassroomStore((s) => s.fetchLessons);
  const addCourse = useClassroomStore((s) => s.addCourse);
  const [loading, setLoading] = useState(false);

  const classroom = classrooms.find((c) => c.id === id);
  const myCourses = courses.filter((c) => c.classroomId === id);
  const myLessons = lessons.filter((l) => myCourses.some((c) => c.id === l.courseId))
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!id) return;
    fetchCourses(id).then(() => {
      const coursesForClass = useClassroomStore.getState().courses.filter((c) => c.classroomId === id);
      coursesForClass.forEach((c) => fetchLessons(c.id));
    });
  }, [id]);

  // Gets or creates a default course for this classroom, returns courseId
  const getOrCreateCourse = async (): Promise<string> => {
    if (myCourses.length > 0) return myCourses[0].id;
    const courseId = await addCourse({
      classroomId: id!,
      title: classroom?.name ?? 'Основной',
      description: '',
    });
    return courseId;
  };

  const handleAddLesson = async () => {
    setLoading(true);
    try {
      const courseId = await getOrCreateCourse();
      router.push(`/classroom/${id}/lesson/create?courseId=${courseId}` as any);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось открыть создание урока');
    } finally {
      setLoading(false);
    }
  };

  if (!classroom) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{classroom.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{myLessons.length} уроков</Text>
            <Ionicons name="people-outline" size={16} color={Colors.text.secondary} style={{ marginLeft: Spacing.md }} />
            <Text style={styles.infoText}>{classroom.studentsCount} студентов</Text>
          </View>
          {classroom.description ? (
            <Text style={styles.infoDesc}>{classroom.description}</Text>
          ) : null}
        </View>

        {/* Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Уроки</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddLesson} disabled={loading}>
              {loading
                ? <ActivityIndicator size="small" color={Colors.text.primary} />
                : <Ionicons name="add" size={18} color={Colors.text.primary} />
              }
              <Text style={styles.addBtnText}>Добавить урок</Text>
            </TouchableOpacity>
          </View>

          {myLessons.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={handleAddLesson} disabled={loading}>
              <Ionicons name="add-circle-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Добавьте первый урок</Text>
              <Text style={styles.emptySubtitle}>Добавьте видео, материалы и тест</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lessonList}>
              {myLessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    const courseId = myCourses.find((c) => c.id === lesson.courseId)?.id ?? myCourses[0]?.id;
                    router.push(`/classroom/${id}/lesson/create?courseId=${courseId}&lessonId=${lesson.id}` as any);
                  }}
                >
                  <View style={styles.lessonIndex}>
                    <Text style={styles.lessonIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.lessonBadges}>
                      {lesson.videoUrl && (
                        <View style={styles.badge}>
                          <Ionicons name="play-circle-outline" size={12} color={Colors.text.secondary} />
                          <Text style={styles.badgeText}>Видео</Text>
                        </View>
                      )}
                      {lesson.materials.length > 0 && (
                        <View style={styles.badge}>
                          <Ionicons name="attach-outline" size={12} color={Colors.text.secondary} />
                          <Text style={styles.badgeText}>{lesson.materials.length} файлов</Text>
                        </View>
                      )}
                      {lesson.quiz && (
                        <View style={styles.badge}>
                          <Ionicons name="checkmark-circle-outline" size={12} color={Colors.text.secondary} />
                          <Text style={styles.badgeText}>Тест</Text>
                        </View>
                      )}
                      {lesson.isDraft && (
                        <View style={[styles.badge, styles.badgeDraft]}>
                          <Text style={styles.badgeDraftText}>Черновик</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.disabled} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { ...Typography.caption, color: Colors.text.secondary },
  infoDesc: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
  },
  addBtnText: { ...Typography.caption, fontWeight: '600', color: Colors.text.primary },
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
  emptySubtitle: { ...Typography.caption, color: Colors.text.secondary, textAlign: 'center' },
  lessonList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  lessonIndex: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIndexText: { ...Typography.caption, fontWeight: '700', color: Colors.text.primary },
  lessonInfo: { flex: 1, gap: 4 },
  lessonTitle: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },
  lessonBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surfaceSecondary,
  },
  badgeText: { fontSize: 11, color: Colors.text.secondary },
  badgeDraft: { backgroundColor: Colors.warningSurface },
  badgeDraftText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },
});
