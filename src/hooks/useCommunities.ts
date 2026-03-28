import { useQuery } from '@tanstack/react-query';
import { communityService } from '../services/communityService';

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: communityService.getAll,
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ['community', id],
    queryFn: () => communityService.getById(id),
    enabled: !!id,
  });
}

export function useCommunityPosts(communityId: string, type: 'forum' | 'feed') {
  return useQuery({
    queryKey: ['posts', communityId, type],
    queryFn: () => communityService.getPosts(communityId, type),
    enabled: !!communityId,
  });
}
