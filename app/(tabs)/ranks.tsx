import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAppStore } from '../../store/useAppStore';

const BADGE_IMAGES = {
  FIRST_PLACE: require('../../assets/images/badge_first_place.png'),
  SECOND_PLACE: require('../../assets/images/badge_second_place.png'),
  THIRD_PLACE: require('../../assets/images/badge_third_place.png'),
  TOP_5: require('../../assets/images/badge_top_5.png'),
  TOP_10: require('../../assets/images/badge_top_10.png'),
  GOAT: require('../../assets/images/badge_goat.png'),
};

const renderMiniBadges = (badges: any[] | undefined): React.JSX.Element | null => {
  if (!badges || badges.length === 0) return null;

  // Group by badgeType to calculate counts
  const counts: Record<string, number> = {};
  badges.forEach((b) => {
    counts[b.badgeType] = (counts[b.badgeType] || 0) + 1;
  });

  const badgeOrder = ['GOAT', 'FIRST_PLACE', 'SECOND_PLACE', 'THIRD_PLACE', 'TOP_5', 'TOP_10'] as const;

  return (
    <View className="flex-row items-center gap-1 ml-1.5 flex-wrap">
      {badgeOrder.map((type) => {
        const count = counts[type];
        if (!count) return null;

        return (
          <View key={type} className="flex-row items-center bg-[#07091a] border border-grey-200/20 px-1 py-0.5 rounded gap-0.5">
            <Image 
              source={BADGE_IMAGES[type]} 
              style={{ width: 10, height: 10 }}
              resizeMode="contain"
            />
            {count > 1 && (
              <Text className="font-arcade text-[6px] text-grey-100 ml-0.5" style={{ fontSize: 6.5 }}>
                x{count}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function RanksScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'weekly' | 'allTime'>('weekly');
  const currentUsername = useAppStore((state) => state.username);

  // Fetch both leaderboards in parallel for instant tab switching
  const weeklyQuery = useLeaderboard('weekly');
  const allTimeQuery = useLeaderboard('allTime');

  const currentQuery = activeTab === 'weekly' ? weeklyQuery : allTimeQuery;
  const leaderboardData = currentQuery.data || [];
  const isLoading = activeTab === 'weekly' ? weeklyQuery.isLoading : allTimeQuery.isLoading;
  const isRefreshing = currentQuery.isRefetching;

  // Tab switcher
  const handleTabChange = (tab: 'weekly' | 'allTime') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Pull-to-refresh
  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    currentQuery.refetch();
  };

  // Get place color style
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: // 1st Place - Gold
        return {
          rankText: 'text-reward font-arcade text-[10px]',
          scoreText: 'text-reward font-arcade text-[11px]',
          bgClass: 'bg-reward/5 border-l-4 border-reward',
          iconName: 'trophy' as const,
          iconColor: '#FFD700',
        };
      case 1: // 2nd Place - Cyan / Silver
        return {
          rankText: 'text-secondary font-arcade text-[10px]',
          scoreText: 'text-secondary font-arcade text-[11px]',
          bgClass: 'bg-secondary/5 border-l-4 border-secondary',
          iconName: 'medal' as const,
          iconColor: '#00FFFF',
        };
      case 2: // 3rd Place - Bronze / Green
        return {
          rankText: 'text-accent font-arcade text-[10px]',
          scoreText: 'text-accent font-arcade text-[11px]',
          bgClass: 'bg-accent/5 border-l-4 border-accent',
          iconName: 'ribbon' as const,
          iconColor: '#00FF00',
        };
      default:
        return {
          rankText: 'text-grey-100 font-arcade text-[10px]',
          scoreText: 'text-white font-arcade text-[11px]',
          bgClass: 'border-l-4 border-transparent',
          iconName: null,
          iconColor: '#C0C0C0',
        };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E27' }} className="px-4 pt-4">
      {/* Page Header */}
      <View className="items-center mb-6">
        <Text className="font-arcade text-base text-secondary tracking-widest">LEADERBOARD</Text>
        <Text className="font-pixel text-[10px] text-grey-100 mt-1">GLOBAL AGENT STANDINGS</Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row border-b-2 border-grey-200/20 mb-4">
        <TouchableOpacity
          onPress={() => handleTabChange('weekly')}
          className={`flex-1 pb-3 items-center ${
            activeTab === 'weekly' ? 'border-b-4 border-secondary' : 'border-b-4 border-transparent'
          }`}
        >
          <Text
            className={`font-pixel_bold text-sm tracking-wider ${
              activeTab === 'weekly' ? 'text-secondary' : 'text-grey-100'
            }`}
          >
            WEEKLY COMP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange('allTime')}
          className={`flex-1 pb-3 items-center ${
            activeTab === 'allTime' ? 'border-b-4 border-secondary' : 'border-b-4 border-transparent'
          }`}
        >
          <Text
            className={`font-pixel_bold text-sm tracking-wider ${
              activeTab === 'allTime' ? 'text-secondary' : 'text-grey-100'
            }`}
          >
            ALL-TIME HIGH
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Table Headers */}
      <View className="flex-row px-4 py-2 border-b border-grey-200/20 bg-grey-200/10 rounded-t-lg">
        <Text className="w-[15%] font-arcade text-[8px] text-grey">RNK</Text>
        <Text className="w-[45%] font-arcade text-[8px] text-grey">AGENT</Text>
        {activeTab === 'weekly' ? (
          <>
            <Text className="w-[20%] font-arcade text-[8px] text-grey text-right">SCORE</Text>
            <Text className="w-[20%] font-arcade text-[8px] text-grey text-right">STATS</Text>
          </>
        ) : (
          <>
            <Text className="w-[20%] font-arcade text-[8px] text-grey text-right">HIGH</Text>
            <Text className="w-[20%] font-arcade text-[8px] text-grey text-right">GP</Text>
          </>
        )}
      </View>

      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center p-6 border-x border-b border-grey-200/20 bg-grey-200/5 rounded-b-lg min-h-[300px]">
          <ActivityIndicator size="large" color="#00FFFF" className="mb-4" />
          <Text className="font-terminal text-base text-secondary tracking-widest text-center">
            LOADING TELEMETRY...
          </Text>
          <Text className="font-pixel text-[9px] text-grey-100 mt-2 text-center">
            ESTABLISHING DECRYPTED FEED SIGNAL
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboardData}
          keyExtractor={(item) => item.address}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00FFFF"
              colors={['#00FFFF']}
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center border border-dashed border-grey-200/30 rounded-b-lg">
              <Ionicons name="alert-circle-outline" size={32} color="#808080" />
              <Text className="font-pixel_bold text-xs text-grey-100 mt-2">NO RECORDS REGISTERED</Text>
              <Text className="font-poppins text-[10px] text-grey/80 mt-1">Be the first to record a score!</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const config = getRankStyles(index);
            const isCurrentUser = item.username === currentUsername;
            return (
              <View
                className={`flex-row items-center border-b border-grey-200/10 py-3 px-4 ${config.bgClass}`}
                style={isCurrentUser ? {
                  backgroundColor: 'rgba(0, 255, 255, 0.08)',
                  borderColor: '#00FFFF',
                  borderLeftWidth: 4,
                } : undefined}
              >
                {/* Rank Number */}
                <View className="w-[15%] flex-row items-center">
                  <Text className={config.rankText}>{index + 1}</Text>
                  {config.iconName && (
                    <Ionicons 
                      name={config.iconName} 
                      size={10} 
                      color={config.iconColor} 
                      style={{ marginLeft: 2 }} 
                    />
                  )}
                </View>

                {/* Username / Address and Badges */}
                <View className="w-[45%] flex-row items-center">
                  <Text 
                    className={`font-pixel_semibold text-xs ${isCurrentUser ? 'text-secondary font-pixel_bold' : 'text-white'}`} 
                    numberOfLines={1} 
                    style={{ maxWidth: '65%' }}
                  >
                    {isCurrentUser ? 'You' : item.username}
                  </Text>
                  {renderMiniBadges(item.badges)}
                </View>

                {/* Weekly Tab Columns */}
                {activeTab === 'weekly' ? (
                  <>
                    {/* Weekly Accumulated Score */}
                    <Text className={`w-[20%] text-right ${config.scoreText}`}>
                      {item.weeklyScore}
                    </Text>
                    {/* Mini Stats: Games Count and Referral Points */}
                    <View className="w-[20%] items-end justify-center">
                      <Text className="text-grey-100 text-[11px]">
                        <Text className="font-arcade text-[8px]">{item.gamesCount}</Text>
                        <Text className="font-terminal text-[11px]">g</Text>
                      </Text>
                      <Text className="text-accent text-[9px] mt-0.5">
                        <Text className="font-terminal text-[9px]">+</Text>
                        <Text className="font-arcade text-[7px]">{item.referralPoints}</Text>
                        <Text className="font-terminal text-[9px]"> pts</Text>
                      </Text>
                    </View>
                  </>
                ) : (
                  /* All-Time Tab Columns */
                  <>
                    {/* Single-Game High Score */}
                    <Text className={`w-[20%] text-right ${config.scoreText}`}>
                      {item.highScore}
                    </Text>
                    {/* Total games played */}
                    <Text className="w-[20%] font-arcade text-[10px] text-grey-100 text-right">
                      {item.totalGames}
                    </Text>
                  </>
                )}
              </View>
            );
          }}
          className="flex-1 bg-grey-200/5 rounded-b-lg border-x border-b border-grey-200/20 mb-4"
        />
      )}
    </SafeAreaView>
  );
}
