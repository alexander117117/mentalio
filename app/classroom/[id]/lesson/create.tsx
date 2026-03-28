import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Switch, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, Typography, BorderRadius } from '../../../../src/constants/theme';
import { useClassroomStore } from '../../../../src/store/classroomStore';
import { tapMedium, tapLight, notifySuccess } from '../../../../src/utils/haptics';
import { Material, QuizQuestion, QuizOption } from '../../../../src/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return String(Date.now()) + String(Math.random()).slice(2, 7);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={sectionStyles.title}>{title}</Text>;
}

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function LessonCreateScreen() {
  const { id, courseId, lessonId } = useLocalSearchParams<{
    id: string;
    courseId: string;
    lessonId?: string;
  }>();

  const addLesson = useClassroomStore((s) => s.addLesson);
  const lessons = useClassroomStore((s) => s.lessons);
  const existingLesson = lessonId ? lessons.find((l) => l.id === lessonId) : undefined;

  // Basic
  const [title, setTitle] = useState(existingLesson?.title ?? '');

  // Video
  const [videoUrl, setVideoUrl] = useState(existingLesson?.videoUrl ?? '');
  const [videoLocalUri, setVideoLocalUri] = useState(existingLesson?.videoLocalUri ?? '');
  const [videoMode, setVideoMode] = useState<'link' | 'file'>(
    existingLesson?.videoLocalUri ? 'file' : 'link'
  );

  // Materials
  const [materials, setMaterials] = useState<Material[]>(existingLesson?.materials ?? []);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');

  // Quiz
  const [quizEnabled, setQuizEnabled] = useState(!!existingLesson?.quiz);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingLesson?.quiz?.questions ?? []
  );

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'video' | 'materials' | 'quiz' | null>(null);

  // ── Video ──────────────────────────────────────────────────────────────────

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled) {
      setVideoLocalUri(result.assets[0].uri);
      setVideoUrl('');
    }
  };

  // ── Materials ──────────────────────────────────────────────────────────────

  const addLinkMaterial = () => {
    if (!materialTitle.trim() || !materialUrl.trim()) return;
    setMaterials((prev) => [...prev, { id: uid(), title: materialTitle.trim(), type: 'link', url: materialUrl.trim() }]);
    setMaterialTitle('');
    setMaterialUrl('');
    setMaterialModalVisible(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = (asset.name ?? '').split('.').pop()?.toLowerCase();
      const type = ext === 'pdf' ? 'pdf' : 'file';
      setMaterials((prev) => [...prev, { id: uid(), title: asset.name ?? 'Файл', type, url: asset.uri }]);
    }
  };

  const removeMaterial = (matId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== matId));
  };

  // ── Quiz ───────────────────────────────────────────────────────────────────

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: uid(),
      text: '',
      type: 'single',
      options: [
        { id: uid(), text: '', isCorrect: false },
        { id: uid(), text: '', isCorrect: false },
      ],
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (qId: string, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, ...patch } : q)));
  };

  const addOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { id: uid(), text: '', isCorrect: false }] }
          : q
      )
    );
  };

  const updateOption = (qId: string, optId: string, patch: Partial<QuizOption>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        let options = q.options.map((o) => (o.id === optId ? { ...o, ...patch } : o));
        // single-answer: сбрасываем остальные если выбран isCorrect
        if (patch.isCorrect && q.type === 'single') {
          options = options.map((o) => (o.id === optId ? o : { ...o, isCorrect: false }));
        }
        return { ...q, options };
      })
    );
  };

  const removeOption = (qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.filter((o) => o.id !== optId) }
          : q
      )
    );
  };

  const removeQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = (isDraft: boolean) => {
    if (!title.trim()) {
      Alert.alert('Укажите название урока');
      return;
    }
    isDraft ? tapLight() : tapMedium();
    setSaving(true);
    setTimeout(() => {
      addLesson({
        courseId: courseId!,
        title: title.trim(),
        videoUrl: videoMode === 'link' ? videoUrl.trim() : undefined,
        videoLocalUri: videoMode === 'file' ? videoLocalUri : undefined,
        duration: 0,
        materials,
        quiz: quizEnabled && questions.length > 0
          ? { id: uid(), lessonId: '', questions }
          : undefined,
        isDraft,
      });
      setSaving(false);
      notifySuccess();
      router.back();
    }, 500);
  };

  // ─────────────────────────────────────────────────────────────────────────

  const hasVideo = videoMode === 'link' ? videoUrl.trim().length > 0 : videoLocalUri.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingLesson ? 'Редактировать урок' : 'Новый урок'}</Text>
        <TouchableOpacity onPress={() => handleSave(true)} disabled={saving}>
          <Text style={styles.draftBtn}>Черновик</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.block}>
          <SectionHeader title="Название урока" />
          <TextInput
            style={styles.titleInput}
            placeholder="Введите название..."
            placeholderTextColor={Colors.text.disabled}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />
        </View>

        {/* ── VIDEO ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => { tapLight(); setActiveSection(activeSection === 'video' ? null : 'video'); }}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.accordionIcon, hasVideo && styles.accordionIconDone]}>
              <Ionicons name="play" size={16} color={hasVideo ? Colors.text.inverse : Colors.text.secondary} />
            </View>
            <View>
              <Text style={styles.accordionTitle}>Видео</Text>
              <Text style={styles.accordionSub}>{hasVideo ? 'Добавлено' : 'Не добавлено'}</Text>
            </View>
          </View>
          <Ionicons
            name={activeSection === 'video' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.text.disabled}
          />
        </TouchableOpacity>

        {activeSection === 'video' && (
          <View style={styles.accordionBody}>
            {/* Toggle link / file */}
            <View style={styles.segmentBar}>
              {(['link', 'file'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.segmentBtn, videoMode === mode && styles.segmentActive]}
                  onPress={() => setVideoMode(mode)}
                >
                  <Text style={[styles.segmentText, videoMode === mode && styles.segmentTextActive]}>
                    {mode === 'link' ? 'Ссылка' : 'Файл с телефона'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {videoMode === 'link' ? (
              <TextInput
                style={styles.fieldInput}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={Colors.text.disabled}
                value={videoUrl}
                onChangeText={setVideoUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickVideo}>
                <Ionicons
                  name={videoLocalUri ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={24}
                  color={videoLocalUri ? Colors.success : Colors.text.secondary}
                />
                <Text style={styles.uploadText}>
                  {videoLocalUri ? 'Видео выбрано ✓' : 'Выбрать видео из галереи'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── MATERIALS ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => { tapLight(); setActiveSection(activeSection === 'materials' ? null : 'materials'); }}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.accordionIcon, materials.length > 0 && styles.accordionIconDone]}>
              <Ionicons name="attach" size={16} color={materials.length > 0 ? Colors.text.inverse : Colors.text.secondary} />
            </View>
            <View>
              <Text style={styles.accordionTitle}>Материалы</Text>
              <Text style={styles.accordionSub}>
                {materials.length > 0 ? `${materials.length} файлов / ссылок` : 'Не добавлено'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={activeSection === 'materials' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.text.disabled}
          />
        </TouchableOpacity>

        {activeSection === 'materials' && (
          <View style={styles.accordionBody}>
            {materials.map((m) => (
              <View key={m.id} style={styles.materialRow}>
                <Ionicons
                  name={m.type === 'pdf' ? 'document-text-outline' : m.type === 'link' ? 'link-outline' : 'attach-outline'}
                  size={16}
                  color={Colors.text.secondary}
                />
                <Text style={styles.materialTitle} numberOfLines={1}>{m.title}</Text>
                <TouchableOpacity onPress={() => removeMaterial(m.id)}>
                  <Ionicons name="close-circle" size={18} color={Colors.text.disabled} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.materialActions}>
              <TouchableOpacity style={styles.materialActionBtn} onPress={() => setMaterialModalVisible(true)}>
                <Ionicons name="link-outline" size={16} color={Colors.text.primary} />
                <Text style={styles.materialActionText}>Добавить ссылку</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.materialActionBtn} onPress={pickDocument}>
                <Ionicons name="document-outline" size={16} color={Colors.text.primary} />
                <Text style={styles.materialActionText}>Прикрепить файл</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── QUIZ ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => { tapLight(); setActiveSection(activeSection === 'quiz' ? null : 'quiz'); }}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.accordionIcon, quizEnabled && styles.accordionIconDone]}>
              <Ionicons name="help-circle" size={16} color={quizEnabled ? Colors.text.inverse : Colors.text.secondary} />
            </View>
            <View>
              <Text style={styles.accordionTitle}>Тест</Text>
              <Text style={styles.accordionSub}>
                {quizEnabled ? `${questions.length} вопросов` : 'Отключён'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={activeSection === 'quiz' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.text.disabled}
          />
        </TouchableOpacity>

        {activeSection === 'quiz' && (
          <View style={styles.accordionBody}>
            <View style={styles.quizToggleRow}>
              <Text style={styles.quizToggleLabel}>Добавить тест к уроку</Text>
              <Switch
                value={quizEnabled}
                onValueChange={setQuizEnabled}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor={Colors.surface}
              />
            </View>

            {quizEnabled && (
              <>
                {questions.map((q, qi) => (
                  <View key={q.id} style={styles.questionCard}>
                    {/* Question header */}
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNum}>Вопрос {qi + 1}</Text>
                      <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>

                    {/* Question text */}
                    <TextInput
                      style={styles.questionInput}
                      placeholder="Текст вопроса..."
                      placeholderTextColor={Colors.text.disabled}
                      value={q.text}
                      onChangeText={(v) => updateQuestion(q.id, { text: v })}
                      multiline
                    />

                    {/* Single / Multiple toggle */}
                    <View style={styles.answerTypeRow}>
                      <Text style={styles.answerTypeLabel}>Тип ответа:</Text>
                      <View style={styles.segmentBar}>
                        {(['single', 'multiple'] as const).map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.segmentBtn, q.type === t && styles.segmentActive]}
                            onPress={() => updateQuestion(q.id, { type: t })}
                          >
                            <Text style={[styles.segmentText, q.type === t && styles.segmentTextActive]}>
                              {t === 'single' ? 'Один ответ' : 'Несколько'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Options */}
                    {q.options.map((opt, oi) => (
                      <View key={opt.id} style={styles.optionRow}>
                        <TouchableOpacity
                          style={styles.optionCheck}
                          onPress={() => updateOption(q.id, opt.id, { isCorrect: !opt.isCorrect })}
                        >
                          <Ionicons
                            name={
                              q.type === 'single'
                                ? opt.isCorrect ? 'radio-button-on' : 'radio-button-off'
                                : opt.isCorrect ? 'checkbox' : 'square-outline'
                            }
                            size={20}
                            color={opt.isCorrect ? Colors.success : Colors.text.disabled}
                          />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.optionInput}
                          placeholder={`Вариант ${oi + 1}`}
                          placeholderTextColor={Colors.text.disabled}
                          value={opt.text}
                          onChangeText={(v) => updateOption(q.id, opt.id, { text: v })}
                        />
                        {q.options.length > 2 && (
                          <TouchableOpacity onPress={() => removeOption(q.id, opt.id)}>
                            <Ionicons name="close" size={16} color={Colors.text.disabled} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    <TouchableOpacity style={styles.addOptionBtn} onPress={() => addOption(q.id)}>
                      <Ionicons name="add" size={16} color={Colors.text.secondary} />
                      <Text style={styles.addOptionText}>Добавить вариант</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addQuestionBtn} onPress={addQuestion}>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.text.primary} />
                  <Text style={styles.addQuestionText}>Добавить вопрос</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* ── Save buttons ───────────────────────────────────────────────── */}
        <View style={styles.saveRow}>
          <TouchableOpacity
            style={[styles.saveBtn, styles.saveBtnPrimary, !title.trim() && styles.saveBtnDisabled]}
            onPress={() => handleSave(false)}
            disabled={!title.trim() || saving}
          >
            <Text style={styles.saveBtnPrimaryText}>Опубликовать урок</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Material link modal */}
      <Modal
        visible={materialModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMaterialModalVisible(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMaterialModalVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Добавить ссылку</Text>

          <Text style={styles.inputLabel}>Название</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="Например: Презентация урока"
            placeholderTextColor={Colors.text.disabled}
            value={materialTitle}
            onChangeText={setMaterialTitle}
            autoFocus
          />

          <Text style={styles.inputLabel}>URL</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="https://..."
            placeholderTextColor={Colors.text.disabled}
            value={materialUrl}
            onChangeText={setMaterialUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.saveBtn, styles.saveBtnPrimary, (!materialTitle.trim() || !materialUrl.trim()) && styles.saveBtnDisabled]}
            onPress={addLinkMaterial}
            disabled={!materialTitle.trim() || !materialUrl.trim()}
          >
            <Text style={styles.saveBtnPrimaryText}>Добавить</Text>
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
  headerTitle: { ...Typography.h3, color: Colors.text.primary },
  draftBtn: { ...Typography.body, color: Colors.text.secondary, fontWeight: '500' },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },

  // Title block
  block: { gap: 8 },
  titleInput: {
    ...Typography.h3,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },

  // Accordion
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  accordionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionIconDone: { backgroundColor: Colors.primary },
  accordionTitle: { ...Typography.body, fontWeight: '600', color: Colors.text.primary },
  accordionSub: { ...Typography.caption, color: Colors.text.secondary, marginTop: 2 },
  accordionBody: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: -8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  // Segment
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    padding: 3,
    flex: 1,
  },
  segmentBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: BorderRadius.xs },
  segmentActive: { backgroundColor: Colors.surface },
  segmentText: { ...Typography.caption, fontWeight: '500', color: Colors.text.secondary },
  segmentTextActive: { fontWeight: '600', color: Colors.text.primary },

  // Video
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
  },
  uploadText: { ...Typography.body, color: Colors.text.secondary },

  // Materials
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  materialTitle: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  materialActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  materialActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  materialActionText: { ...Typography.caption, fontWeight: '500', color: Colors.text.primary },

  // Quiz
  quizToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizToggleLabel: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },
  questionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionNum: { ...Typography.caption, fontWeight: '700', color: Colors.text.disabled, textTransform: 'uppercase' },
  questionInput: {
    ...Typography.body,
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
    minHeight: 44,
  },
  answerTypeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  answerTypeLabel: { ...Typography.caption, color: Colors.text.secondary, width: 80 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionCheck: { padding: 2 },
  optionInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    marginTop: 4,
  },
  addOptionText: { ...Typography.caption, color: Colors.text.secondary },
  addQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  addQuestionText: { ...Typography.body, fontWeight: '500', color: Colors.text.primary },

  // Save
  saveRow: { marginTop: Spacing.sm, gap: Spacing.sm },
  saveBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnPrimaryText: { ...Typography.body, fontWeight: '600', color: Colors.text.inverse },

  // Modal
  inputLabel: { ...Typography.caption, fontWeight: '600', color: Colors.text.secondary },
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
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.xs },
});
