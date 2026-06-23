import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { BACKEND_URL } from '../constants/config';

export interface Badge {
  badgeType: 'FIRST_PLACE' | 'SECOND_PLACE' | 'THIRD_PLACE' | 'TOP_5' | 'TOP_10';
  earnedAt: string;
  weekId: number;
}

export interface PlayerProfile {
  address: string;
  username: string;
  email?: string;
  referralCode: string;
  referredBy: string | null;
  referralPoints: number;
  referralCount: number;
  badges: Badge[];
}

export interface PlayerStats {
  highestScore: number;
  totalGames: number;
}

export interface ProfileData {
  player: PlayerProfile;
  stats: PlayerStats;
}

export const usePlayerProfile = (address: string | undefined): UseQueryResult<ProfileData | null, Error> => {
  return useQuery<ProfileData | null, Error>({
    queryKey: ['player', address],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!address) return null;
      const token = useAppStore.getState().token;
      const response = await fetch(`${BACKEND_URL}/api/player/${address}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch player profile. Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        player: data.player as PlayerProfile,
        stats: data.stats as PlayerStats,
      };
    },
    enabled: !!address,
  });
};
