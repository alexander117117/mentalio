import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Modal, Animated, TextInput, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, Camera, Book, Users, Plus, PlusCircle, PlayCircle, Paperclip, CheckCircle, CaretRight, ChatsCircle, Warning, Trash } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useClassroomStore } from '../../../src/store/classroomStore';
import { useChatStore } from '../../../src/store/chatStore';
import { COURSE_TAGS } from '../../../src/constants/tags';
import { tapLight } from '../../../src/utils/haptics';
import * as ImagePicker from 'expo-image-picker';

export default function ClassroomManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classrooms = useClassroomStore((s) => s.classrooms);
  const courses = useClassroomStore((s) => s.courses);
  const lessons = useClassroomStore((s) => s.lessons);
  const fetchCourses = useClassroomStore((s) => s.fetchCourses);
  const fetchLessons = useClassroomStore((s) => s.fetchLessons);
  const addCourse = useClassroomStore((s) => s.addCourse);
  const deleteClassroom = useClassroomStore((s) => s.deleteClassroom);
  const updateClassroomThumbnail = useClassroomStore((s) => s.updateClassroomThumbnail);
  const updateClassroomTags = useClassroomStore((s) => s.updateClassroomTags);
  const chats = useChatStore((s) => s.chats);
  const fetchChats = useChatStore((s) => s.fetchChats);
  const createChat = useChatStore((s) => s.createChat);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [localTags, setLocalTags] = useState<string[] | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [chatFormVisible, setChatFormVisible] = useState(false);
  const [chatFormName, setChatFormName] = useState('');
  const [chatFormDesc, setChatFormDesc] = useState('');

  const chatFormScale = useRef(new Animated.Value(0.88)).current;
  const chatFormOpacity = useRef(new Animated.Value(0)).current;

  const classroomChat = chats.find((c) => c.classroomId === id);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const classroom = classrooms.find((c) => c.id === id);
  const myCourses = courses.filter((c) => c.classroomId === id);
  const myLessons = lessons
    .filter((l) => myCourses.some((c) => c.id === l.courseId))
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!id) return;
    fetchCourses(id).then(() => {
      const coursesForClass = useClassroomStore.getState().courses.filter((c) => c.classroomId === id);
      coursesForClass.forEach((c) => fetchLessons(c.id));
    });
    fetchChats();
  }, [id]);

  const showChatForm = () => {
    setChatFormName(classroom?.name ?? '');
    setChatFormDesc('');
    setChatFormVisible(true);
    Animated.parallel([
      Animated.spring(chatFormScale, { toValue: 1, damping: 18, stiffness: 260, useNativeDriver: true }),
      Animated.timing(chatFormOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const hideChatForm = () => {
    Animated.parallel([
      Animated.timing(chatFormScale, { toValue: 0.88, duration: 150, useNativeDriver: true }),
      Animated.timing(chatFormOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setChatFormVisible(false));
  };

  const handleCreateChat = async () => {
    if (!chatFormName.trim()) return;
    hideChatForm();
    setCreatingChat(true);
    try {
      const chatId = await createChat(chatFormName.trim(), chatFormDesc.trim() || undefined, id);
      router.push(`/chat/${chatId}` as any);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось создать чат');
    } finally {
      setCreatingChat(false);
    }
  };

  const handlePickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploadingThumb(true);
    try {
      await updateClassroomThumbnail(id!, result.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message ?? 'Не удалось загрузить обложку');
    } finally {
      setUploadingThumb(false);
    }
  };

  const activeTags = localTags ?? classroom?.tags ?? [];

  const toggleTag = async (tagId: string) => {
    tapLight();
    const next = activeTags.includes(tagId)
      ? activeTags.filter((t) => t !== tagId)
      : [...activeTags, tagId];
    setLocalTags(next);
    setSavingTags(true);
    try {
      await updateClassroomTags(id!, next);
    } catch {
      setLocalTags(activeTags); // rollback
    } finally {
      setSavingTags(false);
    }
  };

  const getOrCreateCourse = async (): Promise<string> => {
    if (myCourses.length > 0) return myCourses[0].id;
    return addCourse({ classroomId: id!, title: classroom?.name ?? 'Основной', description: '' });
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

  const showConfirm = () => {
    setConfirmVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, damping: 18, stiffness: 260, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const hideConfirm = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setConfirmVisible(false));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClassroom(id!);
      hideConfirm();
      router.replace('/(tabs)/' as any);
    } catch {
      setDeleting(false);
      Alert.alert('Ошибка', 'Не удалось удалить курс');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{classroom.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <TouchableOpacity
          style={styles.thumbWrap}
          onPress={handlePickThumbnail}
          activeOpacity={0.8}
          disabled={uploadingThumb}
        >
          {classroom.thumbnail ? (
            <Image source={{ uri: classroom.thumbnail }} style={styles.thumbImg} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <ImageIcon size={32} color={Colors.text.disabled} weight="regular" />
            </View>
          )}
          <View style={styles.thumbOverlay}>
            {uploadingThumb ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.thumbBtn}>
                <Camera size={15} color="#fff" weight="fill" />
                <Text style={styles.thumbBtnText}>Изменить обложку</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoStat}>
              <Book size={15} color={Colors.primary} weight="regular" />
              <Text style={styles.infoStatText}>{myLessons.length} уроков</Text>
            </View>
            <View style={styles.infoStat}>
              <Users size={15} color={Colors.primary} weight="regular" />
              <Text style={styles.infoStatText}>{classroom.studentsCount} студентов</Text>
            </View>
          </View>
          {classroom.description ? (
            <Text style={styles.infoDesc}>{classroom.description}</Text>
          ) : null}
        </View>

        {/* Tags section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Категории</Text>
            {savingTags && <ActivityIndicator size="small" color={Colors.text.disabled} />}
          </View>
          <View style={styles.tagsGrid}>
            {COURSE_TAGS.map((tag) => {
              const selected = activeTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    { borderColor: selected ? tag.color : Colors.border },
                    selected && { backgroundColor: tag.background },
                  ]}
                  onPress={() => toggleTag(tag.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text style={[styles.tagLabel, selected && { color: tag.color, fontWeight: '700' }]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Lessons section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Уроки</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddLesson} disabled={loading} activeOpacity={0.7}>
              {loading
                ? <ActivityIndicator size="small" color={Colors.text.primary} />
                : <Plus size={16} color={Colors.text.primary} weight="bold" />
              }
              <Text style={styles.addBtnText}>Добавить</Text>
            </TouchableOpacity>
          </View>

          {myLessons.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={handleAddLesson} disabled={loading} activeOpacity={0.7}>
              <PlusCircle size={36} color={Colors.text.disabled} weight="regular" />
              <Text style={styles.emptyTitle}>Добавьте первый урок</Text>
              <Text style={styles.emptySubtitle}>Добавьте видео, материалы и тест</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lessonCards}>
              {myLessons.map((lesson, index) => {
                const courseId = myCourses.find((c) => c.id === lesson.courseId)?.id ?? myCourses[0]?.id;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonCard}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/classroom/${id}/lesson/create?courseId=${courseId}&lessonId=${lesson.id}` as any)}
                  >
                    {/* Number */}
                    <View style={styles.lessonNum}>
                      <Text style={styles.lessonNumText}>{index + 1}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.lessonBody}>
                      <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                      <View style={styles.lessonBadges}>
                        {lesson.videoUrl && (
                          <View style={styles.badge}>
                            <PlayCircle size={11} color={Colors.primary} weight="regular" />
                            <Text style={[styles.badgeText, { color: Colors.primary }]}>Видео</Text>
                          </View>
                        )}
                        {lesson.materials.length > 0 && (
                          <View style={styles.badge}>
                            <Paperclip size={11} color={Colors.text.secondary} weight="regular" />
                            <Text style={styles.badgeText}>{lesson.materials.length} файлов</Text>
                          </View>
                        )}
                        {lesson.quiz && (
                          <View style={styles.badge}>
                            <CheckCircle size={11} color={Colors.text.secondary} weight="regular" />
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

                    <CaretRight size={16} color={Colors.text.disabled} weight="regular" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Chat section */}
        <View style={styles.section}>
          {classroomChat ? (
            <TouchableOpacity
              style={styles.chatBtn}
              activeOpacity={0.75}
              onPress={() => router.push(`/chat/${classroomChat.id}` as any)}
            >
              <View style={styles.chatBtnIcon}>
                <ChatsCircle size={18} color={Colors.primary} weight="regular" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chatBtnTitle}>Чат курса</Text>
                <Text style={styles.chatBtnSub}>Открыть чат со студентами</Text>
              </View>
              <CaretRight size={16} color={Colors.text.disabled} weight="regular" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.chatBtn}
              activeOpacity={0.75}
              onPress={showChatForm}
              disabled={creatingChat}
            >
              <View style={styles.chatBtnIcon}>
                <PlusCircle size={18} color={Colors.primary} weight="regular" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chatBtnTitle}>Создать чат</Text>
                <Text style={styles.chatBtnSub}>Чат для общения со студентами</Text>
              </View>
              {creatingChat
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <CaretRight size={16} color={Colors.text.disabled} weight="regular" />
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteBtn} onPress={showConfirm} activeOpacity={0.75}>
            <Trash size={18} color={Colors.error} weight="regular" />
            <Text style={styles.deleteBtnText}>Удалить курс</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Chat form modal */}
      <Modal visible={chatFormVisible} transparent animationType="none" onRequestClose={hideChatForm}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View style={[styles.modalBackdrop, { opacity: chatFormOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={hideChatForm} />
            <Animated.View style={[styles.modalCard, { transform: [{ scale: chatFormScale }], opacity: chatFormOpacity }]}>
              <Text style={styles.chatFormTitle}>Новый чат</Text>
              <Text style={styles.chatFormSub}>Название и описание для чата курса</Text>

              <View style={styles.chatFormField}>
                <Text style={styles.chatFormLabel}>Название</Text>
                <TextInput
                  style={styles.chatFormInput}
                  value={chatFormName}
                  onChangeText={setChatFormName}
                  placeholder="Название чата"
                  placeholderTextColor={Colors.text.disabled}
                  autoFocus
                />
              </View>

              <View style={styles.chatFormField}>
                <Text style={styles.chatFormLabel}>Описание (необязательно)</Text>
                <TextInput
                  style={[styles.chatFormInput, styles.chatFormTextarea]}
                  value={chatFormDesc}
                  onChangeText={setChatFormDesc}
                  placeholder="О чём этот чат?"
                  placeholderTextColor={Colors.text.disabled}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={hideChatForm} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: Colors.primary }, !chatFormName.trim() && { opacity: 0.4 }]}
                  onPress={handleCreateChat}
                  activeOpacity={0.75}
                  disabled={!chatFormName.trim()}
                >
                  <Text style={styles.confirmText}>Создать</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmation modal */}
      <Modal visible={confirmVisible} transparent animationType="none" onRequestClose={hideConfirm}>
        <Animated.View style={[styles.modalBackdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={hideConfirm} />
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            <View style={styles.warningTag}>
              <Warning size={13} color={Colors.error} weight="regular" />
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

  // Thumbnail
  thumbWrap: {
    height: 180,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  thumbBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  infoRow: { flexDirection: 'row', gap: Spacing.lg },
  infoStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoStatText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },
  infoDesc: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },

  emptyCard: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  emptyTitle: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  emptySubtitle: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },

  // Lesson cards
  lessonCards: { gap: Spacing.sm },
  lessonCard: {
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
  lessonNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lessonNumText: { fontSize: 14, fontWeight: '700', color: Colors.text.secondary },
  lessonBody: { flex: 1, gap: 5 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, lineHeight: 20 },
  lessonBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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

  // Tags
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagEmoji: { fontSize: 14 },
  tagLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary },

  // Chat button
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
    backgroundColor: `${Colors.primary}08`,
  },
  chatBtnIcon: {
    width: 36, height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  chatBtnTitle: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  chatBtnSub: { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },

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
  warningText: { fontSize: 13, fontWeight: '700', color: Colors.error },
  modalDesc: { fontSize: 14, color: Colors.text.secondary, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
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

  // Chat form
  chatFormTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  chatFormSub: { fontSize: 13, color: Colors.text.secondary, marginTop: 2, marginBottom: 4 },
  chatFormField: { gap: 6 },
  chatFormLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  chatFormInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
  },
  chatFormTextarea: { minHeight: 72, textAlignVertical: 'top', paddingTop: 10 },
});
