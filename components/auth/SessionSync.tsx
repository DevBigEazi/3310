import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from '../../client';
import { useAppStore } from '../../store/useAppStore';

export function SessionSync() {
  const router = useRouter();
  const segments = useSegments();
  const client = useReactiveClient(dynamicClient);
  const logout = useAppStore((state) => state.logout);
  const token = useAppStore((state) => state.token);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isProfile = segments[0] === 'profile';

    const isAuthenticatedDynamic = !!client.auth.authenticatedUser;
    const hasBackendToken = !!token;

    // Case 1: Dynamic session is expired/inactive, but backend token still exists in store
    if (!isAuthenticatedDynamic && hasBackendToken) {
      console.log('[SessionSync] Dynamic session is inactive but backend token exists. Logging out.');
      logout();
      return;
    }

    // Case 2: User is on a protected screen, but has no active Dynamic session or backend token
    if ((inTabsGroup || isProfile) && (!isAuthenticatedDynamic || !hasBackendToken)) {
      console.log('[SessionSync] User on protected screen without active session. Redirecting to sign-in.');
      
      // We route back to index/auth so it can re-auth or prompt login
      router.replace('/(auth)/sign-in');
    }
  }, [client.auth.authenticatedUser, token, segments, hasHydrated, logout, router]);

  return null;
}
