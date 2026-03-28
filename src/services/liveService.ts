import api from './api';
import { LiveStream } from '../types';

export const liveService = {
  getAll: async (): Promise<LiveStream[]> => {
    const res = await api.get('/live');
    return res.data.data;
  },

  getById: async (id: string): Promise<LiveStream> => {
    const res = await api.get(`/live/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<LiveStream>): Promise<LiveStream> => {
    const res = await api.post('/live', data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/live/${id}`);
  },
};
