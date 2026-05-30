import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface LoginStepProps {
  email: string;
  setEmail: (val: string) => void;
  isLoading: boolean;
  activeProvider: 'google' | 'email' | null;
  onSubmitEmail: () => void;
  onSocialLogin: (provider: 'google') => void;
}

export default function LoginStep({
  email,
  setEmail,
  isLoading,
  activeProvider,
  onSubmitEmail,
  onSocialLogin,
}: LoginStepProps): React.JSX.Element {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="w-full">
      <Text className="font-arcade text-xs text-secondary text-center mb-2 tracking-widest">
        {"// PROTOCOL_AUTH //"}
      </Text>
      <Text 
        className="font-arcade text-[15px] text-white text-center mb-8 tracking-wider"
        style={{
          textShadowColor: '#00FFFF',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }}
      >
        SECURE LOGIN
      </Text>

      {/* Social login */}
      <View className="w-full gap-3 mb-6">
        <TouchableOpacity
          onPress={() => onSocialLogin('google')}
          disabled={isLoading}
          activeOpacity={0.85}
          className="w-full border-2 border-white rounded-xl py-4 bg-white/5 flex-row justify-center items-center gap-3"
        >
          {activeProvider === 'google' ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <FontAwesome name="google" size={20} color="white" />
              <Text className="font-pixel_bold text-white text-sm tracking-wider">
                AUTHORIZE WITH GOOGLE
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Retro Divider */}
      <View className="flex-row items-center justify-center my-6">
        <View className="flex-1 h-[2px] bg-grey-200" />
        <Text className="font-arcade text-[10px] text-grey-100 px-4 tracking-widest">
          OR
        </Text>
        <View className="flex-1 h-[2px] bg-grey-200" />
      </View>

      {/* Email Terminal Input */}
      <View className="w-full border-2 border-secondary/40 rounded-xl bg-[#101432] p-4 mb-4">
        <Text className="font-terminal text-xs text-secondary mb-2 tracking-wider">
          ESTABLISH TERMINAL LINK (EMAIL):
        </Text>
        <View className="flex-row items-center bg-[#07091a] border border-secondary/30 rounded px-3 py-2 mb-3">
          <Ionicons name="mail-outline" size={18} color="#00FFFF" style={{ marginRight: 8 }} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your_comms_link@email.com"
            placeholderTextColor="#404040"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            className="flex-1 font-terminal text-[15px] text-white py-1"
          />
        </View>

        <TouchableOpacity
          onPress={onSubmitEmail}
          disabled={!email || isLoading}
          activeOpacity={0.8}
          className={`w-full py-3.5 rounded-lg items-center ${
            !email ? 'bg-grey-200 border border-grey-DEFAULT/30' : 'bg-secondary'
          }`}
          style={email ? {
            shadowColor: '#00FFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 5
          } : {}}
        >
          {activeProvider === 'email' ? (
            <ActivityIndicator size="small" color="#0A0E27" />
          ) : (
            <Text className={`font-pixel_bold text-sm tracking-wider ${!email ? 'text-grey-100' : 'text-primary'}`}>
              TRANSMIT OTP LINK
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text className="font-pixel_regular text-[10px] text-grey-100 text-center leading-relaxed mt-4 px-2">
        Zero setup needed. Sign in and start playing in seconds. Your rewards are always yours.
      </Text>
    </Animated.View>
  );
}
