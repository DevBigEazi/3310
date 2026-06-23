import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  
  // Reanimated CRT scan line sweep
  const scanBarY = useSharedValue(-50);

  useEffect(() => {
    scanBarY.value = withRepeat(
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const scanBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanBarY.value }],
  }));

  const steps = [
    {
      subtitle: "STAGE 01: PLAY CLASSIC",
      title: "RETRO SNAKE",
      description: "Gobble pixel-bugs, grow longer, and avoid crashes. Relive the original Nokia 3310 game redesigned for mobile devices.",
      image: require("@/assets/images/snake.png"),
      color: "#00FFFF", // Cyan
      glowClass: "text-secondary",
    },
    {
      subtitle: "STAGE 02: CLIMB RANKS",
      title: "COMPETE & WIN",
      description: "Climb the weekly leaderboard. Top qualified players share weekly pools. Showcase your high scores to the community.",
      image: require("@/assets/images/man.png"),
      color: "#00FF00", // Lime
      glowClass: "text-accent",
    },
    {
      subtitle: "STAGE 03: INSTANT ACCESS",
      title: "WEB3 EMBEDDED",
      description: "Sign in with Email. Everything runs seamlessly in the background. Just play, earn, and spend.",
      image: require("@/assets/images/logo-nobg.png"),
      color: "#FFD700", // Gold
      glowClass: "text-reward",
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CRT SCANLINE SCREEN EFFECTS */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Subtle grid scanlines */}
        <View style={styles.scanlineOverlay}>
          {Array.from({ length: 70 }).map((_, i) => (
            <View key={i} style={styles.scanline} />
          ))}
        </View>
        
        {/* Animated Sweep Line */}
        <Animated.View style={[scanBarAnimatedStyle, styles.scanBar]} />
        
        {/* Screen Bezel shadow */}
        <View style={styles.bezelShadow} />
      </View>

      <View className="flex-1 justify-between px-6 py-6">
        {/* Header with SKIP */}
        <View className="flex-row justify-between items-center h-10">
          <Text className="font-arcade text-[10px] text-grey-100 opacity-60">
            SYSTEM // BOOT_3310
          </Text>
          {step < steps.length - 1 && (
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text className="font-pixel_semibold text-xs text-warning tracking-widest border border-warning/30 rounded px-2.5 py-1 bg-warning/5">
                SKIP 
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content Carousel with Animated Slide Changes */}
        <View className="flex-1 justify-center items-center my-6">
          <Animated.View 
            key={step} 
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            className="items-center w-full"
          >
            {/* Stage Title */}
            <Text className="font-pixel_bold text-xs text-grey-100 tracking-wider mb-2">
              {currentStep.subtitle}
            </Text>
            
            {/* Main Header */}
            <Text 
              className="font-arcade text-xl text-center mb-6 tracking-wide"
              style={{
                color: currentStep.color,
                textShadowColor: currentStep.color,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}
            >
              {currentStep.title}
            </Text>

            {/* Illustration Box */}
            <View 
              className="border-2 border-[#404040] rounded-xl p-4 bg-[#101432] shadow-inner mb-6 justify-center items-center"
              style={{
                width: SCREEN_WIDTH * 0.75,
                height: SCREEN_WIDTH * 0.65,
                borderColor: currentStep.color + '50',
                shadowColor: currentStep.color,
                shadowOpacity: 0.1,
                shadowRadius: 10,
              }}
            >
              <Image
                source={currentStep.image}
                style={{ width: '85%', height: '85%' }}
                resizeMode="contain"
              />
            </View>

            {/* Description */}
            <Text className="font-pixel_regular text-[13px] text-grey-100 text-center leading-[22px] px-4 min-h-[70px]">
              {currentStep.description}
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Controls */}
        <View className="gap-6">
          {/* Progress Indicators */}
          <View className="flex-row justify-center items-center gap-2.5">
            {steps.map((item, idx) => (
              <View
                key={idx}
                className="rounded-full"
                style={{
                  width: idx === step ? 28 : 8,
                  height: 8,
                  backgroundColor: idx === step ? item.color : '#404040',
                  shadowColor: idx === step ? item.color : 'transparent',
                  shadowOpacity: idx === step ? 0.8 : 0,
                  shadowRadius: 5,
                }}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-4">
            {step > 0 && (
              <TouchableOpacity
                onPress={handlePrev}
                activeOpacity={0.8}
                className="flex-1 border-2 border-grey-200 rounded-xl py-4 items-center bg-[#101432]"
              >
                <Text className="font-pixel_bold text-grey-100 text-sm">
                  {"<"} BACK
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              className="flex-1 rounded-xl py-4 items-center"
              style={{
                backgroundColor: currentStep.color,
                shadowColor: currentStep.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <Text className="font-pixel_bold text-primary text-sm tracking-wider">
                {step === steps.length - 1 ? "INITIALIZE >" : "NEXT >"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Compliance Info */}
          <Text className="font-pixel_regular text-[10px] text-grey-100 text-center leading-relaxed">
            By initializing, you accept the 3310 Protocol{"\n"}Terms of Service and Data Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    backgroundColor: 'transparent',
  },
  scanline: {
    height: 1.5,
    backgroundColor: '#000000',
    marginTop: 5,
  },
  scanBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00FFFF',
    opacity: 0.06,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bezelShadow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 10,
    borderColor: '#0A0E27',
    opacity: 0.9,
  },
});
