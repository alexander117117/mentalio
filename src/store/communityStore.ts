import { create } from 'zustand';
import { Community, Post } from '../types';

interface CommunityStore {
  communities: Community[];
  currentCommunity: Community | null;
  currentPosts: Post[];
  setCommunities: (communities: Community[]) => void;
  setCurrentCommunity: (community: Community) => void;
  setCurrentPosts: (posts: Post[]) => void;
  toggleLike: (postId: string) => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  communities: [],
  currentCommunity: null,
  currentPosts: [],
  setCommunities: (communities) => set({ communities }),
  setCurrentCommunity: (community) => set({ currentCommunity: community }),
  setCurrentPosts: (posts) => set({ currentPosts: posts }),
  toggleLike: (postId) =>
    set((state) => ({
      currentPosts: state.currentPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      ),
    })),
}));
