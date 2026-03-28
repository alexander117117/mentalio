import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface Props {
  lesson: Lesson;
  onPress: () => void;
}

export default function LessonItem({ lesson, onPress }: Props) {
  const minutes = Math.floor(lesson.duration / 60);
  const seconds = lesson.duration % 60;
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.number, lesson.isCompleted && styles.completed]}>
        {lesson.isCompleted ? (
          <Ionicons name="checkmark" size={14} color={Colors.surface} />
        ) : (
          <Text style={styles.numberText}>{lesson.order}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{lesson.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={Colors.text.disabled} />
          <Text style={styles.duration}>{durationText}</Text>
          {lesson.materials.length > 0 && (
            <>
              <Ionicons name="attach-outline" size={12} color={Colors.text.disabled} />
              <Text style={styles.duration}>{lesson.materials.length} материалов</Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: {
    backgroundColor: Colors.success,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
});
