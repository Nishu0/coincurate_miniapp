'use client';

import { GameLobby } from '../components/GameLobby';

export default function GameLobbyPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3">
      <h1 className="text-2xl font-bold mb-6">Game Lobby</h1>
      <GameLobby />
    </div>
  );
} 