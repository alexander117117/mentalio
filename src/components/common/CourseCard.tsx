import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../types';
import Card from '../ui/Card';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface Props {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: Props) {
  const hours = Math.floor(course.duration / 60);
  const minutes = course.duration % 60;
  const durationText = hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.thumbnail}>
            {course.thumbnail ? (
              <Image source={{ uri: course.thumbnail }} style={styles.image} />
            ) : (
              <Ionicons name="play-circle-outline" size={28} color={Colors.primary} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{course.description}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="list-outline" size={13} color={Colors.text.secondary} />
                <Text style={styles.statText}>{course.lessonsCount} уроков</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={13} color={Colors.text.secondary} />
                <Text style={styles.statText}>{durationText}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
