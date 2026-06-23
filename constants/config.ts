import Constants from 'expo-constants';
import { Platform } from 'react-native';

const host = Constants.expoConfig?.hostUri?.split(':')[0] || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL && !process.env.EXPO_PUBLIC_BACKEND_URL.includes('localhost')
  ? process.env.EXPO_PUBLIC_BACKEND_URL
  : `http://${host}:8000`;

export const AVATARS = [
  { name: 'CYAN VIPER', color: '#00FFFF', glowClass: 'text-secondary', speed: 45, size: 45, glow: 95 },
  { name: 'MAGENTA MAMBA', color: '#FF00FF', glowClass: 'text-destructive', speed: 55, size: 75, glow: 65 },
  { name: 'LIME PYTHON', color: '#00FF00', glowClass: 'text-accent', speed: 65, size: 85, glow: 55 },
  { name: 'GOLDEN COBRA', color: '#FFD700', glowClass: 'text-reward', speed: 75, size: 55, glow: 85 },
];
