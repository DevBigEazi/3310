import React from 'react';
import { useGameScore } from '../../hooks/useGameScore';
import SnakeGame from '../../components/SnakeGame';

export default function GameScreen(): React.JSX.Element {
  const gameScore = useGameScore();

  return (
    <SnakeGame {...gameScore} />
  );
}

