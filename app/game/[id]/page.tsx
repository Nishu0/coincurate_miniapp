'use client';

import { GameView } from '../../components/GameView';
import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3">
      <GameView gameId={gameId} />
    </div>
  );
} 