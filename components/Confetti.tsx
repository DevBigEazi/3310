import React from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';

interface ConfettiProps {
  active: boolean;
}

export default function Confetti({ active }: ConfettiProps): React.JSX.Element | null {
  if (!active) return null;

  return (
    <ConfettiCannon
      count={80}
      origin={{ x: -10, y: -10 }}
      fadeOut={true}
      fallSpeed={2500}
    />
  );
}
