import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface AvatarInfo {
  name: string;
  color: string;
  glowClass: string;
  speed: number;
  size: number;
  glow: number;
}

interface RegisterStepProps {
  username: string;
  setUsername: (val: string) => void;
  referralCode: string;
  setReferralCode: (val: string) => void;
  selectedAvatar: number;
  setSelectedAvatar: (val: number) => void;
  isLoading: boolean;
  onSubmit: () => void;
  avatars: AvatarInfo[];
  cursorVisible: boolean;
}

export default function RegisterStep({
  username,
  setUsername,
  referralCode,
  setReferralCode,
  selectedAvatar,
  setSelectedAvatar,
  isLoading,
  onSubmit,
  avatars,
  cursorVisible,
}: RegisterStepProps): React.JSX.Element {
  const avatar = avatars[selectedAvatar];

  return (
    <Animated.View entering={FadeIn.duration(400)} className="w-full">
      <Text className="font-arcade text-xs text-accent text-center mb-2 tracking-widest">
        {"// CODENAME_REGISTRATION //"}
      </Text>
      <Text 
        className="font-arcade text-[14px] text-white text-center mb-6 tracking-wider"
        style={{
          textShadowColor: '#00FF00',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        }}
      >
        INITIALIZE AGENT
      </Text>

      {/* Character Card Box */}
      <View className="w-full border-2 border-accent/40 rounded-xl bg-[#101432] p-4 mb-4">
        <Text className="font-terminal text-xs text-accent mb-2 tracking-wider">
          ASSIGN AGENT CODENAME (USERNAME):
        </Text>
        <View className="flex-row items-center bg-[#07091a] border border-accent/30 rounded px-3 py-2 mb-3">
          <Ionicons name="terminal-outline" size={18} color="#00FF00" style={{ marginRight: 8 }} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Min 3 chars..."
            placeholderTextColor="#404040"
            maxLength={20}
            autoCapitalize="none"
            editable={!isLoading}
            className="flex-1 font-terminal text-[15px] text-white py-1"
          />
          {username.length > 0 && (
            <View 
              className="w-2.5 h-[15px] bg-[#00FF00] ml-1" 
              style={{ opacity: cursorVisible ? 1 : 0 }}
            />
          )}
        </View>
        <Text className="text-[10px] font-terminal text-grey-100 text-right mb-2">
          LENGTH: <Text className="font-arcade text-[8px]">{username.length}</Text>/<Text className="font-arcade text-[8px]">20</Text>
        </Text>

        {/* Avatar grid selection */}
        <Text className="font-terminal text-xs text-accent mb-2.5 tracking-wider">
          SELECT SNAKE SUB-SYSTEM AVATAR:
        </Text>
        <View className="flex-row justify-between mb-4">
          {avatars.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedAvatar(idx)}
              activeOpacity={0.8}
              className="w-[22%] aspect-square rounded-xl justify-center items-center border-2 bg-[#07091a]"
              style={{
                borderColor: selectedAvatar === idx ? item.color : '#2d3356',
                shadowColor: selectedAvatar === idx ? item.color : 'transparent',
                shadowOpacity: selectedAvatar === idx ? 0.8 : 0,
                shadowRadius: 5,
              }}
            >
              {/* Visual Avatar block */}
              <View 
                className="w-6 h-6 rounded"
                style={{
                  backgroundColor: item.color,
                  shadowColor: item.color,
                  shadowOpacity: 0.9,
                  shadowRadius: 5,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Stat Screen */}
        <View className="bg-[#07091a] rounded-lg p-3.5 border border-[#2d3356] mb-2">
          <Text 
            className="font-arcade text-[10px] mb-3 tracking-wider"
            style={{ color: avatar.color }}
          >
            SYS: {avatar.name}
          </Text>

          {/* Stat Row 1: SPEED ENGINE */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="font-pixel text-[10px] text-grey-100">SPEED ENGINE</Text>
              <Text className="font-arcade text-[10px] text-white">{avatar.speed}%</Text>
            </View>
            <View className="h-[6px] bg-grey-200 rounded overflow-hidden">
              <View className="h-full bg-secondary" style={{ width: `${avatar.speed}%` }} />
            </View>
          </View>

          {/* Stat Row 2: SCORE PER FOOD */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="font-pixel text-[10px] text-grey-100">SCORE PER FOOD</Text>
              <Text className="font-arcade text-[10px]" style={{ color: avatar.color }}>
                {5 * (avatar.speed >= 90 ? 4 : avatar.speed >= 80 ? 3 : avatar.speed >= 70 ? 2 : 1)} PTS
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View 
                className="px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${avatar.color}20`, borderWidth: 1, borderColor: `${avatar.color}40` }}
              >
                <Text className="font-arcade text-[8px]" style={{ color: avatar.color }}>
                  {avatar.speed >= 90 ? '4' : avatar.speed >= 80 ? '3' : avatar.speed >= 70 ? '2' : '1'}x MULTIPLIER
                </Text>
              </View>
            </View>
          </View>

          {/* Stat Row 3: SIZE POTENTIAL */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="font-pixel text-[10px] text-grey-100">SIZE POTENTIAL</Text>
              <Text className="font-arcade text-[10px] text-white">{avatar.size}%</Text>
            </View>
            <View className="h-[6px] bg-grey-200 rounded overflow-hidden">
              <View className="h-full bg-accent" style={{ width: `${avatar.size}%` }} />
            </View>
          </View>

          {/* Stat Row 4: GLOW RESONANCE */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="font-pixel text-[10px] text-grey-100">GLOW RESONANCE</Text>
              <Text className="font-arcade text-[10px] text-white">{avatar.glow}%</Text>
            </View>
            <View className="h-[6px] bg-grey-200 rounded overflow-hidden">
              <View className="h-full bg-reward" style={{ width: `${avatar.glow}%` }} />
            </View>
          </View>
        </View>
      </View>

      {/* Optional Referral */}
      <View className="w-full border border-purple-400/35 rounded-xl bg-[#101432] p-4 mb-5">
        <Text className="font-terminal text-xs text-purple-400 mb-2 tracking-wider">
          REFERRAL PROTOCOL LINK (OPTIONAL):
        </Text>
        <View className="flex-row items-center bg-[#07091a] border border-purple-400/30 rounded px-3 py-1.5">
          <Ionicons name="gift-outline" size={16} color="#A78BFA" style={{ marginRight: 8 }} />
          <TextInput
            value={referralCode}
            onChangeText={setReferralCode}
            placeholder="ENTER REFERRAL KEY"
            placeholderTextColor="#404040"
            autoCapitalize="characters"
            editable={!isLoading}
            className="flex-1 font-terminal text-[14px] text-white py-1"
          />
        </View>
      </View>

      {/* Complete Signup Button */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={username.trim().length < 3 || isLoading}
        activeOpacity={0.8}
        className={`w-full py-4 rounded-xl items-center ${
          username.trim().length < 3 ? 'bg-grey-200 border border-grey-DEFAULT/30' : 'bg-accent'
        }`}
        style={username.trim().length >= 3 ? {
          shadowColor: '#00FF00',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 10,
          elevation: 6
        } : {}}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#0A0E27" />
        ) : (
          <Text className={`font-pixel_bold text-sm tracking-widest ${username.trim().length < 3 ? 'text-grey-100' : 'text-primary'}`}>
            ACTIVATE AGENT GRID {'>'}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
