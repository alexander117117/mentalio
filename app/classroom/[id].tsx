import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';

export default function ClassroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const fetchCourses = useClassroomStore((s) => s.fetchCourses);
  const fetchLessons = useClassroomStore((s) => s.fetchLessons);
  const enrollClassroom = useClassroomStore((s) => s.enrollClassroom);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const classroom = classrooms.find((c) => c.id === id);
  const classroomCourses = courses.filter((c) => c.classroomId === id);
  const allLessons = lessons
    .filter((l) => classroomCourses.some((c) => c.id === l.courseId) && !l.isDraft)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!id) return;
    fetchCourses(id).then(() => {
      const updated = useClassroomStore.getState().courses.filter((c) => c.classroomId === id);
      updated.forEach((c) => fetchLessons(c.id));
    });
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Требуется аккаунт',
        'Войдите чтобы записаться на курс',
        [
          { text: 'Войти', onPress: () => router.push('/login' as any) },
          { text: 'Отмена', style: 'cancel' },
        ]
      );
      return;
    }
    try {
      await enrollClassroom(id!);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось записаться');
    }
  };

  if (!classroom) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.thumbnail}>
          {classroom.thumbnail ? (
            <Image source={{ uri: classroom.thumbnail }} style={styles.thumbnailImg} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="school-outline" size={48} color={Colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{classroom.name}</Text>
          {classroom.description ? (
            <Text style={styles.description}>{classroom.description}</Text>
          ) : null}

          <View style={styles.instructorRow}>
            <Avatar uri={classroom.instructor.avatar} name={classroom.instructor.name} size={36} />
            <View>
              <Text style={styles.instructorLabel}>Преподаватель</Text>
              <Text style={styles.instructorName}>{classroom.instructor.name}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="book-outline" size={16} color={Colors.primary} />
              <Text style={styles.statText}>{classroom.coursesCount} курсов</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={16} color={Colors.primary} />
              <Text style={styles.statText}>{classroom.studentsCount.toLocaleString()} студентов</Text>
            </View>
          </View>

          <Button
            title={classroom.isEnrolled ? 'Вы записаны' : 'Записаться'}
            variant={classroom.isEnrolled ? 'secondary' : 'primary'}
            onPress={handleEnroll}
            disabled={classroom.isEnrolled}
          />
        </View>

        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Уроки</Text>
          {allLessons.length > 0 ? (
            <View style={styles.lessonList}>
              {allLessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/classroom/${id}/lesson/${lesson.id}` as any)}
                >
                  <View style={[styles.lessonNum, lesson.isCompleted && styles.lessonNumDone]}>
                    {lesson.isCompleted
                      ? <Ionicons name="checkmark" size={15} color="#fff" />
                      : <Text style={styles.lessonNumText}>{index + 1}</Text>
                    }
                  </View>
                  <View style={styles.lessonBody}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                    <View style={styles.lessonMeta}>
                      {lesson.duration > 0 && (
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={12} color={Colors.text.disabled} />
                          <Text style={styles.metaText}>{Math.floor(lesson.duration / 60)} мин</Text>
                        </View>
                      )}
                      {lesson.videoUrl && (
                        <View style={styles.metaItem}>
                          <Ionicons name="play-circle-outline" size={12} color={Colors.primary} />
                          <Text style={[styles.metaText, { color: Colors.primary }]}>Видео</Text>
                        </View>
                      )}
                      {lesson.quiz && (
                        <View style={styles.metaItem}>
                          <Ionicons name="checkmark-circle-outline" size={12} color={Colors.text.disabled} />
                          <Text style={styles.metaText}>Тест</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={lesson.isCompleted ? 'checkmark-circle' : 'chevron-forward'}
                    size={18}
                    color={lesson.isCompleted ? Colors.success : Colors.text.disabled}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Уроки ещё не добавлены</Text>
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
  backBtn: {
    position: 'absolute',
    top: 52,
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderRadius: 99,
    padding: 6,
  },
  thumbnail: { height: 220, backgroundColor: Colors.background },
  thumbnailImg: { width: '100%', height: '100%' },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}15`,
  },
  info: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  name: { ...Typography.h2, color: Colors.text.primary },
  description: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  instructorLabel: { fontSize: 12, color: Colors.text.disabled },
  instructorName: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statText: { ...Typography.body, color: Colors.text.secondary },
  lessonsSection: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.sm },
  lessonList: { gap: Spacing.sm },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonNumDone: { backgroundColor: Colors.success },
  lessonNumText: { fontSize: 14, fontWeight: '700', color: Colors.text.secondary },
  lessonBody: { flex: 1, gap: 5 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  lessonMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.text.disabled },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { ...Typography.body, color: Colors.text.secondary },
});
