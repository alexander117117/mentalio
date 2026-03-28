import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../../../src/constants/theme';
import MaterialItem from '../../../../src/components/common/MaterialItem';
import Button from '../../../../src/components/ui/Button';
import { MOCK_LESSONS } from '../../../../src/utils/mockData';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ id: string; lessonId: string }>();
  const lesson = MOCK_LESSONS.find((l) => l.id === lessonId) ?? MOCK_LESSONS[0];

  const minutes = Math.floor(lesson.duration / 60);
  const seconds = lesson.duration % 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Video placeholder — expo-video будет добавлен в dev build */}
      <View style={styles.videoPlaceholder}>
        <View style={styles.playBtn}>
          <Ionicons name="play" size={32} color={Colors.text.inverse} />
        </View>
        <Text style={styles.videoNote}>Видео доступно в полной версии приложения</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.text.disabled} />
              <Text style={styles.metaText}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
            </View>
            {lesson.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.completedText}>Пройден</Text>
              </View>
            )}
          </View>
        </View>

        {lesson.materials.length > 0 && (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionTitle}>Материалы урока</Text>
            {lesson.materials.map((m) => (
              <MaterialItem key={m.id} material={m} />
            ))}
          </View>
        )}

        {!lesson.isCompleted && (
          <Button
            title="Отметить как пройденный"
            onPress={() => router.back()}
            style={styles.completeBtn}
          />
        )}
      </ScrollView>
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
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoNote: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  lessonInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lessonTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  materialsSection: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  completeBtn: {
    margin: Spacing.md,
  },
});
