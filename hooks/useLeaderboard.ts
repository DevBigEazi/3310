import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { BACKEND_URL } from '../constants/config';
import { Badge } from './usePlayerProfile';

export interface LeaderboardEntry {
  address: string;
  username: string;
  weeklyScore?: number;
  gamesCount?: number;
  highScore?: number;
  totalGames?: number;
  referralPoints: number;
  badges?: Badge[];
}

export interface LeaderboardResponse {
  weekId: number;
  startTime?: string;
  endTime?: string;
  leaderboard: LeaderboardEntry[];
}

export const useLeaderboard = (
  type: 'weekly' | 'allTime',
  weekId?: number,
  options?: { enabled?: boolean }
): UseQueryResult<LeaderboardResponse, Error> => {
  return useQuery<LeaderboardResponse, Error>({
    queryKey: ['leaderboard', type, weekId],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const token = useAppStore.getState().token;
      const endpoint = type === 'weekly' ? 'weekly' : 'all-time';
      const queryParam = weekId !== undefined ? `?weekId=${weekId}` : '';
      const response = await fetch(`${BACKEND_URL}/api/scores/leaderboard/${endpoint}${queryParam}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} leaderboard. Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        weekId: data.weekId,
        startTime: data.startTime,
        endTime: data.endTime,
        leaderboard: (data.leaderboard || []) as LeaderboardEntry[],
      };
    },
    enabled: options?.enabled,
  });
};
