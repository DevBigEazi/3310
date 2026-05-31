import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DecryptorStepProps {
  email: string;
  otp: string;
  isLoading: boolean;
  onCancel: () => void;
  onOtpChange: (value: string) => void;
  onResendOtp: () => void;
  cursorVisible: boolean;
  resendCountdown: number;
}

export default function DecryptorStep({
  email,
  otp,
  isLoading,
  onCancel,
  onOtpChange,
  onResendOtp,
  cursorVisible,
  resendCountdown,
}: DecryptorStepProps): React.JSX.Element {
  const hiddenInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    // Focus the input when the component mounts
    const timer = setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const otpArray = otp.split('');
  const cells = Array(6).fill('');

  return (
    <Animated.View entering={FadeIn.duration(400)} className="w-full">
      <TouchableOpacity 
        onPress={onCancel}
        className="flex-row items-center mb-6 self-start"
      >
        <Ionicons name="arrow-back-outline" size={16} color="#00FFFF" />
        <Text className="font-pixel_semibold text-xs text-secondary ml-1.5 tracking-wider">
          CANCEL LINK
        </Text>
      </TouchableOpacity>

      <Text className="font-arcade text-xs text-warning text-center mb-2 tracking-widest">
        {"// ACCESS_DECRYPTOR //"}
      </Text>
      <Text 
        className="font-arcade text-[14px] text-white text-center mb-3 tracking-wider"
        style={{
          textShadowColor: '#FFFF00',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }}
      >
        ENTER SECURITY KEY
      </Text>
      <Text className="font-pixel_regular text-xs text-grey-100 text-center mb-8 px-4 leading-relaxed">
        We sent an authorization transmission code to:{"\n"}
        <Text className="text-secondary font-pixel_semibold">{email}</Text>
      </Text>

      {/* Stylized OTP Boxes Grid and Hidden Input Container */}
      <View className="relative mb-8 self-center">
        <View className="flex-row justify-center gap-2">
          {cells.map((_, idx) => {
            const digit = otpArray[idx] || '';
            const isFocused = idx === otpArray.length;
            
            return (
              <View
                key={idx}
                className="w-11 h-14 rounded-lg bg-[#101432] justify-center items-center relative"
                style={{
                  borderWidth: 2,
                  borderColor: digit ? '#00FF00' : (isFocused ? '#00FFFF' : '#404040'),
                  shadowColor: digit ? '#00FF00' : (isFocused ? '#00FFFF' : 'transparent'),
                  shadowOpacity: digit || isFocused ? 0.3 : 0,
                  shadowRadius: 5,
                }}
              >
                <Text 
                  className="font-arcade text-lg text-white"
                  style={{ paddingBottom: Platform.OS === 'android' ? 2 : 0 }}
                >
                  {digit}
                </Text>
                
                {isFocused && cursorVisible && (
                  <View className="absolute bottom-2 w-3.5 h-[3px] bg-secondary" />
                )}
              </View>
            );
          })}
        </View>

        {/* Hidden single TextInput layered on top to capture all taps naturally */}
        <TextInput
          ref={hiddenInputRef}
          value={otp}
          onChangeText={onOtpChange}
          keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
          maxLength={6}
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: 0.01,
            color: 'transparent',
            backgroundColor: 'transparent',
          }}
          caretHidden={true}
        />
      </View>

      {/* Verification status */}
      <View className="items-center mb-6 min-h-[40px]">
        {isLoading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#FFFF00" />
            <Text className="font-terminal text-sm text-warning tracking-widest">
              DECRYPTING SECTOR SIGNAL...
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={onResendOtp}
            disabled={resendCountdown > 0}
          >
            <Text 
              className="font-pixel_semibold text-xs text-warning tracking-widest underline decoration-warning"
            >
              {resendCountdown > 0 ? `RESEND KEY IN ${resendCountdown}S` : "RESEND ACCESS KEY"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
