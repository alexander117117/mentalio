import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Classroom } from '../../types';
import Avatar from '../ui/Avatar';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface Props {
  classroom: Classroom;
}

export default function ClassroomCard({ classroom }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/classroom/${classroom.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnail}>
        {classroom.thumbnail ? (
          <Image source={{ uri: classroom.thumbnail }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="school-outline" size={28} color={Colors.text.disabled} />
          </View>
        )}
        {!classroom.isPublic && (
          <View style={styles.privatePill}>
            <Text style={styles.privatePillText}>Платный</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{classroom.name}</Text>

        <View style={styles.instructor}>
          <Avatar uri={classroom.instructor.avatar} name={classroom.instructor.name} size={18} />
          <Text style={styles.instructorName} numberOfLines={1}>{classroom.instructor.name}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statText}>{classroom.coursesCount} курсов</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.statText}>{classroom.studentsCount.toLocaleString()} уч.</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 110,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  privatePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  privatePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  body: {
    padding: Spacing.sm + 2,
    gap: 5,
  },
  name: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 18,
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  instructorName: {
    ...Typography.small,
    color: Colors.text.secondary,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.small,
    color: Colors.text.disabled,
  },
  dot: {
    color: Colors.text.disabled,
    fontSize: 12,
  },
});
