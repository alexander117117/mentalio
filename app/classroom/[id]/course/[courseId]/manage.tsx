import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../../../../src/constants/theme';
import { useClassroomStore } from '../../../../../src/store/classroomStore';

export default function CourseManageScreen() {
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const deleteClassroom = useClassroomStore((s) => s.deleteClassroom);

  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const courseLessons = lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showConfirm = () => {
    setConfirmVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, damping: 18, stiffness: 260, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hideConfirm = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 160, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => setConfirmVisible(false));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClassroom(id);
      hideConfirm();
      router.replace('/(tabs)/' as any);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course?.title ?? 'Курс'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoDesc}>{course?.description || 'Описание не добавлено'}</Text>
          <Text style={styles.infoMeta}>{courseLessons.length} уроков</Text>
        </View>

        {/* Lessons section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Уроки</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push(`/classroom/${id}/lesson/create?courseId=${courseId}` as any)}
            >
              <Ionicons name="add" size={16} color={Colors.text.primary} />
              <Text style={styles.addBtnText}>Добавить</Text>
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
                            <Ionicons name="play-circle-outline" size={11} color={Colors.text.secondary} />
                            <Text style={styles.badgeText}>Видео</Text>
                          </View>
                        )}
                        {lesson.materials.length > 0 && (
                          <View style={styles.badge}>
                            <Ionicons name="attach-outline" size={11} color={Colors.text.secondary} />
                            <Text style={styles.badgeText}>{lesson.materials.length} файлов</Text>
                          </View>
                        )}
                        {lesson.quiz && (
                          <View style={styles.badge}>
                            <Ionicons name="checkmark-circle-outline" size={11} color={Colors.text.secondary} />
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
                  <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteBtn} onPress={showConfirm} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteBtnText}>Удалить курс</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Confirmation modal */}
      <Modal visible={confirmVisible} transparent animationType="none" onRequestClose={hideConfirm}>
        <Animated.View style={[styles.modalBackdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={hideConfirm} />
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            {/* Red tag */}
            <View style={styles.warningTag}>
              <Ionicons name="warning-outline" size={14} color={Colors.error} />
              <Text style={styles.warningText}>Вы уверены, что хотите удалить курс?</Text>
            </View>

            <Text style={styles.modalDesc}>
              Все уроки, материалы и прогресс студентов будут удалены безвозвратно.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={hideConfirm} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                activeOpacity={0.75}
                disabled={deleting}
              >
                <Text style={styles.confirmText}>{deleting ? 'Удаление...' : 'Да, удалить'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
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

  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  infoDesc: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
  infoMeta: { fontSize: 12, color: Colors.text.disabled },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
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
  addBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },

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
  emptySubtitle: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },

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
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  lessonIndex: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIndexText: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  lessonInfo: { flex: 1, gap: 4 },
  lessonTitle: { fontSize: 14, fontWeight: '500', color: Colors.text.primary },
  lessonBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surfaceSecondary,
  },
  badgeText: { fontSize: 11, color: Colors.text.secondary },
  badgeDraft: { backgroundColor: Colors.warningSurface },
  badgeDraftText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },

  // Delete button
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
    backgroundColor: `${Colors.error}08`,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: Colors.error },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  warningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: `${Colors.error}15`,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
