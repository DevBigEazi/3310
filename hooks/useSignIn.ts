import { useState, useEffect, useRef } from 'react';
import { TextInput, NativeSyntheticEvent, TextInputKeyPressEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from '../client';
import { BACKEND_URL, AVATARS } from '../constants/config';
import { fetchWithTimeout } from '../utils/helpers';

export const useSignIn = () => {
  const login = useAppStore((state) => state.login);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);

  const router = useRouter();
  const client = useReactiveClient(dynamicClient);
  const [authStep, setAuthStep] = useState<'login' | 'decryptor' | 'register'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  // Get initial values from raw client to prevent first-render flash of non-loading buttons
  const initialUser = dynamicClient.auth.authenticatedUser;
  const [isLoading, setIsLoading] = useState(!!initialUser);

  // Focus reference for OTP boxes
  // Focus reference for OTP boxes (omitted in single input refactor)

  // Blink cursor for terminal inputs
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 550);
    return () => clearInterval(interval);
  }, []);

  // Cooldown timer for resending OTP (1 minute)
  const [resendCountdown, setResendCountdown] = useState(0);
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handle post-authentication sync with the backend
  useEffect(() => {
    if (!!client.auth.authenticatedUser) {
      handlePostAuth();
    }
  }, [client.auth.authenticatedUser, client.wallets.primary]);

  const handlePostAuth = async () => {
    const address = client.wallets.primary?.address;
    if (!address) return;

    setIsLoading(true);
    // No-op (removed activeProvider recovery)

    try {
      const checkResponse = await fetchWithTimeout(`${BACKEND_URL}/api/player/check/${address}`);
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        const loginResponse = await fetchWithTimeout(`${BACKEND_URL}/api/player`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, username: 'returning-user' }),
        });
        const loginData = await loginResponse.json();

        if (loginData.token) {
          login(loginData.token, loginData.player.username);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)/game');
        } else {
          Toast.show({
            type: 'error',
            text1: 'SIGN IN FAILED',
            text2: 'Could not retrieve login token.',
          });
        }
      } else {
        setAuthStep('register');
      }
    } catch (err: unknown) {
      console.error('Post-auth setup failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to verify agent signature.';
      const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'CONNECTION ERROR',
        text2: isNetworkError ? 'Network connection failed. Please check your internet connection.' : errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'SIGN IN FAILED',
        text2: 'Please enter a valid email address.',
      });
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      await client.auth.email.sendOTP(email.trim());
      setAuthStep('decryptor');
      setResendCountdown(60);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      console.error('Failed to send OTP:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to send OTP code.';
      const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'SEND FAILED',
        text2: isNetworkError ? 'Network connection failed. Please check your internet connection.' : (errMsg || 'Could not send verification code.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cleanValue = val.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanValue);

    if (cleanValue.length === 6) {
      triggerOtpVerify(cleanValue);
    }
  };

  const triggerOtpVerify = async (code: string) => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await client.auth.email.verifyOTP(code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      console.error('Failed to verify OTP:', err);
      const errMsg = err instanceof Error ? err.message : 'Invalid security key.';
      const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'VERIFICATION FAILED',
        text2: isNetworkError ? 'Network connection failed. Please check your internet connection.' : 'Invalid code. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleAgentRegistration = async () => {
    if (username.trim().length < 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'REGISTRATION FAILED',
        text2: 'Username must be at least 3 characters.',
      });
      return;
    }

    const address = client.wallets.primary?.address;
    if (!address) {
      Toast.show({
        type: 'error',
        text1: 'REGISTRATION FAILED',
        text2: 'No wallet connection found.',
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLoading(true);
    try {
      const registerResponse = await fetchWithTimeout(`${BACKEND_URL}/api/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          username: username.trim(),
          email: client.auth.authenticatedUser?.email || email || undefined,
          referredBy: referralCode.trim() || undefined,
        }),
      });
      const registerData = await registerResponse.json();

      if (registerResponse.status === 400 && registerData.error === 'USERNAME_TAKEN') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: 'USERNAME TAKEN',
          text2: 'This username has already been taken.',
        });
        return;
      }

      if (!registerResponse.ok || !registerData.token) {
        throw new Error(registerData.message || 'Server rejected registration.');
      }

      setOnboardingCompleted(true);
      login(
        registerData.token,
        registerData.player.username,
        AVATARS[selectedAvatar].name,
        AVATARS[selectedAvatar].color
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/game');
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to register agent. Try again.';
      const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'REGISTRATION FAILED',
        text2: isNetworkError ? 'Network connection failed. Please check your internet connection.' : 'Could not register username. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleSocialLogin (Google auth disabled)

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      await client.auth.email.resendOTP();
      setResendCountdown(60);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'CODE SENT',
        text2: 'A new verification code has been sent.',
      });
    } catch (err: unknown) {
      console.error('Failed to resend OTP:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to resend OTP.';
      const isNetworkError = errMsg.includes('Network request failed') || errMsg.includes('fetch');
      Toast.show({
        type: 'error',
        text1: 'SEND FAILED',
        text2: isNetworkError ? 'Network connection failed. Please check your internet connection.' : 'Could not resend verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    client,
    authStep,
    setAuthStep,
    email,
    setEmail,
    otp,
    setOtp,
    username,
    setUsername,
    referralCode,
    setReferralCode,
    selectedAvatar,
    setSelectedAvatar,
    isLoading,
    cursorVisible,
    handleEmailSubmit,
    handleOtpChange,
    handleAgentRegistration,
    handleResendOtp,
    resendCountdown,
  };
};
export { AVATARS };

