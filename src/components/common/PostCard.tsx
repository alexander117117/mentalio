import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Post } from '../../types';
import Avatar from '../ui/Avatar';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
  onPress?: () => void;
}

export default function PostCard({ post, onLike, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.header}>
        <Avatar uri={post.author.avatar} name={post.author.name} size={32} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.date}>
            {format(new Date(post.createdAt), 'd MMM', { locale: ru })}
          </Text>
        </View>
        {post.type === 'forum' && (
          <View style={styles.forumTag}>
            <Text style={styles.forumTagText}>Форум</Text>
          </View>
        )}
      </View>

      {post.title && <Text style={styles.title}>{post.title}</Text>}
      <Text style={styles.content} numberOfLines={post.title ? 3 : 4}>
        {post.content}
      </Text>

      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.images}>
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.action}
          onPress={(e) => { e.stopPropagation?.(); onLike?.(post.id); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={post.isLiked ? Colors.error : Colors.text.disabled}
          />
          <Text style={[styles.actionText, post.isLiked && { color: Colors.error }]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <View style={styles.action}>
          <Ionicons name="chatbubble-outline" size={15} color={Colors.text.disabled} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  authorName: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  date: {
    ...Typography.small,
    color: Colors.text.disabled,
  },
  forumTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
  },
  forumTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  content: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  images: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  image: {
    width: 220,
    height: 140,
    borderRadius: 8,
    marginRight: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.text.disabled,
  },
});
