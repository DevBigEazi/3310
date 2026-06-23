import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
import { dynamicClient } from '../client';
import { View, Text } from 'react-native';
import Toast, { ToastConfig, BaseToastProps } from 'react-native-toast-message';
import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { SessionSync } from '../components/auth/SessionSync';

// Toast Component
const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <View style={{
      width: '92%',
      backgroundColor: '#0D122B',
      borderColor: '#00FF00',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: '#00FF00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    }}>
      <Text style={{ fontFamily: 'PressStart2P-Regular', fontSize: 9, color: '#00FF00', marginBottom: 2 }}>
        {text1}
      </Text>
      {text2 ? (
        <Text style={{ fontFamily: 'VT323-Regular', fontSize: 14, color: '#C0C0C0' }}>
          {text2}
        </Text>
      ) : null}
    </View>
  ),
  error: ({ text1, text2 }: BaseToastProps) => (
    <View style={{
      width: '92%',
      backgroundColor: '#0D122B',
      borderColor: '#FF0000',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: '#FF0000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    }}>
      <Text style={{ fontFamily: 'PressStart2P-Regular', fontSize: 9, color: '#FF0000', marginBottom: 2 }}>
        {text1}
      </Text>
      {text2 ? (
        <Text style={{ fontFamily: 'VT323-Regular', fontSize: 14, color: '#C0C0C0' }}>
          {text2}
        </Text>
      ) : null}
    </View>
  ),
  info: ({ text1, text2 }: BaseToastProps) => (
    <View style={{
      width: '92%',
      backgroundColor: '#0D122B',
      borderColor: '#00FFFF',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: '#00FFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    }}>
      <Text style={{ fontFamily: 'PressStart2P-Regular', fontSize: 9, color: '#00FFFF', marginBottom: 2 }}>
        {text1}
      </Text>
      {text2 ? (
        <Text style={{ fontFamily: 'VT323-Regular', fontSize: 14, color: '#C0C0C0' }}>
          {text2}
        </Text>
      ) : null}
    </View>
  ),
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      const errorMsg = error.message || '';
      if (
        errorMsg.includes('Status: 401') ||
        errorMsg.includes('Status: 403') ||
        errorMsg.includes('UNAUTHORIZED') ||
        errorMsg.includes('INVALID_TOKEN')
      ) {
        console.log('[QueryCache] Auth error detected, clearing token:', errorMsg);
        useAppStore.getState().logout();
        return;
      }

      // Skip global toast if query meta indicates so
      if (query.meta?.preventGlobalToast) return;

      const isNetworkError = error.message?.includes('Network request failed') || 
                             error.name === 'TypeError' ||
                             error.message?.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'CONNECTION ERROR',
        text2: isNetworkError
          ? 'Network connection failed. Please check your internet connection.'
          : 'Could not load data. Please try again.',
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      const errorMsg = error.message || '';
      if (
        errorMsg.includes('Status: 401') ||
        errorMsg.includes('Status: 403') ||
        errorMsg.includes('UNAUTHORIZED') ||
        errorMsg.includes('INVALID_TOKEN')
      ) {
        console.log('[MutationCache] Auth error detected, clearing token:', errorMsg);
        useAppStore.getState().logout();
        return;
      }

      // Skip global toast if mutation meta indicates so
      if (mutation.meta?.preventGlobalToast) return;

      const isNetworkError = error.message?.includes('Network request failed') || 
                             error.name === 'TypeError' ||
                             error.message?.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'SUBMISSION ERROR',
        text2: isNetworkError
          ? 'Network connection failed. Please check your internet connection.'
          : 'Something went wrong. Please try again.',
      });
    },
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [loaded, error] = useFonts({
    'PressStart2P-Regular': require('../assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf'),
    'VT323-Regular': require('../assets/fonts/VT323/VT323-Regular.ttf'),
    'PixelifySans-Regular': require('../assets/fonts/Pixelify_Sans/PixelifySans-Regular.ttf'),
    'PixelifySans-Medium': require('../assets/fonts/Pixelify_Sans/PixelifySans-Medium.ttf'),
    'PixelifySans-SemiBold': require('../assets/fonts/Pixelify_Sans/PixelifySans-SemiBold.ttf'),
    'PixelifySans-Bold': require('../assets/fonts/Pixelify_Sans/PixelifySans-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <dynamicClient.reactNative.WebView />
      <SessionSync />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="light" translucent />
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
