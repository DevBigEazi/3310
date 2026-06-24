import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from '../client';
import { AVATARS } from '../constants/config';
import RetroCrtEffects from '../components/auth/RetroCrtEffects';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import Confetti from '../components/Confetti';

const BADGE_IMAGES = {
  FIRST_PLACE: require('../assets/images/badge_first_place.png'),
  SECOND_PLACE: require('../assets/images/badge_second_place.png'),
  THIRD_PLACE: require('../assets/images/badge_third_place.png'),
  TOP_5: require('../assets/images/badge_top_5.png'),
  TOP_10: require('../assets/images/badge_top_10.png'),
  GOAT: require('../assets/images/badge_goat.png'),
};

export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const client = useReactiveClient(dynamicClient);
  const address = client.wallets.primary?.address;
  
  const { data: profileData, isLoading, refetch } = usePlayerProfile(address);
  const profile = profileData?.player || null;
  const stats = profileData?.stats || null;

  useFocusEffect(
    useCallback(() => {
      if (address) {
        refetch();
      }
    }, [refetch, address])
  );

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Trigger confetti when profile loaded and player is GOAT
  useEffect(() => {
    if (profile?.badges?.some((b: any) => b.badgeType === 'GOAT')) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // 5 seconds of confetti
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [profile?.badges]);

  const selectedAvatarName = useAppStore((state) => state.avatarName);
  const setAvatar = useAppStore((state) => state.setAvatar);
  const logout = useAppStore((state) => state.logout);

  const activeAvatar = AVATARS.find(a => a.name === selectedAvatarName) || AVATARS[0];

  const handleChangeAvatar = (avatarItem: typeof AVATARS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAvatar(avatarItem.name, avatarItem.color);
  };

  const handleCopyReferral = async () => {
    if (!profile?.referralCode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(profile.referralCode);
    setCopiedLink(true);
    Toast.show({
      type: 'success',
      text1: 'CODE COPIED',
      text2: 'Referral code copied to clipboard.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };



  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "CONFIRM LOGOUT",
      "Are you sure you want to log out of the console?",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "LOGOUT",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsLoggingOut(true);
            try {
              // Call Dynamic logout
              await dynamicClient.auth.logout();
              // Clear Zustand store (token, username, gameSessionId, pendingScore)
              logout();
              
              // Poll until the Dynamic client has cleared user and primary wallet from memory
              let attempts = 0;
              while ((dynamicClient.auth.authenticatedUser || dynamicClient.wallets.primary?.address) && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
              }
              
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Logout failed:', error);
              Toast.show({
                type: 'error',
                text1: 'LOGOUT FAILED',
                text2: 'Could not log out securely. Please try again.',
              });
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E27' }}>
        <View className="flex-1 w-full px-4 pt-2 items-center justify-start gap-4">
          {/* Top Area: Branding & Title */}
          <View className="flex-row items-center justify-between w-full mb-1">
            {/* Left side: Back Button */}
            <View className="w-16">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(tabs)/game');
                  }
                }}
                className="px-2 py-1 flex-row items-center gap-0.5 border rounded-lg justify-center"
                style={{
                  borderColor: '#00FFFF40',
                  backgroundColor: '#07091a',
                }}
              >
                <Ionicons name="chevron-back" size={12} color="#00FFFF" />
                <Text className="font-pixel text-[9px]" style={{ color: "#00FFFF" }}>
                  BACK
                </Text>
              </TouchableOpacity>
            </View>

            {/* Center: Title & Console Branding */}
            <View className="flex-1 items-center">
              <Text className="font-arcade text-[10px] text-secondary tracking-[2px] opacity-80 text-center">
                {"// 3310 CONSOLE //"}
              </Text>
              <Text className="font-pixel text-[10px] text-grey-100 mt-0.5 text-center">
                SECURE DECRYPTED USER PROFILE
              </Text>
              <Text className="font-terminal text-grey-100 text-[13px] text-center mt-0.5">
                AGENT: FETCHING PROFILE DATA...
              </Text>
            </View>

            {/* Right side: Spacer for alignment balance */}
            <View className="w-16" />
          </View>

          {/* Loading Profile Card */}
          <View 
            className="w-full max-w-sm bg-[#0D122B] border-2 rounded-2xl p-6 relative my-3 overflow-hidden justify-center items-center"
            style={{
              borderColor: '#00FFFF',
              shadowColor: '#00FFFF',
              shadowOpacity: 0.3,
              shadowRadius: 10,
              minHeight: 250,
            }}
          >
            <RetroCrtEffects />
            <ActivityIndicator size="large" color="#00FFFF" className="mb-4" />
            <Text className="font-terminal text-base text-secondary tracking-widest text-center">
              DECRYPTING PROFILE...
            </Text>
            <Text className="font-pixel text-[9px] text-grey-100 mt-2 text-center">
              ESTABLISHING ENCRYPTED SECURE LINK
            </Text>
          </View>

          {/* Dummy placeholders for layout balance */}
          <View className="w-full max-w-sm mt-1 h-32 bg-[#0D122B]/20 border border-grey-200/10 rounded-xl" />
        </View>
      </SafeAreaView>
    );
  }



  // Group player's badges by type for the gallery grid
  const badgeCounts = {
    FIRST_PLACE: 0,
    SECOND_PLACE: 0,
    THIRD_PLACE: 0,
    TOP_5: 0,
    TOP_10: 0,
    GOAT: 0,
  };

  if (profile?.badges) {
    profile.badges.forEach((b) => {
      if (badgeCounts[b.badgeType] !== undefined) {
        badgeCounts[b.badgeType]++;
      }
    });
  }

  const badgeItems = [
    {
      type: 'FIRST_PLACE' as const,
      title: 'WEEKLY CHAMPION',
      icon: 'trophy' as const,
      color: '#FFD700', // Gold
      description: 'Finished 1st on the weekly leaderboard.',
      count: badgeCounts.FIRST_PLACE,
    },
    {
      type: 'SECOND_PLACE' as const,
      title: 'ELITE RUNNER-UP',
      icon: 'medal' as const,
      color: '#E0E0E0', // Silver
      description: 'Finished 2nd on the weekly leaderboard.',
      count: badgeCounts.SECOND_PLACE,
    },
    {
      type: 'THIRD_PLACE' as const,
      title: 'THIRD PLACE HERO',
      icon: 'ribbon' as const,
      color: '#CD7F32', // Bronze
      description: 'Finished 3rd on the weekly leaderboard.',
      count: badgeCounts.THIRD_PLACE,
    },
    {
      type: 'TOP_5' as const,
      title: 'ELITE TOP 5',
      icon: 'star' as const,
      color: '#00FFFF', // Neon Cyan
      description: 'Finished in the Top 5 of the weekly standings.',
      count: badgeCounts.TOP_5,
    },
    {
      type: 'TOP_10' as const,
      title: 'TOP 10 CHALLENGER',
      icon: 'shield' as const,
      color: '#FF00FF', // Neon Magenta
      description: 'Finished in the Top 10 of the weekly standings.',
      count: badgeCounts.TOP_10,
    },
    {
      type: 'GOAT' as const,
      title: 'G.O.A.T.',
      icon: 'star' as const,
      color: '#FF0055', // Neon Crimson/Rose
      description: 'Holds the record for the most Weekly Champion wins.',
      count: badgeCounts.GOAT,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E27' }}>
      <ScrollView 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} 
        className="flex-1 w-full px-4 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-start gap-4 w-full max-w-sm">
        {/* Top Area: Branding & Title */}
        <View className="flex-row items-center justify-between w-full mb-1">
          {/* Left side: Back Button */}
          <View className="w-16">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/game');
                }
              }}
              className="px-2 py-1 flex-row items-center gap-0.5 border rounded-lg justify-center"
              style={{
                borderColor: `${activeAvatar.color}40`,
                backgroundColor: '#07091a',
              }}
            >
              <Ionicons name="chevron-back" size={12} color={activeAvatar.color} />
              <Text className="font-pixel text-[9px]" style={{ color: activeAvatar.color }}>
                BACK
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center: Title & Console Branding */}
          <View className="flex-1 items-center">
            <Text className="font-arcade text-[10px] text-secondary tracking-[2px] opacity-80 text-center">
              {"// 3310 CONSOLE //"}
            </Text>
            <Text className="font-pixel text-[10px] text-grey-100 mt-0.5 text-center">
              SECURE DECRYPTED USER PROFILE
            </Text>
            <Text className="font-terminal text-grey-100 text-[13px] text-center mt-0.5">
              AGENT: {profile?.username || 'UNKNOWN'} ACTIVE
            </Text>
          </View>

          {/* Right side: Spacer for alignment balance */}
          <View className="w-16" />
        </View>

        {/* Middle Area: Profile Card (styled like game screen canvas) */}
        <View 
          className="w-full max-w-sm bg-[#0D122B] border-2 rounded-2xl p-4 relative my-3 overflow-hidden"
          style={{
            borderColor: activeAvatar.color,
            shadowColor: activeAvatar.color,
            shadowOpacity: 0.4,
            shadowRadius: 10,
          }}
        >
          {/* CRT scan overlay */}
          <RetroCrtEffects />

          {/* Profile Card Header */}
          <View className="items-center border-b border-grey-200/20 pb-2.5 w-full">
            <View 
              className="w-14 h-14 rounded-full bg-secondary/15 border-2 justify-center items-center mb-1.5"
              style={{
                borderColor: activeAvatar.color,
                shadowColor: activeAvatar.color,
                shadowOpacity: 0.8,
                shadowRadius: 6,
              }}
            >
              <Ionicons name="person" size={28} color={activeAvatar.color} />
            </View>
            <Text className="font-pixel_bold text-base text-secondary">{profile?.username || 'UNKNOWN_AGENT'}</Text>
            <Text className="font-terminal text-[10px] text-grey-100 mt-0.5 tracking-wider">STATUS: ACCESS VERIFIED</Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between w-full my-2">
            <View className="w-[48%] bg-grey-200/10 border border-grey-200/20 rounded-xl p-2 items-center">
              <Text className="font-pixel text-[8px] text-grey-100 mb-0.5">ALL-TIME HIGH</Text>
              <Text className="font-arcade text-base text-accent">{stats?.highestScore || 0}</Text>
            </View>
            <View className="w-[48%] bg-grey-200/10 border border-grey-200/20 rounded-xl p-2 items-center">
              <Text className="font-pixel text-[8px] text-grey-100 mb-0.5">GAMES PLAYED</Text>
              <Text className="font-arcade text-base text-accent">{stats?.totalGames || 0}</Text>
            </View>
          </View>

          {/* Avatar Selection Grid */}
          <View className="w-full border-t border-grey-200/20 pt-2.5">
            <Text className="font-terminal text-[10px] text-secondary mb-2 tracking-wider uppercase text-center">
              Configure Snake Sub-System (Avatar):
            </Text>
            
            {/* Selection Grid */}
            <View className="flex-row gap-3 justify-center mb-2">
              {AVATARS.map((item, idx) => {
                const isSelected = selectedAvatarName === item.name;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleChangeAvatar(item)}
                    activeOpacity={0.8}
                    className="w-10 h-10 p-4 rounded-lg justify-center items-center border-2"
                    style={{
                      borderColor: isSelected ? item.color : '#2d3356',
                      backgroundColor: isSelected ? `${item.color}20` : '#07091a',
                      shadowColor: item.color,
                      shadowOpacity: isSelected ? 0.7 : 0,
                      shadowRadius: 5,
                    }}
                  >
                    <View 
                      className="w-5 h-5 p-2"
                      style={{
                        backgroundColor: item.color,
                        shadowColor: item.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 4,
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active specs screen */}
            <View className="bg-[#07091a] rounded-lg p-2 border border-[#2d3356]">
              <Text 
                className="font-arcade text-[8px] mb-1.5 tracking-wider"
                style={{ color: activeAvatar.color }}
              >
                SYS ACTIVE: {activeAvatar.name}
              </Text>
              
              {/* Stat Row 1: SPEED ENGINE — primary strategic stat */}
              <View className="mb-1">
                <View className="flex-row justify-between mb-0.5">
                  <Text className="font-pixel text-[7px] text-grey-100">SPEED ENGINE</Text>
                  <Text className="font-arcade text-[8px] text-white">{activeAvatar.speed}%</Text>
                </View>
                <View className="h-[3px] bg-grey-200 rounded overflow-hidden">
                  <View className="h-full bg-secondary" style={{ width: `${activeAvatar.speed}%` }} />
                </View>
              </View>

              {/* Stat Row 2: SCORE PER FOOD — derived from speed multiplier */}
              <View className="mb-1">
                <View className="flex-row justify-between mb-0.5">
                  <Text className="font-pixel text-[7px] text-grey-100">SCORE PER FOOD</Text>
                  <Text className="font-arcade text-[8px]" style={{ color: activeAvatar.color }}>
                    {5 * (activeAvatar.speed >= 50 ? 4 : activeAvatar.speed >= 40 ? 3 : activeAvatar.speed >= 30 ? 2 : 1)} PTS
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <View 
                    className="px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${activeAvatar.color}20`, borderWidth: 1, borderColor: `${activeAvatar.color}40` }}
                  >
                    <Text className="font-arcade text-[7px]" style={{ color: activeAvatar.color }}>
                      {activeAvatar.speed >= 50 ? '4' : activeAvatar.speed >= 40 ? '3' : activeAvatar.speed >= 30 ? '2' : '1'}x MULTIPLIER
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stat Row 3: SIZE POTENTIAL */}
              <View className="mb-1">
                <View className="flex-row justify-between mb-0.5">
                  <Text className="font-pixel text-[7px] text-grey-100">SIZE POTENTIAL</Text>
                  <Text className="font-arcade text-[8px] text-white">{activeAvatar.size}%</Text>
                </View>
                <View className="h-[3px] bg-grey-200 rounded overflow-hidden">
                  <View className="h-full bg-accent" style={{ width: `${activeAvatar.size}%` }} />
                </View>
              </View>

              {/* Stat Row 4: GLOW RESONANCE */}
              <View>
                <View className="flex-row justify-between mb-0.5">
                  <Text className="font-pixel text-[7px] text-grey-100">GLOW RESONANCE</Text>
                  <Text className="font-arcade text-[8px] text-white">{activeAvatar.glow}%</Text>
                </View>
                <View className="h-[3px] bg-grey-200 rounded overflow-hidden">
                  <View className="h-full bg-reward" style={{ width: `${activeAvatar.glow}%` }} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Badges Gallery Cabinet */}
        <View 
          className="w-full bg-[#0D122B] border-2 rounded-2xl p-4 relative my-1 overflow-hidden"
          style={{
            borderColor: activeAvatar.color,
            shadowColor: activeAvatar.color,
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <RetroCrtEffects />
          
          <Text className="font-arcade text-[10px] text-secondary mb-3.5 tracking-widest text-center">
            // SYSTEM BADGES CABINET //
          </Text>
          
          <View className="flex-row flex-wrap justify-between w-full">
            {badgeItems.map((item) => {
              const isUnlocked = item.count > 0;
              return (
                <View 
                  key={item.type} 
                  className="w-[48%] bg-grey-200/5 border rounded-xl p-2.5 items-center mb-3.5 relative"
                  style={{
                    borderColor: isUnlocked ? `${item.color}40` : '#40404020',
                    opacity: isUnlocked ? 1 : 0.45,
                  }}
                >
                  <View 
                    className="w-10 h-10 rounded-full border-2 justify-center items-center mb-1.5 relative"
                    style={{
                      borderColor: isUnlocked ? item.color : '#404040',
                      backgroundColor: isUnlocked ? `${item.color}15` : '#40404010',
                    }}
                  >
                    {isUnlocked ? (
                      <Image 
                        source={BADGE_IMAGES[item.type]} 
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons 
                        name="lock-closed" 
                        size={16} 
                        color="#808080" 
                      />
                    )}
                    {/* Notification-style count badge for repeatable types */}
                    {isUnlocked && (item.type === 'FIRST_PLACE' || item.type === 'SECOND_PLACE' || item.type === 'THIRD_PLACE') && (
                      <View 
                        className="absolute -top-1 -right-1 bg-[#FF0055] rounded-full min-w-[15px] h-[15px] justify-center items-center px-1 border border-white"
                        style={{
                          zIndex: 10,
                          shadowColor: '#000',
                          shadowOpacity: 0.5,
                          shadowRadius: 1.5,
                          shadowOffset: { width: 0, height: 1 },
                        }}
                      >
                        <Text className="font-arcade text-[6px] text-white text-center leading-[6px]">
                          {item.count}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text 
                    className="font-pixel_bold text-[7.5px] text-center"
                    style={{ color: isUnlocked ? item.color : '#808080' }}
                  >
                    {item.title}
                  </Text>
                  
                  <Text className="font-poppins text-[6.5px] text-grey-100 text-center mt-1 leading-[9px] h-6 px-0.5">
                    {item.description}
                  </Text>
                  
                  <View className="mt-1.5 px-2 py-0.5 rounded bg-black/40 border border-grey-200/10">
                    <Text 
                      className="font-terminal text-[8px]"
                      style={{ color: isUnlocked ? (item.type === 'FIRST_PLACE' || item.type === 'SECOND_PLACE' || item.type === 'THIRD_PLACE' ? '#00FF00' : item.color) : '#808080' }}
                    >
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom Area: Referrals and Security */}
        <View className="w-full max-w-sm mt-1 items-center">
          {/* Referral Copy Row */}
          <View className="w-full mb-2">
            <View className="flex-row justify-between items-center mb-1 px-1">
              <Text className="font-pixel_bold text-[9px] text-secondary uppercase">Referral Code</Text>
              <View className="bg-accent/20 px-2 py-0.5 rounded">
                <Text className="text-accent text-[9px]">
                  <Text className="font-terminal text-[9px]">+</Text>
                  <Text className="font-arcade text-[8px]">{profile?.referralPoints || 0}</Text>
                  <Text className="font-terminal text-[9px]"> pts</Text>
                </Text>
              </View>
            </View>
            <View 
              className="flex-row items-center bg-[#0D122B] border rounded-xl p-1.5"
              style={{ borderColor: `${activeAvatar.color}30` }}
            >
              <Text 
                className="flex-1 font-arcade text-xs ml-2 mr-2 uppercase tracking-widest" 
                numberOfLines={1}
                style={{ color: activeAvatar.color }}
              >
                {profile?.referralCode || 'N/A'}
              </Text>
              <TouchableOpacity
                onPress={handleCopyReferral}
                className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: activeAvatar.color }}
                activeOpacity={0.7}
              >
                <Text 
                  className="font-pixel_bold text-[9px]"
                  style={{ color: '#0A0E27' }}
                >
                  {copiedLink ? 'COPIED!' : 'COPY'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action buttons (Logout) */}
          <View className="w-full mb-2">
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.8}
              className="w-full py-3 bg-[#FF0000]/10 border border-red-500 rounded-xl flex-row items-center justify-center gap-1.5"
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={14} color="white" />
                  <Text className="font-pixel_bold text-white text-[10px] tracking-wider">
                    LOGOUT TERMINAL
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
      <Confetti active={showConfetti} />
    </SafeAreaView>
  );
}
