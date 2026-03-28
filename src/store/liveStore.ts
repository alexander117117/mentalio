import { create } from 'zustand';
import { LiveStream } from '../types';

interface LiveStore {
  streams: LiveStream[];
  currentStream: LiveStream | null;
  filterStatus: 'all' | 'live' | 'scheduled' | 'ended';
  setStreams: (streams: LiveStream[]) => void;
  setCurrentStream: (stream: LiveStream) => void;
  setFilterStatus: (status: LiveStore['filterStatus']) => void;
}

export const useLiveStore = create<LiveStore>((set) => ({
  streams: [],
  currentStream: null,
  filterStatus: 'all',
  setStreams: (streams) => set({ streams }),
  setCurrentStream: (stream) => set({ currentStream: stream }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
}));
