import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PendingScore {
  gameSessionId: string;
  score: number;
  gameMode?: 'classic' | 'wrap';
}

interface AppState {
  // Hydration state tracking
  _hasHydrated: boolean;
  
  // Auth state
  token: string | null;
  address: string | null;   // wallet address — persisted independently of Dynamic session
  username: string | null;
  avatarName: string;
  avatarColor: string;
  onboardingCompleted: boolean;
  
  // Game session & scores
  gameSessionId: string | null;
  pendingScore: PendingScore | null;
  highScore: number;

  // Actions
  setHasHydrated: (state: boolean) => void;
  login: (token: string, username: string, address: string, avatarName?: string, avatarColor?: string) => void;
  logout: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setAvatar: (name: string, color: string) => void;
  setGameSessionId: (id: string | null) => void;
  setPendingScore: (pending: PendingScore | null) => void;
  setHighScore: (score: number) => void;
  clearGameSession: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      token: null,
      address: null,
      username: null,
      avatarName: 'CYAN VIPER',
      avatarColor: '#00FFFF',
      onboardingCompleted: false,
      gameSessionId: null,
      pendingScore: null,
      highScore: 0,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      login: (token, username, address, avatarName, avatarColor) =>
        set((state) => ({
          token,
          username,
          address,
          avatarName: avatarName || state.avatarName,
          avatarColor: avatarColor || state.avatarColor,
        })),
        
      logout: () =>
        set({
          token: null,
          address: null,
          username: null,
          gameSessionId: null,
          pendingScore: null,
        }),
        
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      
      setAvatar: (name, color) => set({ avatarName: name, avatarColor: color }),

      setGameSessionId: (id) => set({ gameSessionId: id }),
      
      setPendingScore: (pending) => set({ pendingScore: pending }),
      
      setHighScore: (score) => set({ highScore: score }),
      
      clearGameSession: () => set({ gameSessionId: null }),
    }),
    {
      name: 'play3310-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
