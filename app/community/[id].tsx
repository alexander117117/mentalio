import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import PostCard from '../../src/components/common/PostCard';
import Button from '../../src/components/ui/Button';
import Avatar from '../../src/components/ui/Avatar';
import { MOCK_COMMUNITIES, MOCK_POSTS } from '../../src/utils/mockData';
import { Post } from '../../src/types';

function FeedTab({ posts, onLike }: { posts: Post[]; onLike: (id: string) => void }) {
  const feedPosts = posts.filter((p) => p.type === 'feed');
  return (
    <FlatList
      data={feedPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} onLike={onLike} />}
      contentContainerStyle={{ padding: Spacing.md }}
      ListEmptyComponent={
        <View style={styles.emptyTab}>
          <Text style={styles.emptyText}>Нет публикаций</Text>
        </View>
      }
    />
  );
}

function ForumTab({ posts, onLike }: { posts: Post[]; onLike: (id: string) => void }) {
  const forumPosts = posts.filter((p) => p.type === 'forum');
  return (
    <FlatList
      data={forumPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} onLike={onLike} />}
      contentContainerStyle={{ padding: Spacing.md }}
      ListEmptyComponent={
        <View style={styles.emptyTab}>
          <Text style={styles.emptyText}>Нет тем</Text>
        </View>
      }
    />
  );
}

const TABS = ['Лента', 'Форум'];

export default function CommunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const community = MOCK_COMMUNITIES.find((c) => c.id === id) ?? MOCK_COMMUNITIES[0];
  const [posts, setPosts] = useState(MOCK_POSTS.filter((p) => p.communityId === (id ?? '1')));
  const [isMember, setIsMember] = useState(community.isMember ?? false);
  const [activeTab, setActiveTab] = useState(0);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/community/${id}/create-post` as any)}>
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.coverSection}>
        {community.banner ? (
          <Image source={{ uri: community.banner }} style={styles.banner} />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}
        <View style={styles.communityInfo}>
          <Avatar uri={community.avatar} name={community.name} size={64} />
          <View style={styles.meta}>
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.membersText}>{community.membersCount.toLocaleString()} участников</Text>
          </View>
          <Button
            title={isMember ? 'Выйти' : 'Вступить'}
            variant={isMember ? 'secondary' : 'primary'}
            onPress={() => setIsMember(!isMember)}
            style={styles.joinBtn}
          />
        </View>
        <Text style={styles.description}>{community.description}</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>{tab}</Text>
            {activeTab === i && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 0
          ? <FeedTab posts={posts} onLike={handleLike} />
          : <ForumTab posts={posts} onLike={handleLike} />
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  coverSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  banner: {
    width: '100%',
    height: 100,
    backgroundColor: `${Colors.primary}20`,
  },
  bannerPlaceholder: {
    height: 80,
    backgroundColor: `${Colors.primary}20`,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  meta: {
    flex: 1,
  },
  communityName: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  membersText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  joinBtn: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  tabContent: {
    flex: 1,
  },
  emptyTab: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
