import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { BACKEND_URL } from '../constants/config';
import { fetchWithTimeout } from '../utils/helpers';
import { useAppStore } from '../store/useAppStore';

export interface GameSessionInfo {
  playerAddress: string;
  dayId: string;
  weekNumber: number;
  gamesPlayedInCurrentHour: number;
  firstGameInHour: string | null;
  currentLives: number;
  nextRefillAt: string | null;
  dailyAccumulatedScore: number;
  weeklyAccumulatedScore: number;
}

export const useGameScore = () => {
  const queryClient = useQueryClient();
  
  const gameSessionId = useAppStore((state) => state.gameSessionId);
  const setGameSessionId = useAppStore((state) => state.setGameSessionId);
  const pendingScore = useAppStore((state) => state.pendingScore);
  const setPendingScore = useAppStore((state) => state.setPendingScore);

  // Formatted timer strings
  const [refillCountdown, setRefillCountdown] = useState<string>('');
  const [hourlyCountdown, setHourlyCountdown] = useState<string>('');

  const [isSyncingPending, setIsSyncingPending] = useState<boolean>(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

  // Helper: Retrieve authorization headers
  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const token = useAppStore.getState().token;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Sync the pending offline score manually/automatically
  const syncPendingScore = useCallback(async () => {
    const currentPending = useAppStore.getState().pendingScore;
    if (!currentPending) return;

    try {
      setIsSyncingPending(true);
      const { gameSessionId: storedSessionId, score: storedScore } = currentPending;
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/scores/validate-score`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          gameSessionId: storedSessionId,
          score: storedScore,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        // Replay Protection / server-side already saved case
        if (errData.error === 'INVALID_OR_SUBMITTED_SESSION') {
          setPendingScore(null);
          queryClient.invalidateQueries({ queryKey: ['gameSession'] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          Toast.show({
            type: 'success',
            text1: 'SCORE SUBMITTED',
            text2: 'Score has already been successfully submitted.',
          });
          return;
        }
        throw new Error(errData.error || 'Failed to validate score.');
      }

      setPendingScore(null);
      queryClient.invalidateQueries({ queryKey: ['gameSession'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

      Toast.show({
        type: 'success',
        text1: 'SCORE SUBMITTED',
        text2: `Score of ${storedScore} successfully submitted!`,
      });
    } catch (error: any) {
      console.error('[useGameScore] Manual sync error:', error);
      const isNetworkError = error.message?.includes('Network request failed') || 
                             error.name === 'TypeError' ||
                             error.message?.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'SUBMISSION FAILED',
        text2: isNetworkError
          ? 'Network connection failed. Please check your internet connection.'
          : error.message || 'Could not submit offline score.',
      });
    } finally {
      setIsSyncingPending(false);
    }
  }, [queryClient, setPendingScore]);

  // Background auto-sync on hook load/focus
  useEffect(() => {
    const autoSyncPendingScore = async () => {
      const currentPending = useAppStore.getState().pendingScore;
      if (!currentPending) return;

      try {
        const { gameSessionId: storedSessionId, score: storedScore } = currentPending;
        const headers = await getAuthHeaders();
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/scores/validate-score`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            gameSessionId: storedSessionId,
            score: storedScore,
          }),
        });

        if (response.ok) {
          setPendingScore(null);
          queryClient.invalidateQueries({ queryKey: ['gameSession'] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          Toast.show({
            type: 'success',
            text1: 'SCORE AUTO-SUBMITTED',
            text2: `Your saved score of ${storedScore} was submitted automatically!`,
          });
        } else {
          const errData = await response.json();
          // If session is already submitted or expired/invalid, clear it to avoid blocking user
          if (errData.error === 'INVALID_OR_SUBMITTED_SESSION') {
            setPendingScore(null);
            queryClient.invalidateQueries({ queryKey: ['gameSession'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            Toast.show({
              type: 'success',
              text1: 'SCORE SUBMITTED',
              text2: 'Saved score has already been submitted successfully.',
            });
          }
        }
      } catch (e) {
        // Fail silently during auto background sync
        console.log('[useGameScore] Auto sync background check failed (expected if offline):', e);
      }
    };

    // Delay autoSync slightly to avoid race conditions with initial session queries
    const timer = setTimeout(() => {
      autoSyncPendingScore();
    }, 1500);

    return () => clearTimeout(timer);
  }, [queryClient, setPendingScore]);

  // TanStack Query to fetch session info
  const { data: sessionInfo, isLoading: isQueryLoading } = useQuery<GameSessionInfo | null, Error>({
    queryKey: ['gameSession'],
    queryFn: async (): Promise<GameSessionInfo | null> => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetchWithTimeout(`${BACKEND_URL}/api/scores/game-session`, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch session. Status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('[useGameScore] Error fetching session:', error);
        return null;
      }
    },
  });

  const lives = sessionInfo?.currentLives ?? 5;
  const gamesPlayedInCurrentHour = sessionInfo?.gamesPlayedInCurrentHour ?? 0;
  const nextRefillAt = sessionInfo?.nextRefillAt ?? null;
  const firstGameInHour = sessionInfo?.firstGameInHour ?? null;
  const weeklyScore = sessionInfo?.weeklyAccumulatedScore ?? 0;

  // Flags
  const isOutOfLives = lives <= 0;
  const isHourLimitReached = gamesPlayedInCurrentHour >= 5;

  // Fetch or sync the session status manually (calls refetch under the hood)
  const fetchSession = useCallback(async (): Promise<GameSessionInfo | null> => {
    await queryClient.invalidateQueries({ queryKey: ['gameSession'] });
    return queryClient.getQueryData<GameSessionInfo>(['gameSession']) || null;
  }, [queryClient]);

  // Mutations
  const startMutation = useMutation<string | null, Error, void>({
    mutationFn: async (): Promise<string | null> => {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/scores/start`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start game');
      }

      const data = await response.json();
      setGameSessionId(data.gameSessionId);
      return data.gameSessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameSession'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['gameSession'] });
    }
  });

  const submitMutation = useMutation<{ isValid: boolean; updatedScore: number } | null, Error, number>({
    meta: { preventGlobalToast: true },
    mutationFn: async (score: number): Promise<{ isValid: boolean; updatedScore: number } | null> => {
      if (!gameSessionId) {
        console.error('[useGameScore] Cannot submit score without an active gameSessionId');
        return null;
      }
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/scores/validate-score`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          gameSessionId,
          score,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to validate score');
      }

      const data = await response.json();
      setGameSessionId(null); // Reset game session

      return {
        isValid: data.isValid,
        updatedScore: data.weeklyAccumulatedScore,
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gameSession'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      // Clear pending score locally if any
      setPendingScore(null);

      if (variables === 0) {
        Toast.show({
          type: 'info',
          text1: 'GAME OVER',
          text2: 'Score was 0. No life deducted, game did not count.',
        });
      } else if (data?.isValid) {
        Toast.show({
          type: 'success',
          text1: 'SCORE SUBMITTED',
          text2: `Score of ${variables} successfully submitted to leaderboard!`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'VALIDATION FAILED',
          text2: 'Could not validate score. It may have expired.',
        });
      }
    },
    onError: (error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gameSession'] });
      
      const isNetworkError = error.message?.includes('Network request failed') || 
                             error.name === 'TypeError' ||
                             error.message?.includes('fetch');
      
      if (isNetworkError && gameSessionId) {
        if (variables > 0) {
          const offlineData = { gameSessionId, score: variables };
          setPendingScore(offlineData);
          Toast.show({
            type: 'error',
            text1: 'SUBMISSION FAILED (OFFLINE)',
            text2: 'Score saved locally. Tap "Submit Score" when your connection is stable.',
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'GAME OVER (OFFLINE)',
            text2: 'Score was 0. No life deducted, game did not count.',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'SUBMISSION FAILED',
          text2: error.message || 'Could not submit your score. Please try again.',
        });
      }
    }
  });

  // Start a new game session wrapper
  const startGameAttempt = useCallback(async (): Promise<string | null> => {
    try {
      const currentPending = useAppStore.getState().pendingScore;
      if (currentPending) {
        Toast.show({
          type: 'error',
          text1: 'SUBMISSION REQUIRED',
          text2: 'Please submit your saved score before starting a new game.',
        });
        return null;
      }
      return await startMutation.mutateAsync();
    } catch (error) {
      console.error('[useGameScore] Error starting game:', error);
      return null;
    }
  }, [startMutation]);

  // Submit and validate the score wrapper
  const submitGameScore = useCallback(
    async (score: number): Promise<{ isValid: boolean; updatedScore: number } | null> => {
      try {
        return await submitMutation.mutateAsync(score);
      } catch (error) {
        console.error('[useGameScore] Error validating/submitting score:', error);
        return null;
      }
    },
    [submitMutation]
  );

  const isLoading = isQueryLoading || startMutation.isPending || submitMutation.isPending;

  // Timer loop for handling refill and hourly countdowns
  useEffect(() => {
    const runTimers = () => {
      const now = Date.now();
      let shouldRefreshSession = false;

      // 1. Lives refill countdown
      if (lives < 5 && nextRefillAt) {
        const refillTime = new Date(nextRefillAt).getTime();
        const diffMs = refillTime - now;

        if (diffMs <= 0) {
          setRefillCountdown('');
          shouldRefreshSession = true;
        } else {
          const totalSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setRefillCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      } else {
        setRefillCountdown('');
      }

      // 2. Hourly limit countdown (resets 1 hour after firstGameInHour)
      if (gamesPlayedInCurrentHour >= 5 && firstGameInHour) {
        const firstGameTime = new Date(firstGameInHour).getTime();
        const limitExpiryTime = firstGameTime + 60 * 60 * 1000;
        const diffMs = limitExpiryTime - now;

        if (diffMs <= 0) {
          setHourlyCountdown('');
          shouldRefreshSession = true;
        } else {
          const totalSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setHourlyCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      } else {
        setHourlyCountdown('');
      }

      if (shouldRefreshSession) {
        queryClient.invalidateQueries({ queryKey: ['gameSession'] });
      }
    };

    runTimers(); // run immediately
    timerIntervalRef.current = setInterval(runTimers, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [lives, nextRefillAt, gamesPlayedInCurrentHour, firstGameInHour, queryClient]);

  return {
    lives,
    gamesPlayedInCurrentHour,
    nextRefillAt,
    firstGameInHour,
    weeklyScore,
    refillCountdown,
    hourlyCountdown,
    isOutOfLives,
    isHourLimitReached,
    isLoading,
    gameSessionId,
    fetchSession,
    startGameAttempt,
    submitGameScore,
    pendingScore,
    isSyncingPending,
    syncPendingScore,
  };
};
