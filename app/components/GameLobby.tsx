import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useOpenUrl } from '@coinbase/onchainkit/minikit';
import { getTokenBalance } from '../services/tokenService';

// Simple button component
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

// Game interface
interface GameInfo {
  id: string;
  title: string;
  creatorAddress: string;
  creatorName: string;
  tokenSymbol: string;
  tokenAddress: string;
  stakingAmount: string;
  currentPlayers: number;
  maxPlayers: number;
  gameType: 'memoryMatch' | 'quickDraw';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'waiting' | 'inProgress' | 'completed';
  createdAt: string;
  mode: 'singlePlayer' | 'multiplayer' | 'tournament';
}

export function GameLobby() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'myTokens'>('all');
  const [isJoiningGame, setIsJoiningGame] = useState<string | null>(null);
  const [showGameModal, setShowGameModal] = useState<GameInfo | null>(null);
  
  const { address, isConnected } = useAccount();
  const openUrl = useOpenUrl();

  // Load games on initial render
  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we'd fetch games from an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock games for demonstration
        const mockGames: GameInfo[] = [
          {
            id: '1',
            title: 'Memory Masters',
            creatorAddress: '0x123...456',
            creatorName: 'CryptoGamer',
            tokenSymbol: 'MEMO',
            tokenAddress: '0x789...012',
            stakingAmount: '10',
            currentPlayers: 2,
            maxPlayers: 4,
            gameType: 'memoryMatch',
            difficulty: 'medium',
            status: 'waiting',
            createdAt: new Date().toISOString(),
            mode: 'multiplayer'
          },
          {
            id: '2',
            title: 'Fast Fingers Tournament',
            creatorAddress: '0x345...678',
            creatorName: 'SpeedKing',
            tokenSymbol: 'FAST',
            tokenAddress: '0x901...234',
            stakingAmount: '25',
            currentPlayers: 6,
            maxPlayers: 8,
            gameType: 'quickDraw',
            difficulty: 'hard',
            status: 'inProgress',
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            mode: 'tournament'
          },
          {
            id: '3',
            title: 'Casual Memory Game',
            creatorAddress: '0x567...890',
            creatorName: 'RelaxedGamer',
            tokenSymbol: 'CHILL',
            tokenAddress: '0x123...456',
            stakingAmount: '5',
            currentPlayers: 1,
            maxPlayers: 2,
            gameType: 'memoryMatch',
            difficulty: 'easy',
            status: 'waiting',
            createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            mode: 'multiplayer'
          },
          {
            id: '4',
            title: 'Solo Challenge',
            creatorAddress: '0x789...012',
            creatorName: 'LoneWolf',
            tokenSymbol: 'SOLO',
            tokenAddress: '0x345...678',
            stakingAmount: '15',
            currentPlayers: 1,
            maxPlayers: 1,
            gameType: 'quickDraw',
            difficulty: 'medium',
            status: 'waiting',
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            mode: 'singlePlayer'
          }
        ];
        
        setGames(mockGames);
      } catch (err) {
        console.error('Failed to load games', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGames();
  }, []);

  // Load token balances for the connected wallet
  useEffect(() => {
    const loadTokenBalances = async () => {
      if (!isConnected || !address) return;
      
      const balances: Record<string, string> = {};
      
      // Get unique token addresses
      const tokenAddresses = [...new Set(games.map(game => game.tokenAddress))];
      
      // For each token, get the balance
      for (const tokenAddress of tokenAddresses) {
        try {
          const balance = await getTokenBalance(address, tokenAddress);
          balances[tokenAddress] = balance;
        } catch (err) {
          console.error('Failed to get token balance', err);
          balances[tokenAddress] = '0';
        }
      }
      
      setTokenBalances(balances);
    };
    
    if (games.length > 0) {
      loadTokenBalances();
    }
  }, [address, isConnected, games]);

  // Join a game
  const handleJoinGame = async (game: GameInfo) => {
    if (!isConnected) {
      setError('Please connect your wallet to join a game');
      return;
    }
    
    const balance = tokenBalances[game.tokenAddress] || '0';
    if (parseFloat(balance) < parseFloat(game.stakingAmount)) {
      // Create modal to buy tokens
      setShowGameModal(game);
      return;
    }
    
    setIsJoiningGame(game.id);
    
    try {
      // In a real app, we'd call an API to join the game
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to the game page
      window.location.href = `/game/${game.id}`;
    } catch (err) {
      console.error('Failed to join game', err);
      setError('Failed to join game. Please try again later.');
    } finally {
      setIsJoiningGame(null);
    }
  };

  // Buy tokens to play
  const handleBuyTokens = (game: GameInfo) => {
    // Open token purchase URL
    if (game.tokenSymbol === 'MEMO' || game.tokenSymbol === 'CHILL') {
      openUrl(`https://flaunch.gg/token/${game.tokenAddress}`);
    } else {
      openUrl(`https://zora.co/coin/base:${game.tokenAddress.toLowerCase()}`);
    }
  };

  // Filter games
  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(game => {
        const balance = tokenBalances[game.tokenAddress] || '0';
        return parseFloat(balance) > 0;
      });

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-green-500/20 text-green-500 border border-green-500/30';
      case 'inProgress':
        return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border border-gray-500/30';
    }
  };

  // Get difficulty badge styles
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-500 border border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-500 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border border-gray-500/30';
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  // Close token purchase modal
  const handleCloseModal = () => {
    setShowGameModal(null);
  };

  // Game type icon
  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'memoryMatch':
        return '🎮';
      case 'quickDraw':
        return '🎯';
      default:
        return '🎲';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (error && !games.length) {
    return (
      <div className="flex justify-center py-8 text-center text-[var(--app-foreground-muted)]">
        <div>
          <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
          <button 
            className="mt-3 px-4 py-1 text-xs font-medium bg-[var(--app-accent)] text-white rounded-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header and filter options */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Available Games
          </h2>
          <p className="text-xs text-[var(--app-foreground-muted)]">Join a game to win tokens</p>
        </div>
        
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/create-game'}
            className="rounded-full"
          >
            <span className="flex items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Create Game
            </span>
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border border-[var(--app-gray)] rounded-full overflow-hidden mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-medium flex-1 ${
            filter === 'all'
              ? 'bg-[var(--app-accent)] text-white'
              : 'text-[var(--app-foreground-muted)]'
          }`}
        >
          All Games
        </button>
        <button
          onClick={() => setFilter('myTokens')}
          className={`px-3 py-1 text-xs font-medium flex-1 ${
            filter === 'myTokens'
              ? 'bg-[var(--app-accent)] text-white'
              : 'text-[var(--app-foreground-muted)]'
          }`}
        >
          My Tokens
        </button>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Game list */}
      {filteredGames.length > 0 ? (
        <div className="space-y-3">
          {filteredGames.map((game) => {
            const balance = tokenBalances[game.tokenAddress] || '0';
            const hasEnoughTokens = parseFloat(balance) >= parseFloat(game.stakingAmount);
            
            return (
              <div 
                key={game.id} 
                className="border border-[var(--app-gray)] rounded-lg p-4 flex flex-col hover:border-[var(--app-accent)] transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">
                      {getGameTypeIcon(game.gameType)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{game.title}</h3>
                      <p className="text-xs text-[var(--app-foreground-muted)]">by {game.creatorName}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(game.status)}`}>
                      {game.status === 'waiting' ? 'Waiting' : game.status === 'inProgress' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-[var(--app-foreground-muted)]">Players</p>
                    <p className="text-sm">{game.currentPlayers}/{game.maxPlayers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-foreground-muted)]">Mode</p>
                    <p className="text-sm">{game.mode === 'singlePlayer' ? 'Single Player' : game.mode === 'multiplayer' ? 'Multiplayer' : 'Tournament'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--app-foreground-muted)]">Created</p>
                    <p className="text-sm">{formatRelativeTime(game.createdAt)}</p>
                  </div>
                </div>
                
                <div className="border-t border-[var(--app-gray)] my-2 pt-2 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(game.difficulty)}`}>
                      {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                    </span>
                    <span className="text-xs bg-[var(--app-gray)] px-2 py-0.5 rounded-full text-[var(--app-foreground-muted)]">
                      ${game.tokenSymbol}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xs text-[var(--app-foreground-muted)]">Stake to Play</p>
                      <p className="text-sm font-semibold">{game.stakingAmount} ${game.tokenSymbol}</p>
                    </div>
                    
                    <div>
                      <Button
                        variant={hasEnoughTokens ? "primary" : "secondary"}
                        size="sm"
                        className="rounded-full"
                        disabled={game.status !== 'waiting' || isJoiningGame === game.id}
                        onClick={() => handleJoinGame(game)}
                      >
                        {isJoiningGame === game.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                          </span>
                        ) : hasEnoughTokens ? 'Join Game' : 'Buy Tokens'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-[var(--app-gray)] rounded-lg">
          <svg className="w-12 h-12 mx-auto mb-3 text-[var(--app-foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <h3 className="text-lg font-semibold mb-1">No Games Found</h3>
          <p className="text-[var(--app-foreground-muted)] text-sm mb-3">
            {filter === 'myTokens' 
              ? "You don't have tokens for any available games" 
              : "There are no games available right now"}
          </p>
          {filter === 'myTokens' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              View All Games
            </Button>
          )}
        </div>
      )}

      {/* Token purchase modal */}
      {showGameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[var(--app-background)] p-6 rounded-xl w-4/5 max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Insufficient Tokens</h3>
              <button 
                className="text-[var(--app-foreground-muted)]"
                onClick={handleCloseModal}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm mb-4">
                You need at least <span className="font-bold">{showGameModal.stakingAmount} ${showGameModal.tokenSymbol}</span> to play this game.
              </p>
              
              <div className="bg-[var(--app-gray)] p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Your Balance:</span>
                  <span className="font-semibold">{tokenBalances[showGameModal.tokenAddress] || '0'} ${showGameModal.tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Required:</span>
                  <span className="font-semibold">{showGameModal.stakingAmount} ${showGameModal.tokenSymbol}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBuyTokens(showGameModal)}
                className="flex-1"
              >
                Buy Tokens
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 