import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, VideoCameraSlash, Clock, CheckCircle, X } from 'phosphor-react-native';
import * as Linking from 'expo-linking';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, BorderRadius } from '../../../../src/constants/theme';
import MaterialItem from '../../../../src/components/common/MaterialItem';
import Button from '../../../../src/components/ui/Button';
import { useClassroomStore } from '../../../../src/store/classroomStore';
import { QuizQuestion } from '../../../../src/types';

const isExternalLink = (url: string) =>
  /youtube\.com|youtu\.be|vimeo\.com/i.test(url);

export default function LessonScreen() {
  const { id, lessonId } = useLocalSearchParams<{ id: string; lessonId: string }>();
  const lessons = useClassroomStore((s) => s.lessons);
  const markLessonCompleted = useClassroomStore((s) => s.markLessonCompleted);

  const lesson = lessons.find((l) => l.id === lessonId);

  // Inline player — только для прямых ссылок (не YouTube/Vimeo)
  const inlineVideoUrl =
    lesson?.videoUrl && !isExternalLink(lesson.videoUrl) ? lesson.videoUrl : null;
  const player = useVideoPlayer(inlineVideoUrl, (p) => {
    p.loop = false;
  });

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [marking, setMarking] = useState(false);

  // If lesson not in store yet (direct navigation), fetch via courseId
  useEffect(() => {
    if (!lesson) return;
    if (lesson.quiz) {
      // Init selected answers map
      const init: Record<string, string[]> = {};
      lesson.quiz.questions.forEach((q) => { init[q.id] = []; });
      setSelectedAnswers(init);
    }
  }, [lesson?.id]);

  const openVideo = () => {
    if (!lesson?.videoUrl) return;
    Linking.openURL(lesson.videoUrl).catch(() =>
      Alert.alert('Ошибка', 'Не удалось открыть видео.')
    );
  };

  const toggleAnswer = (question: QuizQuestion, optionId: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (question.type === 'single') {
        return { ...prev, [question.id]: [optionId] };
      }
      // multiple
      if (current.includes(optionId)) {
        return { ...prev, [question.id]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [question.id]: [...current, optionId] };
    });
  };

  const submitQuiz = () => {
    if (!lesson?.quiz) return;
    let correct = 0;
    for (const q of lesson.quiz.questions) {
      const selected = selectedAnswers[q.id] ?? [];
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        selected.length === correctIds.length &&
        correctIds.every((cid) => selected.includes(cid));
      if (isCorrect) correct++;
    }
    setQuizScore({ correct, total: lesson.quiz.questions.length });
    setQuizSubmitted(true);
  };

  const handleMarkCompleted = async () => {
    if (!lessonId) return;
    setMarking(true);
    try {
      await markLessonCompleted(lessonId);
    } catch {
      Alert.alert('Ошибка', 'Не удалось отметить урок.');
    } finally {
      setMarking(false);
    }
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} weight="regular" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const minutes = Math.floor(lesson.duration / 60);
  const seconds = lesson.duration % 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Video */}
      {lesson.videoUrl && inlineVideoUrl ? (
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen
          allowsPictureInPicture
        />
      ) : lesson.videoUrl && isExternalLink(lesson.videoUrl) ? (
        <TouchableOpacity style={styles.videoCard} activeOpacity={0.85} onPress={openVideo}>
          <View style={styles.playBtn}>
            <Play size={32} color={Colors.text.inverse} weight="fill" />
          </View>
          <Text style={styles.videoLabel}>Смотреть видео</Text>
          <Text style={styles.videoSub}>Откроется в YouTube / Vimeo</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.videoCard, styles.videoCardEmpty]}>
          <VideoCameraSlash size={32} color={Colors.text.disabled} weight="regular" />
          <Text style={[styles.videoSub, { color: Colors.text.disabled }]}>Видео не добавлено</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson info */}
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.lessonMeta}>
            {lesson.duration > 0 && (
              <View style={styles.metaItem}>
                <Clock size={14} color={Colors.text.disabled} weight="regular" />
                <Text style={styles.metaText}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
              </View>
            )}
            {lesson.isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle size={14} color={Colors.success} weight="fill" />
                <Text style={styles.completedText}>Пройден</Text>
              </View>
            )}
          </View>
        </View>

        {/* Materials */}
        {lesson.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Материалы урока</Text>
            {lesson.materials.map((m) => (
              <MaterialItem key={m.id} material={m} />
            ))}
          </View>
        )}

        {/* Quiz */}
        {lesson.quiz && lesson.quiz.questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Тест</Text>

            {quizSubmitted && quizScore && (
              <View style={[
                styles.quizResult,
                quizScore.correct === quizScore.total ? styles.quizResultPass : styles.quizResultFail,
              ]}>
                {quizScore.correct === quizScore.total
                  ? <CheckCircle size={20} color={Colors.success} weight="fill" />
                  : <X size={20} color={Colors.error} weight="bold" />
                }
                <Text style={styles.quizResultText}>
                  {quizScore.correct} из {quizScore.total} правильно
                </Text>
                <TouchableOpacity onPress={() => {
                  setQuizSubmitted(false);
                  setQuizScore(null);
                  const init: Record<string, string[]> = {};
                  lesson.quiz!.questions.forEach((q) => { init[q.id] = []; });
                  setSelectedAnswers(init);
                }}>
                  <Text style={styles.retryText}>Пройти снова</Text>
                </TouchableOpacity>
              </View>
            )}

            {lesson.quiz.questions.map((q, qi) => {
              const selected = selectedAnswers[q.id] ?? [];
              return (
                <View key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionNum}>Вопрос {qi + 1}</Text>
                  <Text style={styles.questionText}>{q.text}</Text>
                  {q.options.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    const isCorrect = opt.isCorrect;
                    let optStyle = styles.option;
                    let checkColor = Colors.text.disabled;
                    if (quizSubmitted) {
                      if (isCorrect) { optStyle = { ...styles.option, ...styles.optionCorrect }; checkColor = Colors.success; }
                      else if (isSelected && !isCorrect) { optStyle = { ...styles.option, ...styles.optionWrong }; checkColor = Colors.error; }
                    } else if (isSelected) {
                      optStyle = { ...styles.option, ...styles.optionSelected };
                      checkColor = Colors.primary;
                    }
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={optStyle}
                        activeOpacity={0.7}
                        onPress={() => toggleAnswer(q, opt.id)}
                        disabled={quizSubmitted}
                      >
                        <CheckCircle size={20} color={checkColor} weight={isSelected ? 'fill' : 'regular'} />
                        <Text style={styles.optionText}>{opt.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {!quizSubmitted && (
              <Button
                title="Проверить ответы"
                onPress={submitQuiz}
                disabled={Object.values(selectedAnswers).every((a) => a.length === 0)}
                style={{ marginTop: Spacing.sm }}
              />
            )}
          </View>
        )}

        {/* Complete button */}
        {!lesson.isCompleted && (
          <View style={styles.completeSection}>
            <Button
              title={marking ? 'Сохраняем...' : 'Отметить как пройденный'}
              onPress={handleMarkCompleted}
              disabled={marking}
              style={styles.completeBtn}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
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
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  videoCardEmpty: {
    backgroundColor: Colors.surfaceSecondary,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: { ...Typography.body, fontWeight: '600', color: '#fff' },
  videoSub: { ...Typography.caption, color: 'rgba(255,255,255,0.65)' },
  content: { flex: 1 },
  lessonInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lessonTitle: { ...Typography.h3, color: Colors.text.primary },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography.caption, color: Colors.text.secondary },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { ...Typography.caption, color: Colors.success, fontWeight: '600' },
  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Quiz
  quizResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexWrap: 'wrap',
  },
  quizResultPass: { backgroundColor: `${Colors.success}15` },
  quizResultFail: { backgroundColor: `${Colors.error}15` },
  quizResultText: { ...Typography.body, fontWeight: '600', color: Colors.text.primary, flex: 1 },
  retryText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  questionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  questionNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: { ...Typography.body, fontWeight: '500', color: Colors.text.primary, lineHeight: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  optionCorrect: { borderColor: Colors.success, backgroundColor: `${Colors.success}10` },
  optionWrong: { borderColor: Colors.error, backgroundColor: `${Colors.error}10` },
  optionText: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  completeSection: { padding: Spacing.md },
  completeBtn: {},
});
