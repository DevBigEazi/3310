import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Subcomponents & Hook
import RetroCrtEffects from '../../components/auth/RetroCrtEffects';
import LoginStep from '../../components/auth/LoginStep';
import DecryptorStep from '../../components/auth/DecryptorStep';
import RegisterStep from '../../components/auth/RegisterStep';
import { useSignIn } from '../../hooks/useSignIn';
import { AVATARS } from '../../constants/config';

export default function SignIn(): React.JSX.Element {
  const {
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
    cursorVisible,
    handleEmailSubmit,
    handleOtpChange,
    handleAgentRegistration,
    handleResendOtp,
    resendCountdown,
  } = useSignIn();



  useEffect(() => {
    const onBackPress = () => {
      // Exit app when pressing back button on the sign-in screen
      BackHandler.exitApp();
      return true; // Block default navigation pop
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

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
              {authStep === 'login' && (
                <LoginStep
                  email={email}
                  setEmail={setEmail}
                  isLoading={isLoading}
                  onSubmitEmail={handleEmailSubmit}
                />
              )}
              {authStep === 'decryptor' && (
                <DecryptorStep
                  email={email}
                  otp={otp}
                  isLoading={isLoading}
                  onCancel={() => setAuthStep('login')}
                  onOtpChange={handleOtpChange}
                  onResendOtp={handleResendOtp}
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

