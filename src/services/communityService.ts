import api from './api';
import { Community, Post } from '../types';

export const communityService = {
  getAll: async (): Promise<Community[]> => {
    const res = await api.get('/communities');
    return res.data.data;
  },

  getById: async (id: string): Promise<Community> => {
    const res = await api.get(`/communities/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Community>): Promise<Community> => {
    const res = await api.post('/communities', data);
    return res.data.data;
  },

  join: async (id: string): Promise<void> => {
    await api.post(`/communities/${id}/join`);
  },

  leave: async (id: string): Promise<void> => {
    await api.post(`/communities/${id}/leave`);
  },

  getPosts: async (communityId: string, type: 'forum' | 'feed'): Promise<Post[]> => {
    const res = await api.get(`/communities/${communityId}/posts`, { params: { type } });
    return res.data.data;
  },

  createPost: async (communityId: string, data: Partial<Post>): Promise<Post> => {
    const res = await api.post(`/communities/${communityId}/posts`, data);
    return res.data.data;
  },

  likePost: async (postId: string): Promise<void> => {
    await api.post(`/posts/${postId}/like`);
  },

  unlikePost: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/like`);
  },
};
