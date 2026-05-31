import { Tabs, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const onBackPress = () => {
      // Only exit the app if the user is currently on the tabs screens
      const inTabsGroup = segments[0] === '(tabs)';
      if (inTabsGroup) {
        BackHandler.exitApp();
        return true;
      }
      return false; // Allow standard pop/back navigation elsewhere
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [segments]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00FFFF', // Neon Cyan
        tabBarInactiveTintColor: '#808080', // Muted Grey
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0E27', // Deep space black/blue
          borderTopWidth: 2,
          borderTopColor: '#404040', // Dark Charcoal border
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontFamily: 'PixelifySans-Bold',
          fontSize: 11,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="game"
        options={{
          title: 'PLAY',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "game-controller" : "game-controller-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: 'RANKS',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'PAY',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "card" : "card-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
