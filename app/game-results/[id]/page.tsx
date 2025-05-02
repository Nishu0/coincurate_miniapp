'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';

interface GameResult {
  playerAddress: string;
  playerName: string;
  score: number;
  timeElapsed: number;
  reward: string;
  tokenSymbol: string;
}

export default function GameResultsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const [results, setResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState<{ title: string; tokenSymbol: string } | null>(null);
  
  const { address } = useAccount();

  useEffect(() => {
    // Simulate fetching results from API
    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, we'd call an API endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockGameInfo = {
          title: gameId === '1' ? 'Memory Masters' : 'Fast Fingers Tournament',
          tokenSymbol: gameId === '1' ? 'MEMO' : 'FAST',
        };
        
        // Create some mock player results
        const mockResults: GameResult[] = [
          {
            playerAddress: '0xYourAddress',
            playerName: 'You',
            score: 1245,
            timeElapsed: 72,
            reward: '16.5',
            tokenSymbol: mockGameInfo.tokenSymbol
          },
          {
            playerAddress: '0x456...789',
            playerName: 'Player2',
            score: 950,
            timeElapsed: 85,
            reward: '8.2',
            tokenSymbol: mockGameInfo.tokenSymbol
          },
          {
            playerAddress: '0x789...123',
            playerName: 'Player3',
            score: 820,
            timeElapsed: 92,
            reward: '6.5',
            tokenSymbol: mockGameInfo.tokenSymbol
          }
        ];
        
        // Sort by score (highest first)
        mockResults.sort((a, b) => b.score - a.score);
        
        setGameInfo(mockGameInfo);
        setResults(mockResults);
      } catch (error) {
        console.error('Error fetching game results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [gameId]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5">
      <h1 className="text-2xl font-bold mb-2">Game Results</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
        </div>
      ) : (
        <>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            {gameInfo?.title || 'Game'} - Final Standings
          </p>
          
          {/* Results table */}
          <div className="bg-[var(--app-gray-hover)] rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-4 text-sm font-medium bg-[var(--app-gray)] p-3">
              <div className="col-span-2">Player</div>
              <div className="text-right">Score</div>
              <div className="text-right">Reward</div>
            </div>
            
            {results.map((result, index) => {
              const isCurrentUser = result.playerAddress === '0xYourAddress';
              
              return (
                <div 
                  key={index}
                  className={`grid grid-cols-4 p-3 text-sm border-t border-[var(--app-gray)] ${
                    isCurrentUser ? 'bg-[var(--app-accent)]/10' : ''
                  }`}
                >
                  <div className="flex items-center col-span-2">
                    <div className="mr-2 font-semibold">{index + 1}.</div>
                    <div className={isCurrentUser ? 'font-semibold' : ''}>
                      {result.playerName}
                      {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                    </div>
                  </div>
                  <div className="text-right font-medium">{result.score}</div>
                  <div className="text-right font-medium text-green-500">
                    {result.reward} ${result.tokenSymbol}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Game stats */}
          <div className="mb-6">
            <h2 className="text-md font-semibold mb-2">Your Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--app-gray)] p-3 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Rank</p>
                <p className="font-semibold text-lg">
                  {results.findIndex(r => r.playerAddress === '0xYourAddress') + 1}/{results.length}
                </p>
              </div>
              <div className="bg-[var(--app-gray)] p-3 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Score</p>
                <p className="font-semibold text-lg">
                  {results.find(r => r.playerAddress === '0xYourAddress')?.score || 0}
                </p>
              </div>
              <div className="bg-[var(--app-gray)] p-3 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Reward</p>
                <p className="font-semibold text-lg text-green-500">
                  {results.find(r => r.playerAddress === '0xYourAddress')?.reward || 0} ${gameInfo?.tokenSymbol}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              className="flex-1 py-2 bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] rounded-lg text-sm font-medium"
              onClick={() => window.location.href = `/game/${gameId}`}
            >
              Play Again
            </button>
            <button
              className="flex-1 py-2 bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white rounded-lg text-sm font-medium"
              onClick={() => window.location.href = '/game-lobby'}
            >
              Back to Lobby
            </button>
          </div>
        </>
      )}
    </div>
  );
} 