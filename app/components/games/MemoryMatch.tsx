import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface CardProps {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (id: number) => void;
}

function Card({ id, emoji, isFlipped, isMatched, onClick }: CardProps) {
  return (
    <div
      onClick={() => !isFlipped && !isMatched && onClick(id)}
      className={`relative cursor-pointer w-full h-24 md:h-32 transition-transform duration-300 transform ${
        isFlipped || isMatched ? 'rotate-y-180' : ''
      }`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-lg text-3xl ${
          isFlipped || isMatched
            ? 'bg-[var(--app-accent)]/20 border-2 border-[var(--app-accent)] rotate-y-180'
            : 'bg-[var(--app-gray)] border border-[var(--app-gray-hover)]'
        } backface-hidden transition-colors duration-300`}
      >
        {(isFlipped || isMatched) ? emoji : '?'}
      </div>
    </div>
  );
}

interface MemoryMatchProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete: (score: number, timeElapsed: number) => void;
}

export function MemoryMatch({ difficulty = 'medium', onGameComplete }: MemoryMatchProps) {
  // Game emojis
  const emojis = [
    '🎮', '🎯', '🎲', '🎪', '🎭', '🎨', '🎬', '🎤',
    '🎧', '🎸', '🎹', '🎺', '🎻', '🎼', '🎵', '🎷',
    '🏆', '🏅', '🥇', '🥈', '🥉', '🏀', '⚽', '🏈',
    '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋'
  ];
  
  // Difficulty settings
  const difficultySettings = {
    easy: { pairs: 6, timeLimit: 60 },
    medium: { pairs: 8, timeLimit: 90 },
    hard: { pairs: 12, timeLimit: 120 },
  };
  
  const { pairs, timeLimit } = difficultySettings[difficulty];
  
  // Game state
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Game timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gameOver && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Game over - time's up
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [gameStarted, gameOver, timeLeft]);
  
  // Check for win condition
  useEffect(() => {
    if (matchedPairs === pairs && gameStarted && !gameOver) {
      // Game over - all pairs matched
      endGame(true);
    }
  }, [matchedPairs, pairs, gameStarted, gameOver]);
  
  // Check for card matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match found
        setCards(prevCards => 
          prevCards.map((card, idx) => 
            idx === firstId || idx === secondId
              ? { ...card, isMatched: true, isFlipped: false }
              : card
          )
        );
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map((card, idx) => 
              idx === firstId || idx === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);
  
  // Initialize game with shuffled cards
  const initializeGame = () => {
    // Create pairs of cards
    let selectedEmojis = [...emojis].sort(() => 0.5 - Math.random()).slice(0, pairs);
    let cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    // Shuffle the cards
    cardPairs = cardPairs.sort(() => 0.5 - Math.random());
    
    // Create card objects
    const newCards = cardPairs.map((emoji, id) => ({
      id,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(timeLimit);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (flippedCards.length < 2 && !flippedCards.includes(id)) {
      // Flip the card
      setCards(prevCards => 
        prevCards.map((card, idx) => 
          idx === id ? { ...card, isFlipped: true } : card
        )
      );
      
      setFlippedCards(prev => [...prev, id]);
    }
  };
  
  // End the game
  const endGame = (isWin: boolean) => {
    setGameOver(true);
    setGameStarted(false);
    
    // Calculate score based on remaining time, moves, and difficulty
    const timeBonus = timeLeft * 10;
    const movePenalty = moves * 5;
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    
    let finalScore = 0;
    
    if (isWin) {
      finalScore = Math.max(0, Math.round((1000 + timeBonus - movePenalty) * difficultyMultiplier));
      setScore(finalScore);
    }
    
    // Call the completion handler
    const timeElapsed = timeLimit - timeLeft;
    onGameComplete(finalScore, timeElapsed);
  };
  
  // Restart the game
  const handleRestart = () => {
    initializeGame();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Game header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-[var(--app-foreground-muted)]">Moves:</span>
          <span className="ml-1 font-semibold">{moves}</span>
        </div>
        <div>
          <span className="text-sm text-[var(--app-foreground-muted)]">Pairs:</span>
          <span className="ml-1 font-semibold">{matchedPairs}/{pairs}</span>
        </div>
        <div className={`${timeLeft < 10 ? 'text-red-500' : ''}`}>
          <span className="text-sm text-[var(--app-foreground-muted)]">Time:</span>
          <span className="ml-1 font-semibold">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      {/* Game grid */}
      <div 
        className={`grid gap-2 mb-4 ${
          difficulty === 'easy' ? 'grid-cols-3' : 
          difficulty === 'medium' ? 'grid-cols-4' : 
          'grid-cols-4 md:grid-cols-6'
        }`}
      >
        {cards.map(card => (
          <Card 
            key={card.id}
            id={card.id}
            emoji={card.emoji}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={handleCardClick}
          />
        ))}
      </div>
      
      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--app-background)] p-6 rounded-xl w-4/5 max-w-md">
            <h2 className="text-xl font-bold mb-2 text-center">
              {matchedPairs === pairs ? '🎉 You Win! 🎉' : '⏰ Time\'s Up! ⏰'}
            </h2>
            
            <div className="text-center mb-4">
              <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
                {matchedPairs === pairs 
                  ? `You matched all ${pairs} pairs in ${moves} moves!` 
                  : `You matched ${matchedPairs} out of ${pairs} pairs.`}
              </p>
              {matchedPairs === pairs && (
                <p className="text-lg font-semibold">
                  Score: <span className="text-[var(--app-accent)]">{score}</span>
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[var(--app-gray)] p-2 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Time</p>
                <p className="font-semibold">{formatTime(timeLimit - timeLeft)}</p>
              </div>
              <div className="bg-[var(--app-gray)] p-2 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Moves</p>
                <p className="font-semibold">{moves}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                className="flex-1 py-2 bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] rounded-lg text-sm font-medium"
                onClick={handleRestart}
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
          </div>
        </div>
      )}
      
      {/* Game instructions - shown before start */}
      {!gameStarted && !gameOver && (
        <div className="my-4 p-4 bg-[var(--app-gray)] rounded-lg text-center">
          <h3 className="font-semibold mb-2">Memory Match</h3>
          <p className="text-sm text-[var(--app-foreground-muted)] mb-3">
            Match all pairs of cards before time runs out.
          </p>
          <button
            className="px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg text-sm font-medium"
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
} 