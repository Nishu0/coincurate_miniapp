'use client';

import { GameCreation } from '../components/GameCreation';

export default function CreateGamePage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3">
      <h1 className="text-2xl font-bold mb-6">Create Game</h1>
      <GameCreation />
    </div>
  );
} 