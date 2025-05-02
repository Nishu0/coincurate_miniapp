import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useOpenUrl } from '@coinbase/onchainkit/minikit';
import { createLaunchFlaunchToken, createZoraToken } from '../services/tokenService';

// Simple button component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
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
    secondary: 'bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] text-[var(--app-foreground)]'
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

// Game difficulty
type GameDifficulty = 'easy' | 'medium' | 'hard';

// Game modes
type GameMode = 'singlePlayer' | 'multiplayer' | 'tournament';

export function GameCreation() {
  // Token creation state
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenPlatform, setTokenPlatform] = useState<'flaunch' | 'zora'>('flaunch');
  const [creatorShare, setCreatorShare] = useState<number>(50); // Default 50%

  // Game setup state
  const [gameTitle, setGameTitle] = useState<string>('');
  const [gameDescription, setGameDescription] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('multiplayer');
  const [stakingAmount, setStakingAmount] = useState<string>('10');
  const [creatorReward, setCreatorReward] = useState<string>('20');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('medium');
  const [isCreatingToken, setIsCreatingToken] = useState<boolean>(false);
  const [tokenCreationError, setTokenCreationError] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<string>('memoryMatch');

  // Form step tracking
  const [currentStep, setCurrentStep] = useState<'token' | 'game' | 'review'>('token');
  
  const { address, isConnected } = useAccount();
  const openUrl = useOpenUrl();

  // Check if user already has a token
  useEffect(() => {
    // This would typically be an API call to check if the connected wallet
    // has created a token before. For now, we'll simulate it.
    const checkExistingToken = async () => {
      if (isConnected && address) {
        // Simulated check - would query Flaunch/Zora API in production
        // For demo, we'll randomly decide
        const randomHasToken = Math.random() > 0.5;
        
        if (randomHasToken) {
          setHasToken(true);
          setTokenSymbol('DEMO');
          setTokenName('Demo Token');
        }
      }
    };

    checkExistingToken();
  }, [address, isConnected]);

  // Create a new token
  const handleCreateToken = async () => {
    if (!tokenName || !tokenSymbol) {
      setTokenCreationError('Please enter both token name and symbol');
      return;
    }

    setIsCreatingToken(true);
    setTokenCreationError(null);

    try {
      if (tokenPlatform === 'flaunch') {
        await createLaunchFlaunchToken(tokenName, tokenSymbol, creatorShare);
      } else {
        await createZoraToken(tokenName, tokenSymbol);
      }
      setHasToken(true);
      setCurrentStep('game');
    } catch (error) {
      console.error('Failed to create token:', error);
      setTokenCreationError('Failed to create token. Please try again.');
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Open Flaunch to create a token
  const handleOpenFlaunch = () => {
    openUrl(`https://flaunch.gg/create`);
  };

  // Create a new game
  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    
    try {
      // Here we would call an API to create a new game
      // For now, we'll just simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to the game page or show success
      alert('Game created successfully!');
      window.location.href = '/game-lobby';
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  // Go to next step
  const handleNextStep = () => {
    if (currentStep === 'token') {
      setCurrentStep('game');
    } else if (currentStep === 'game') {
      setCurrentStep('review');
    } else {
      handleCreateGame();
    }
  };

  // Go to previous step
  const handlePrevStep = () => {
    if (currentStep === 'game') {
      setCurrentStep('token');
    } else if (currentStep === 'review') {
      setCurrentStep('game');
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-[var(--app-foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-[var(--app-foreground-muted)] mb-4">Connect your wallet to create a game with your token</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress steps */}
      <div className="flex justify-between mb-6">
        <div 
          className={`flex flex-col items-center ${currentStep === 'token' ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground-muted)]'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'token' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}>
            1
          </div>
          <span className="text-xs mt-1">Token</span>
        </div>
        <div className={`flex-1 h-0.5 mt-4 ${currentStep === 'token' ? 'bg-[var(--app-gray)]' : 'bg-[var(--app-accent)]'}`}></div>
        <div 
          className={`flex flex-col items-center ${currentStep === 'game' ? 'text-[var(--app-accent)]' : currentStep === 'review' ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground-muted)]'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'game' ? 'bg-[var(--app-accent)] text-white' : currentStep === 'review' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}>
            2
          </div>
          <span className="text-xs mt-1">Game</span>
        </div>
        <div className={`flex-1 h-0.5 mt-4 ${currentStep === 'review' ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-gray)]'}`}></div>
        <div 
          className={`flex flex-col items-center ${currentStep === 'review' ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground-muted)]'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}>
            3
          </div>
          <span className="text-xs mt-1">Review</span>
        </div>
      </div>

      {/* Token step */}
      {currentStep === 'token' && (
        <div className="space-y-6">
          <div className="bg-[var(--app-gray-hover)] p-4 rounded-lg mb-4">
            <h2 className="text-lg font-bold mb-2">Token Setup</h2>

            {hasToken ? (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="font-medium">You already have a token: ${tokenSymbol}</p>
                </div>
                <p className="text-xs mt-1 text-[var(--app-foreground-muted)]">Your existing token will be used for this game</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-[var(--app-foreground-muted)] mb-3">
                    Create a token that players will need to stake to play your game.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Token Platform</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTokenPlatform('flaunch')}
                      className={`px-3 py-2 text-sm flex-1 rounded-lg ${tokenPlatform === 'flaunch' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                    >
                      Flaunch
                    </button>
                    <button
                      onClick={() => setTokenPlatform('zora')}
                      className={`px-3 py-2 text-sm flex-1 rounded-lg ${tokenPlatform === 'zora' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                    >
                      Zora
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
                    placeholder="My Game Token"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Token Symbol (6 chars max)</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().substring(0, 6))}
                    className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
                    placeholder="GAME"
                  />
                </div>

                {tokenPlatform === 'flaunch' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Creator Share: {creatorShare}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creatorShare}
                      onChange={(e) => setCreatorShare(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[var(--app-foreground-muted)]">
                      <span>0% (All to Community)</span>
                      <span>100% (All to Creator)</span>
                    </div>
                  </div>
                )}

                {tokenCreationError && (
                  <div className="text-red-500 text-sm mb-4">{tokenCreationError}</div>
                )}

                <div className="flex space-x-3 mb-4 mt-6">
                  <Button
                    variant="primary"
                    onClick={handleCreateToken}
                    disabled={isCreatingToken}
                    className="flex-1 rounded-lg"
                  >
                    {isCreatingToken ? 'Creating...' : 'Create Token with SDK'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleOpenFlaunch}
                    disabled={isCreatingToken}
                    className="flex-1 rounded-lg"
                  >
                    Open Flaunch Website
                  </Button>
                </div>
              </>
            )}
            
            <div className="mt-4 pt-4 border-t border-[var(--app-gray)]">
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={!hasToken && isCreatingToken}
                className="w-full rounded-lg"
              >
                Next: Configure Game
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game setup step */}
      {currentStep === 'game' && (
        <div className="space-y-6">
          <div className="bg-[var(--app-gray-hover)] p-4 rounded-lg mb-4">
            <h2 className="text-lg font-bold mb-4">Game Configuration</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Game Title</label>
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
                placeholder="Awesome Game"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
                rows={2}
                placeholder="Short description of your game"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Game Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedGame('memoryMatch')}
                  className={`p-3 rounded-lg border ${selectedGame === 'memoryMatch' ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10' : 'border-[var(--app-gray)]'}`}
                >
                  <div className="text-center">
                    <div className="mb-1">🎮</div>
                    <div className="font-medium">Memory Match</div>
                    <div className="text-xs text-[var(--app-foreground-muted)]">Card matching game</div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedGame('quickDraw')}
                  className={`p-3 rounded-lg border ${selectedGame === 'quickDraw' ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10' : 'border-[var(--app-gray)]'}`}
                >
                  <div className="text-center">
                    <div className="mb-1">🎯</div>
                    <div className="font-medium">Quick Draw</div>
                    <div className="text-xs text-[var(--app-foreground-muted)]">Reaction test game</div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Game Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setGameMode('singlePlayer')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameMode === 'singlePlayer' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Single Player
                </button>
                <button
                  onClick={() => setGameMode('multiplayer')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameMode === 'multiplayer' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Multiplayer
                </button>
                <button
                  onClick={() => setGameMode('tournament')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameMode === 'tournament' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Tournament
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setGameDifficulty('easy')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameDifficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setGameDifficulty('medium')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameDifficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setGameDifficulty('hard')}
                  className={`px-3 py-2 text-xs flex-1 rounded-lg ${gameDifficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-[var(--app-gray)] text-[var(--app-foreground)]'}`}
                >
                  Hard
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Staking Amount (${tokenSymbol})</label>
              <input
                type="number"
                min="1"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
              />
              <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                Amount each player must stake to join the game
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Creator Reward (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={creatorReward}
                onChange={(e) => setCreatorReward(e.target.value)}
                className="w-full p-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-gray-hover)]"
              />
              <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                Percentage of staked tokens you'll receive as the creator
              </p>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                className="flex-1 rounded-lg"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStep}
                className="flex-1 rounded-lg"
              >
                Review Game
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review step */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <div className="bg-[var(--app-gray-hover)] p-4 rounded-lg mb-4">
            <h2 className="text-lg font-bold mb-4">Review & Launch</h2>
            
            <div className="mb-4 p-3 bg-[var(--app-gray)] rounded-lg">
              <h3 className="font-medium">Token Details</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="text-[var(--app-foreground-muted)]">Token:</div>
                <div>${tokenSymbol}</div>
                <div className="text-[var(--app-foreground-muted)]">Platform:</div>
                <div>{tokenPlatform === 'flaunch' ? 'Flaunch' : 'Zora'}</div>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-[var(--app-gray)] rounded-lg">
              <h3 className="font-medium">Game Details</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="text-[var(--app-foreground-muted)]">Title:</div>
                <div>{gameTitle || 'Untitled Game'}</div>
                <div className="text-[var(--app-foreground-muted)]">Game Type:</div>
                <div>{selectedGame === 'memoryMatch' ? 'Memory Match' : 'Quick Draw'}</div>
                <div className="text-[var(--app-foreground-muted)]">Mode:</div>
                <div>{gameMode === 'singlePlayer' ? 'Single Player' : gameMode === 'multiplayer' ? 'Multiplayer' : 'Tournament'}</div>
                <div className="text-[var(--app-foreground-muted)]">Difficulty:</div>
                <div>{gameDifficulty.charAt(0).toUpperCase() + gameDifficulty.slice(1)}</div>
                <div className="text-[var(--app-foreground-muted)]">Stake Amount:</div>
                <div>{stakingAmount} ${tokenSymbol}</div>
                <div className="text-[var(--app-foreground-muted)]">Creator Cut:</div>
                <div>{creatorReward}%</div>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-0.5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-sm">
                  Players will need to stake <span className="font-bold">{stakingAmount} ${tokenSymbol}</span> to join this game. 
                  The winner will receive <span className="font-bold">{100 - parseInt(creatorReward)}%</span> of the total pool, 
                  and you'll receive <span className="font-bold">{creatorReward}%</span> as the creator.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                className="flex-1 rounded-lg"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateGame}
                disabled={isCreatingGame}
                className="flex-1 rounded-lg"
              >
                {isCreatingGame ? 'Creating...' : 'Create Game'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 