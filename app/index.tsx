import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import Onboarding from '@/components/Onboarding';
import { dynamicClient } from '../client';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { BACKEND_URL } from '../constants/config';
import { useAppStore } from '../store/useAppStore';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const client = useReactiveClient(dynamicClient);
  const [isChecking, setIsChecking] = useState(true);
  
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const login = useAppStore((state) => state.login);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);

  useEffect(() => {
    const isAtRoot = !segments[0];
    if (hasHydrated && isAtRoot) {
      checkAppStatus();
    }
  }, [hasHydrated, client.auth.authenticatedUser, client.wallets.primary, segments]);

  const checkAppStatus = async () => {
    try {
      setIsChecking(true);

      if (onboardingCompleted) {
        // Check if authenticated on Dynamic
        if (client.auth.authenticatedUser) {
          const address = client.wallets.primary?.address;
          if (address) {
            try {
              // Check if address is registered in the backend
              const checkResponse = await fetch(`${BACKEND_URL}/api/player/check/${address}`);
              const checkData = await checkResponse.json();
              
              if (checkData.exists) {
                // Complete registration/login to get token
                const loginResponse = await fetch(`${BACKEND_URL}/api/player`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ address, username: 'returning-user' }),
                });
                const loginData = await loginResponse.json();
                
                if (loginData.token) {
                  login(loginData.token, loginData.player.username);
                  router.replace('/(tabs)/game');
                  return;
                }
              } else {
                // Authenticated but does not exist in backend (needs registration)
                router.replace('/(auth)/sign-in');
                return;
              }
            } catch (err) {
              console.error('Error auto-logging in player:', err);
            }
          } else {
            // Authenticated on Dynamic, but primary wallet address is not ready yet.
            // Stay in checking/loading state and wait for the wallet address update.
            return;
          }
        } else {
          router.replace('/(auth)/sign-in');
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    } finally {
      // Only complete loading check if we are NOT waiting for the wallet address
      if (!(client.auth.authenticatedUser && !client.wallets.primary?.address)) {
        setIsChecking(false);
      }
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    router.replace('/(auth)/sign-in');
  };

  if (!hasHydrated || isChecking || onboardingCompleted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E27', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }

  return <Onboarding onComplete={handleOnboardingComplete} />;
}

