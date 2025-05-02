import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useOpenUrl } from '@coinbase/onchainkit/minikit';
import { MemoryMatch } from './games/MemoryMatch';
import { QuickDraw } from './games/QuickDraw';

// Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function Button({ 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false,
  children 
}: ButtonProps) {
  const baseClasses = 'font-medium transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white',
    secondary: 'bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] text-[var(--app-foreground)]',
    outline: 'bg-transparent border border-[var(--app-accent)] text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// Game info interface
interface GameInfo {
  id: string;
  title: string;
  creatorAddress: string;
  creatorName: string;
  tokenSymbol: string;
  tokenAddress: string;
  stakingAmount: string;
  gameType: 'memoryMatch' | 'quickDraw';
  difficulty: 'easy' | 'medium' | 'hard';
  mode: 'singlePlayer' | 'multiplayer' | 'tournament';
  creatorRewardPercentage: number;
}

// Game result interface
interface GameResult {
  score: number;
  timeElapsed: number;
  playedAt: string;
}

interface GameViewProps {
  gameId?: string;
}

export function GameView({ gameId = '1' }: GameViewProps) {
  const [game, setGame] = useState<GameInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isProcessingReward, setIsProcessingReward] = useState<boolean>(false);
  const [rewardAmount, setRewardAmount] = useState<string>('0');
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  
  const { address, isConnected } = useAccount();
  const openUrl = useOpenUrl();

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock game data
        // In a real app, we'd fetch this from an API
        const mockGames: Record<string, GameInfo> = {
          '1': {
            id: '1',
            title: 'Memory Masters',
            creatorAddress: '0x123...456',
            creatorName: 'CryptoGamer',
            tokenSymbol: 'MEMO',
            tokenAddress: '0x789...012',
            stakingAmount: '10',
            gameType: 'memoryMatch',
            difficulty: 'medium',
            mode: 'multiplayer',
            creatorRewardPercentage: 20
          },
          '2': {
            id: '2',
            title: 'Fast Fingers Tournament',
            creatorAddress: '0x345...678',
            creatorName: 'SpeedKing',
            tokenSymbol: 'FAST',
            tokenAddress: '0x901...234',
            stakingAmount: '25',
            gameType: 'quickDraw',
            difficulty: 'hard',
            mode: 'tournament',
            creatorRewardPercentage: 15
          }
        };
        
        const foundGame = mockGames[gameId];
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          setError('Game not found. Please go back to the lobby.');
        }
      } catch (err) {
        console.error('Failed to load game', err);
        setError('Failed to load game. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGame();
  }, [gameId]);

  // Handle game completion
  const handleGameComplete = (score: number, timeElapsed: number) => {
    // Create game result
    const result: GameResult = {
      score,
      timeElapsed,
      playedAt: new Date().toISOString()
    };
    
    setGameResult(result);
    
    // Calculate reward - simulate token reward based on score
    const baseReward = parseFloat(game?.stakingAmount || '0');
    const winningMultiplier = score > 1000 ? 2 : score > 500 ? 1.5 : 1;
    
    // Creator gets their percentage, player gets the rest
    const creatorCut = baseReward * (game?.creatorRewardPercentage || 0) / 100;
    const potentialReward = (baseReward - creatorCut) * winningMultiplier;
    
    setRewardAmount(potentialReward.toFixed(2));
    setShowRewardModal(true);
  };

  // Process reward
  const handleProcessReward = async () => {
    setIsProcessingReward(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload page or redirect after reward is processed
      if (game?.mode === 'singlePlayer') {
        // For single player, go back to lobby
        window.location.href = '/game-lobby';
      } else {
        // For multiplayer/tournament, show game results
        // In a real app, we'd fetch results from an API
        window.location.href = `/game-results/${gameId}`;
      }
    } catch (err) {
      console.error('Failed to process reward', err);
      setError('Failed to process reward. Please try again later.');
    } finally {
      setIsProcessingReward(false);
    }
  };

  // Cancel game and return to lobby
  const handleCancel = () => {
    // In a real app, we'd call an API to cancel the game
    window.location.href = '/game-lobby';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8 text-center text-[var(--app-foreground-muted)]">
        <div>
          <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/game-lobby'}
            className="mt-3 rounded-full"
          >
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Game header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{game.title}</h2>
            <p className="text-xs text-[var(--app-foreground-muted)]">by {game.creatorName}</p>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="rounded-full"
            >
              Cancel Game
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-[var(--app-gray)] px-2 py-0.5 rounded-full">
            Stake: {game.stakingAmount} ${game.tokenSymbol}
          </span>
          <span className="text-xs bg-[var(--app-gray)] px-2 py-0.5 rounded-full">
            Creator Fee: {game.creatorRewardPercentage}%
          </span>
          <span className="text-xs bg-[var(--app-gray)] px-2 py-0.5 rounded-full capitalize">
            {game.difficulty}
          </span>
          <span className="text-xs bg-[var(--app-gray)] px-2 py-0.5 rounded-full capitalize">
            {game.mode}
          </span>
        </div>
      </div>
      
      {/* Game component */}
      <div className="mb-6 bg-[var(--app-gray-hover)] p-4 rounded-lg">
        {game.gameType === 'memoryMatch' ? (
          <MemoryMatch 
            difficulty={game.difficulty} 
            onGameComplete={handleGameComplete} 
          />
        ) : (
          <QuickDraw 
            difficulty={game.difficulty}
            onGameComplete={handleGameComplete}
          />
        )}
      </div>
      
      {/* Reward modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--app-background)] p-6 rounded-xl w-4/5 max-w-md">
            <h2 className="text-xl font-bold mb-2 text-center">Game Complete!</h2>
            
            <div className="text-center mb-4">
              <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
                {gameResult?.score && gameResult.score > 1000 
                  ? 'Amazing performance! You won the game.'
                  : gameResult?.score && gameResult.score > 500
                    ? 'Great job! You completed the game.'
                    : 'You completed the game.'}
              </p>
              
              <p className="text-lg font-semibold mb-2">
                Final Score: <span className="text-[var(--app-accent)]">{gameResult?.score}</span>
              </p>
              
              <div className="flex items-center justify-center space-x-3 mb-2">
                <span className="text-sm text-[var(--app-foreground-muted)]">Reward:</span>
                <span className="font-bold text-lg text-green-500">{rewardAmount} ${game.tokenSymbol}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.href = '/game-lobby'}
                className="flex-1"
                disabled={isProcessingReward}
              >
                Skip Reward
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProcessReward}
                className="flex-1"
                disabled={isProcessingReward}
              >
                {isProcessingReward ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Claim Reward'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 