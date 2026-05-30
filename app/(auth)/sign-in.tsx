import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Subcomponents & Hook
import RetroCrtEffects from '../../components/auth/RetroCrtEffects';
import LoginStep from '../../components/auth/LoginStep';
import DecryptorStep from '../../components/auth/DecryptorStep';
import RegisterStep from '../../components/auth/RegisterStep';
import { useSignIn } from '../../hooks/useSignIn';
import { AVATARS } from '../../constants/config';
import { useAppStore } from '../../store/useAppStore';

const CONNECTION_TIMEOUT_MS = 60000;

export default function SignIn(): React.JSX.Element {
  const {
    client,
    authStep,
    setAuthStep,
    email,
    setEmail,
    otp,
    username,
    setUsername,
    referralCode,
    setReferralCode,
    selectedAvatar,
    setSelectedAvatar,
    isLoading,
    activeProvider,
    cursorVisible,
    otpInputs,
    handleEmailSubmit,
    handleOtpChange,
    handleOtpKeyPress,
    handleAgentRegistration,
    handleSocialLogin,
    handleResendOtp,
    resendCountdown,
  } = useSignIn();

  const token = useAppStore(state => state.token);
  // Connection timeout: show escape hatch if loading takes too long
  const isConnecting = !!token || (!!client.auth.authenticatedUser && (authStep !== 'register' || isLoading));
  const [showTimeout, setShowTimeout] = useState<boolean>(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState<number>(0);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    if (isConnecting) {
      setShowTimeout(false);
      setTimeoutCountdown(Math.ceil(CONNECTION_TIMEOUT_MS / 1000));

      // Countdown timer
      countdownRef.current = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;

      // Show escape hatch after timeout
      timeoutRef.current = setTimeout(() => {
        setShowTimeout(true);
      }, CONNECTION_TIMEOUT_MS) as unknown as number;
    } else {
      setShowTimeout(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isConnecting]);

  const handleRetryConnection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowTimeout(false);
    // Force a re-auth attempt by toggling loading
    // The useEffect in useSignIn will re-fire handlePostAuth on next wallet update
  };

  const handleForceLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await client.auth.logout();
    } catch (error) {
      console.error('Force logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RetroCrtEffects />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center py-6 w-full max-w-sm self-center">
            {isConnecting ? (
              <Animated.View entering={FadeIn.duration(400)} className="w-full items-center py-12 bg-[#101432]/40 border-2 border-secondary/30 rounded-2xl p-6 shadow-2xl shadow-secondary/20">
                <ActivityIndicator size="large" color="#00FFFF" />
                <Text 
                  className="font-arcade text-xs text-secondary mt-8 text-center tracking-widest"
                  style={{
                    textShadowColor: '#00FFFF',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 6,
                    opacity: cursorVisible ? 1 : 0.4,
                  }}
                >
                  {"SYS: CONNECTING TO EMISSION GRID..."}
                </Text>
                <Text className="font-terminal text-grey-100 mt-3 text-center text-[10px] tracking-wider leading-relaxed">
                  DECRYPTING PLAYER PROTOCOLS & WALLET KEYS
                </Text>

                {/* Timeout countdown or escape hatch */}
                {showTimeout ? (
                  <Animated.View entering={FadeIn.duration(300)} className="w-full mt-8 items-center">
                    <Text className="font-pixel text-[10px] text-warning text-center mb-4">
                      CONNECTION IS TAKING LONGER THAN EXPECTED
                    </Text>
                    <View className="flex-row gap-3 w-full">
                      <TouchableOpacity
                        onPress={handleRetryConnection}
                        activeOpacity={0.8}
                        className="flex-1 py-3 bg-secondary/10 border border-secondary rounded-xl items-center"
                      >
                        <Text className="font-pixel_bold text-secondary text-[10px] tracking-wider">
                          RETRY
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleForceLogout}
                        activeOpacity={0.8}
                        className="flex-1 py-3 bg-destructive/10 border border-red-500 rounded-xl items-center"
                      >
                        <Text className="font-pixel_bold text-red-500 text-[10px] tracking-wider">
                          LOGOUT
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ) : (
                  <Text className="font-terminal text-grey-200 mt-6 text-center text-[9px] tracking-wider">
                    TIMEOUT IN {timeoutCountdown}s
                  </Text>
                )}
              </Animated.View>
            ) : (
              <>
                {authStep === 'login' && (
                  <LoginStep
                    email={email}
                    setEmail={setEmail}
                    isLoading={isLoading}
                    activeProvider={activeProvider}
                    onSubmitEmail={handleEmailSubmit}
                    onSocialLogin={handleSocialLogin}
                  />
                )}
                {authStep === 'decryptor' && (
                  <DecryptorStep
                    email={email}
                    otp={otp}
                    isLoading={isLoading}
                    onCancel={() => setAuthStep('login')}
                    onOtpChange={handleOtpChange}
                    onOtpKeyPress={handleOtpKeyPress}
                    onResendOtp={handleResendOtp}
                    otpInputsRef={otpInputs}
                    cursorVisible={cursorVisible}
                    resendCountdown={resendCountdown}
                  />
                )}
                {authStep === 'register' && (
                  <RegisterStep
                    username={username}
                    setUsername={setUsername}
                    referralCode={referralCode}
                    setReferralCode={setReferralCode}
                    selectedAvatar={selectedAvatar}
                    setSelectedAvatar={setSelectedAvatar}
                    isLoading={isLoading}
                    onSubmit={handleAgentRegistration}
                    avatars={AVATARS}
                    cursorVisible={cursorVisible}
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
});

