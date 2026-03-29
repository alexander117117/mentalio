import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import CourseCard from '../../src/components/common/CourseCard';
import Avatar from '../../src/components/ui/Avatar';
import Button from '../../src/components/ui/Button';
import { useClassroomStore } from '../../src/store/classroomStore';
import { useAuthStore } from '../../src/store/authStore';

export default function ClassroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const fetchCourses = useClassroomStore((s) => s.fetchCourses);
  const enrollClassroom = useClassroomStore((s) => s.enrollClassroom);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const classroom = classrooms.find((c) => c.id === id);
  const classroomCourses = courses.filter((c) => c.classroomId === id);

  useEffect(() => {
    if (id) fetchCourses(id);
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

        <View style={styles.coursesSection}>
          <Text style={styles.sectionTitle}>Курсы</Text>
          {classroomCourses.length > 0 ? (
            classroomCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => router.push(`/classroom/${id}/course/${course.id}` as any)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Курсы ещё не добавлены</Text>
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
  coursesSection: { padding: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { ...Typography.body, color: Colors.text.secondary },
});
