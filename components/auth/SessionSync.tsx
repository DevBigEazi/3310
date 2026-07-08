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
    if (!client.sdk.loaded) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isProfile = segments[0] === 'profile';

    const hasBackendToken = !!token;

    // If we have a valid backend JWT, trust it as the primary session signal.
    // Our backend JWT is long-lived (3650 days). The QueryCache 401/403 handler
    // in _layout.tsx will automatically call logout() if the token is ever
    // rejected by the server — no need to tie session validity to Dynamic's
    // shorter-lived session here.
    if (hasBackendToken) return;

    // No backend token at all: if the user is on a protected screen, redirect
    // them to sign-in so they can authenticate.
    if (inTabsGroup || isProfile) {
      console.log('[SessionSync] No backend token on protected screen. Redirecting to sign-in.');
      logout();
      router.replace('/(auth)/sign-in');
    }
  }, [client.auth.authenticatedUser, client.sdk.loaded, token, segments, hasHydrated, logout, router]);

  return null;
}
