import { useQuery } from '@tanstack/react-query';
import { liveService } from '../services/liveService';

export function useLiveStreams() {
  return useQuery({
    queryKey: ['live-streams'],
    queryFn: liveService.getAll,
    refetchInterval: 30000,
  });
}

export function useLiveStream(id: string) {
  return useQuery({
    queryKey: ['live-stream', id],
    queryFn: () => liveService.getById(id),
    enabled: !!id,
  });
}
