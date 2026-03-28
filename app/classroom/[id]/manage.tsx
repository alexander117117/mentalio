import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants/theme';
import { useClassroomStore } from '../../../src/store/classroomStore';

export default function ClassroomManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const addCourse = useClassroomStore((s) => s.addCourse);

  const classroom = classrooms.find((c) => c.id === id);
  const myCourses = courses.filter((c) => c.classroomId === id);

  const [modalVisible, setModalVisible] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  const handleAddCourse = async () => {
    if (!courseTitle.trim()) return;
    await addCourse({ classroomId: id!, title: courseTitle.trim(), description: courseDesc.trim() });
    setCourseTitle('');
    setCourseDesc('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{classroom.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Classroom info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{myCourses.length} курсов</Text>
            <Ionicons name="people-outline" size={16} color={Colors.text.secondary} style={{ marginLeft: Spacing.md }} />
            <Text style={styles.infoText}>{classroom.studentsCount} студентов</Text>
          </View>
          <Text style={styles.infoDesc}>{classroom.description}</Text>
        </View>

        {/* Section: Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Курсы</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={18} color={Colors.text.primary} />
              <Text style={styles.addBtnText}>Добавить курс</Text>
            </TouchableOpacity>
          </View>

          {myCourses.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.emptyTitle}>Добавьте первый курс</Text>
              <Text style={styles.emptySubtitle}>Курс — это раздел или модуль вашей классной комнаты</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.courseList}>
              {myCourses.map((course, index) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/classroom/${id}/course/${course.id}/manage` as any)}
                >
                  <View style={styles.courseIndex}>
                    <Text style={styles.courseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseMeta}>
                      {course.lessonsCount} {course.lessonsCount === 1 ? 'урок' : 'уроков'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.text.disabled} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal: add course */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Новый курс</Text>

          <Text style={styles.inputLabel}>Название</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Например: Основы React Native"
            placeholderTextColor={Colors.text.disabled}
            value={courseTitle}
            onChangeText={setCourseTitle}
            autoFocus
          />

          <Text style={styles.inputLabel}>Описание (опционально)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Что студенты узнают в этом курсе?"
            placeholderTextColor={Colors.text.disabled}
            value={courseDesc}
            onChangeText={setCourseDesc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.createBtn, !courseTitle.trim() && styles.createBtnDisabled]}
            onPress={handleAddCourse}
            disabled={!courseTitle.trim()}
          >
            <Text style={styles.createBtnText}>Создать курс</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </Modal>
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
  courseList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  courseIndex: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIndexText: { ...Typography.caption, fontWeight: '700', color: Colors.text.primary },
  courseInfo: { flex: 1 },
  courseTitle: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },
  courseMeta: { ...Typography.caption, color: Colors.text.secondary, marginTop: 2 },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.xs },
  inputLabel: { ...Typography.caption, fontWeight: '600', color: Colors.text.secondary },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { ...Typography.body, fontWeight: '600', color: Colors.text.inverse },
});
