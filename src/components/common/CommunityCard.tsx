import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Community } from '../../types';
import Avatar from '../ui/Avatar';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface Props {
  community: Community;
}

export default function CommunityCard({ community }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/community/${community.id}` as any)}
      activeOpacity={0.6}
    >
      <Avatar uri={community.avatar} name={community.name} size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{community.name}</Text>
          {community.isPrivate && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Закрытое</Text>
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={1}>{community.description}</Text>
        <Text style={styles.members}>{community.membersCount.toLocaleString()} участников</Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  description: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  members: {
    ...Typography.small,
    color: Colors.text.disabled,
    marginTop: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  arrow: {
    paddingLeft: Spacing.sm,
  },
  arrowText: {
    fontSize: 20,
    color: Colors.text.disabled,
  },
});
