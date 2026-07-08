import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RetroCrtEffects({ 
  bezelColor = '#0A0E27',
  bezelWidth = 10
}: { 
  bezelColor?: string;
  bezelWidth?: number;
}): React.JSX.Element {
  const scanBarY = useSharedValue(-50);

  useEffect(() => {
    scanBarY.value = withRepeat(
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [scanBarY]);

  const scanBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanBarY.value }],
  }));

  return (
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
      {bezelWidth > 0 && (
        <View style={[styles.bezelShadow, { borderColor: bezelColor, borderWidth: bezelWidth }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 10,
    borderColor: '#0A0E27',
    opacity: 0.9,
  },
});
