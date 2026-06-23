import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import RetroCrtEffects from '../../components/auth/RetroCrtEffects';

export default function PayScreen(): React.JSX.Element {
  const pulseScale = useSharedValue(1);

  // Set up pulsing scale animation
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.ease }),
        withTiming(0.95, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [pulseScale]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E27' }} className="px-4 pt-4">
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View className="items-center mb-6">
          <Text className="font-arcade text-base text-secondary tracking-widest">PAY & UTILITIES</Text>
          {/* <Text className="font-pixel text-[10px] text-grey-100 mt-1">MANAGE SUBSCRIPTIONS & REWARD UTILITIES</Text> */}
        </View>

        {/* Pulsing Warning Banner */}
        <Animated.View style={[animatedPulseStyle]} className="w-full max-w-sm mb-6">
          <View className="border-2 border-warning bg-warning/10 p-4 rounded-xl items-center shadow-lg">
            <Ionicons name="flash-outline" size={24} color="#FFFF00" className="mb-2" />
            <Text className="font-arcade text-[10px] text-warning text-center leading-5 tracking-wider">
              PREMIUM TOURNAMENTS COMING SOON!
            </Text>
          </View>
        </Animated.View>

        {/* Details Card */}
        <View className="w-full max-w-sm bg-[#101432]/60 border-2 border-reward/30 rounded-2xl p-5 mb-6 relative overflow-hidden">
          <RetroCrtEffects />
          
          <View className="flex-row items-center gap-2.5 border-b border-reward/20 pb-3 mb-4">
            <Ionicons name="trophy-outline" size={20} color="#FFD700" />
            <Text className="font-pixel_bold text-sm text-reward">PHASE 2 UTILITY REWARDS</Text>
          </View>

          {/* Poppins font description */}
          <Text className="font-poppins text-xs text-grey-100 leading-6 mb-4">
            Phase 2 upgrade will introduce premium competitive arenas where players can compete for USDC rewards, which can be used directly to pay for utilities like airtime, data bundles, and electricity bills.
          </Text>
        </View>        
      </ScrollView>
    </SafeAreaView>
  );
}
