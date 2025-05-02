import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface QuickDrawProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete: (score: number, timeElapsed: number) => void;
}

export function QuickDraw({ difficulty = 'medium', onGameComplete }: QuickDrawProps) {
  // Difficulty settings
  const difficultySettings = {
    easy: { rounds: 5, waitTimeRange: [3000, 6000] },
    medium: { rounds: 7, waitTimeRange: [2000, 5000] },
    hard: { rounds: 10, waitTimeRange: [1000, 4000] },
  };
  
  const { rounds, waitTimeRange } = difficultySettings[difficulty];
  
  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [tooEarly, setTooEarly] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [waitStartTime, setWaitStartTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  
  // Refs for timing
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooEarlyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game when difficulty changes
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
      if (tooEarlyTimeoutRef.current) clearTimeout(tooEarlyTimeoutRef.current);
    };
  }, []);
  
  // Handle countdown for game start
  useEffect(() => {
    if (gameStarted && countdownValue > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(countdownTimer);
    } else if (gameStarted && countdownValue === 0 && !ready && !waiting) {
      startRound();
    }
  }, [gameStarted, countdownValue, ready, waiting]);
  
  // Initialize game
  const initializeGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setReady(false);
    setWaiting(false);
    setTooEarly(false);
    setCurrentRound(1);
    setReactionTimes([]);
    setWaitStartTime(0);
    setScore(0);
    setCountdownValue(3);
    
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    if (tooEarlyTimeoutRef.current) clearTimeout(tooEarlyTimeoutRef.current);
  };
  
  // Start a new round
  const startRound = () => {
    setReady(true);
    setWaiting(false);
    setTooEarly(false);
    
    // Random wait time based on difficulty
    const [min, max] = waitTimeRange;
    const waitTime = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Wait before showing the target
    waitTimeoutRef.current = setTimeout(() => {
      setReady(false);
      setWaiting(true);
      setWaitStartTime(Date.now());
    }, waitTime);
  };
  
  // Handle user click
  const handleClick = () => {
    // If the game hasn't started yet
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    
    // If waiting for countdown
    if (countdownValue > 0) {
      return;
    }
    
    // If ready (waiting for target), clicked too early
    if (ready) {
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
      
      setReady(false);
      setWaiting(false);
      setTooEarly(true);
      
      // Add a penalty time
      setReactionTimes(prev => [...prev, 2000]);
      
      // Wait before starting next round
      tooEarlyTimeoutRef.current = setTimeout(() => {
        if (currentRound < rounds) {
          setCurrentRound(prev => prev + 1);
          startRound();
        } else {
          endGame();
        }
      }, 2000);
      
      return;
    }
    
    // If waiting for click (target shown)
    if (waiting) {
      const reactionTime = Date.now() - waitStartTime;
      setReactionTimes(prev => [...prev, reactionTime]);
      
      setWaiting(false);
      
      // If all rounds completed, end game
      if (currentRound >= rounds) {
        endGame();
      } else {
        // Otherwise, start next round
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }
  };
  
  // End the game
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    setReady(false);
    setWaiting(false);
    
    // Calculate average reaction time (excluding penalties)
    const validTimes = reactionTimes.filter(time => time < 2000);
    const avgReactionTime = validTimes.length > 0
      ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
      : 0;
    
    // Calculate final score
    // Better scores for faster reaction times
    const penaltyCount = reactionTimes.length - validTimes.length;
    const baseScore = 1000 - Math.min(avgReactionTime, 1000);
    const penaltyDeduction = penaltyCount * 200;
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    
    const finalScore = Math.max(0, Math.round((baseScore - penaltyDeduction) * difficultyMultiplier));
    setScore(finalScore);
    
    // Call the completion handler
    const totalTimeElapsed = reactionTimes.reduce((sum, time) => sum + time, 0) / 1000;
    onGameComplete(finalScore, totalTimeElapsed);
  };
  
  // Get average reaction time
  const getAverageReactionTime = () => {
    const validTimes = reactionTimes.filter(time => time < 2000);
    if (validTimes.length === 0) return 0;
    return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  };
  
  // Format reaction time
  const formatReactionTime = (ms: number) => {
    return ms < 2000 ? `${ms}ms` : 'Too Early!';
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Game header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-[var(--app-foreground-muted)]">Round:</span>
          <span className="ml-1 font-semibold">{currentRound}/{rounds}</span>
        </div>
        {reactionTimes.length > 0 && (
          <div>
            <span className="text-sm text-[var(--app-foreground-muted)]">Last:</span>
            <span className="ml-1 font-semibold">
              {formatReactionTime(reactionTimes[reactionTimes.length - 1])}
            </span>
          </div>
        )}
      </div>
      
      {/* Game area */}
      <div
        onClick={handleClick}
        className={`w-full aspect-square rounded-xl flex items-center justify-center text-center p-6 cursor-pointer transition-colors duration-200 ${
          !gameStarted 
            ? 'bg-[var(--app-gray)]'
            : countdownValue > 0
              ? 'bg-yellow-500/50'
              : tooEarly
                ? 'bg-red-500/50'
                : ready
                  ? 'bg-[var(--app-gray)]'
                  : waiting
                    ? 'bg-green-500/50'
                    : gameOver
                      ? 'bg-blue-500/50'
                      : 'bg-[var(--app-gray)]'
        }`}
      >
        {!gameStarted ? (
          <div>
            <h2 className="text-xl font-bold mb-2">Quick Draw</h2>
            <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
              Test your reaction time! Click when you see green, but not before!
            </p>
            <p className="font-medium">Click to Start</p>
          </div>
        ) : countdownValue > 0 ? (
          <div className="text-4xl font-bold">{countdownValue}</div>
        ) : tooEarly ? (
          <div>
            <h2 className="text-2xl font-bold mb-2">Too Early!</h2>
            <p className="text-[var(--app-foreground-muted)]">Wait for green before clicking</p>
          </div>
        ) : ready ? (
          <div>
            <h2 className="text-2xl font-bold mb-2">Get Ready...</h2>
            <p className="text-[var(--app-foreground-muted)]">Wait for green</p>
          </div>
        ) : waiting ? (
          <div>
            <h2 className="text-3xl font-bold mb-2">CLICK NOW!</h2>
          </div>
        ) : (
          <div>
            <p className="text-[var(--app-foreground-muted)]">Get ready for next round</p>
          </div>
        )}
      </div>
      
      {/* Reaction times history */}
      {reactionTimes.length > 0 && !gameOver && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Reaction Times:</h3>
          <div className="flex flex-wrap gap-2">
            {reactionTimes.map((time, index) => (
              <div 
                key={index}
                className={`px-2 py-1 rounded-lg text-xs ${
                  time >= 2000
                    ? 'bg-red-500/20 text-red-500'
                    : time < 300
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-[var(--app-gray)]'
                }`}
              >
                {formatReactionTime(time)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--app-background)] p-6 rounded-xl w-4/5 max-w-md">
            <h2 className="text-xl font-bold mb-2 text-center">
              🎯 Game Complete! 🎯
            </h2>
            
            <div className="text-center mb-4">
              <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
                You completed {rounds} rounds of Quick Draw!
              </p>
              <p className="text-lg font-semibold">
                Score: <span className="text-[var(--app-accent)]">{score}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[var(--app-gray)] p-2 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Avg. Reaction Time</p>
                <p className="font-semibold">{Math.round(getAverageReactionTime())}ms</p>
              </div>
              <div className="bg-[var(--app-gray)] p-2 rounded-lg text-center">
                <p className="text-xs text-[var(--app-foreground-muted)]">Too Early Clicks</p>
                <p className="font-semibold">{reactionTimes.filter(t => t >= 2000).length}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Reaction Times:</h3>
              <div className="flex flex-wrap gap-2">
                {reactionTimes.map((time, index) => (
                  <div 
                    key={index}
                    className={`px-2 py-1 rounded-lg text-xs ${
                      time >= 2000
                        ? 'bg-red-500/20 text-red-500'
                        : time < 300
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-[var(--app-gray)]'
                    }`}
                  >
                    {index + 1}: {formatReactionTime(time)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                className="flex-1 py-2 bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] rounded-lg text-sm font-medium"
                onClick={initializeGame}
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
    </div>
  );
} 