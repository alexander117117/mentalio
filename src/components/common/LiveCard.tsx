import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { LiveStream } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface Props {
  stream: LiveStream;
}

export default function LiveCard({ stream }: Props) {
  const handleWatch = () => Linking.openURL(stream.streamUrl);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/live/${stream.id}` as any)}
      activeOpacity={0.7}
    >
      {stream.thumbnail ? (
        <Image source={{ uri: stream.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="radio-outline" size={32} color={Colors.text.disabled} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Badge status={stream.status} />
          {stream.viewersCount != null && stream.status === 'live' && (
            <Text style={styles.viewers}>{stream.viewersCount} зрителей</Text>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{stream.title}</Text>

        <View style={styles.hostRow}>
          <Avatar uri={stream.host.avatar} name={stream.host.name} size={22} />
          <Text style={styles.hostName}>{stream.host.name}</Text>
          <View style={styles.platformTag}>
            <Text style={styles.platformText}>{stream.platform}</Text>
          </View>
        </View>

        {stream.status !== 'ended' && (
          <TouchableOpacity style={styles.watchBtn} onPress={handleWatch}>
            <Ionicons name="arrow-up-right" size={14} color={Colors.text.inverse} />
            <Text style={styles.watchText}>Смотреть</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.surfaceSecondary,
  },
  thumbnailPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewers: {
    ...Typography.small,
    color: Colors.text.disabled,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hostName: {
    ...Typography.caption,
    color: Colors.text.secondary,
    flex: 1,
  },
  platformTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.xs,
  },
  platformText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  watchText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
