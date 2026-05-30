import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { BACKEND_URL } from '../constants/config';

export interface LeaderboardEntry {
  address: string;
  username: string;
  weeklyScore?: number;
  gamesCount?: number;
  highScore?: number;
  totalGames?: number;
  referralPoints: number;
}

export const useLeaderboard = (type: 'weekly' | 'allTime'): UseQueryResult<LeaderboardEntry[], Error> => {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard', type],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const token = useAppStore.getState().token;
      const endpoint = type === 'weekly' ? 'weekly' : 'all-time';
      const response = await fetch(`${BACKEND_URL}/api/scores/leaderboard/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} leaderboard. Status: ${response.status}`);
      }
      const data = await response.json();
      return (data.leaderboard || []) as LeaderboardEntry[];
    },
  });
};
