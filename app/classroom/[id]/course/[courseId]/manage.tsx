import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../../../../src/constants/theme';
import { useClassroomStore } from '../../../../../src/store/classroomStore';

export default function CourseManageScreen() {
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);

  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const courseLessons = lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoDesc}>{course.description || 'Описание не добавлено'}</Text>
          <Text style={styles.infoMeta}>{courseLessons.length} уроков</Text>
        </View>

        {/* Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Уроки</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push(`/classroom/${id}/lesson/create?courseId=${courseId}` as any)}
            >
              <Ionicons name="add" size={18} color={Colors.text.primary} />
              <Text style={styles.addBtnText}>Добавить урок</Text>
            </TouchableOpacity>
          </View>

          {courseLessons.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push(`/classroom/${id}/lesson/create?courseId=${courseId}` as any)}
            >
              <Ionicons name="add-circle-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Добавьте первый урок</Text>
              <Text style={styles.emptySubtitle}>Добавьте видео, материалы и тест</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lessonList}>
              {courseLessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/classroom/${id}/lesson/create?courseId=${courseId}&lessonId=${lesson.id}` as any)}
                >
                  <View style={styles.lessonLeft}>
                    <View style={styles.lessonIndex}>
                      <Text style={styles.lessonIndexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonBadges}>
                        {(lesson.videoUrl || lesson.videoLocalUri) && (
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
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoDesc: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
  infoMeta: { ...Typography.caption, color: Colors.text.disabled },
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.md },
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
