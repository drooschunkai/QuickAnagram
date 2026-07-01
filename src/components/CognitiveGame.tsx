import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, ArrowRight, Award, Flame, HelpCircle, Trophy } from 'lucide-react';

interface WordLevel {
  word: string;
  hint: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const GAME_WORDS: WordLevel[] = [
  { word: 'ANAGRAM', hint: 'A word formed by rearranging the letters of another.', difficulty: 'Medium' },
  { word: 'SOLVER', hint: 'An engine or program designed to find a solution to a scramble.', difficulty: 'Easy' },
  { word: 'SCRABBLE', hint: 'The classic board game of tiles, premium multipliers, and dictionary rules.', difficulty: 'Medium' },
  { word: 'COGNITIVE', hint: 'Relating to mental processes of perception, memory, and pattern recognition.', difficulty: 'Hard' },
  { word: 'PATTERN', hint: 'A repeated decorative design or recognizable sequence of letters.', difficulty: 'Easy' },
  { word: 'BRAIN', hint: 'The organ serving as the center of sensation, memory, and cognitive training.', difficulty: 'Easy' },
  { word: 'WORDLE', hint: 'A viral daily online game where players guess a 5-letter secret word.', difficulty: 'Easy' },
  { word: 'NEUROPLASTICITY', hint: 'The brain\'s ability to reorganize itself by forming new neural connections.', difficulty: 'Hard' },
  { word: 'UNSCRAMBLE', hint: 'To restore a jumbled sequence of letters back to its original readable word.', difficulty: 'Medium' },
  { word: 'SYNAPSE', hint: 'A junction between two nerve cells, crucial for mental processing speed.', difficulty: 'Hard' },
];

// Helper to scramble a word safely ensuring it does not equal the original word
const scrambleWord = (word: string): string[] => {
  const letters = word.split('');
  let scrambled = [...letters];
  let attempts = 0;
  while (attempts < 20) {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    if (scrambled.join('') !== word) {
      break;
    }
    attempts++;
  }
  return scrambled;
};

interface CognitiveGameProps {
  isDarkMode: boolean;
}

export function CognitiveGame({ isDarkMode }: CognitiveGameProps) {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [currentWordObj, setCurrentWordObj] = useState<WordLevel>(GAME_WORDS[0]);
  
  // Available tiles in scrambled order. We use objects with unique ids so duplicate letters don't collide
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string }[]>([]);
  // Placed tiles in current guess
  const [guessTiles, setGuessTiles] = useState<{ id: string; letter: string }[]>([]);
  
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unscrambler_high_score');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  
  const [gameState, setGameState] = useState<'playing' | 'success' | 'fail'>('playing');
  const [shake, setShake] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Initialize a level
  const initLevel = useCallback((index: number) => {
    const level = GAME_WORDS[index % GAME_WORDS.length];
    setCurrentWordObj(level);
    const scrambled = scrambleWord(level.word);
    
    setAvailableTiles(scrambled.map((letter, idx) => ({
      id: `${letter}-${idx}-${Math.random()}`,
      letter,
    })));
    setGuessTiles([]);
    setGameState('playing');
    setShowHint(false);
  }, []);

  useEffect(() => {
    initLevel(0);
  }, [initLevel]);

  // Click handler to select a tile
  const selectTile = (tile: { id: string; letter: string }) => {
    if (gameState !== 'playing') return;
    setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
    setGuessTiles(prev => [...prev, tile]);
  };

  // Click handler to unselect a tile
  const deselectTile = (tile: { id: string; letter: string }) => {
    if (gameState !== 'playing') return;
    setGuessTiles(prev => prev.filter(t => t.id !== tile.id));
    setAvailableTiles(prev => [...prev, tile]);
  };

  // Reset the current level (scramble again, clear guess)
  const resetLevel = () => {
    const scrambled = scrambleWord(currentWordObj.word);
    setAvailableTiles(scrambled.map((letter, idx) => ({
      id: `${letter}-${idx}-${Math.random()}`,
      letter,
    })));
    setGuessTiles([]);
    setGameState('playing');
  };

  // Handle checking of the word
  const checkWord = () => {
    const currentGuess = guessTiles.map(t => t.letter).join('');
    if (currentGuess === currentWordObj.word) {
      setGameState('success');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem('unscrambler_high_score', String(newStreak));
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setStreak(0); // Reset streak on incorrect check
    }
  };

  // Skip level or load next level
  const nextLevel = () => {
    const nextIdx = (levelIndex + 1) % GAME_WORDS.length;
    setLevelIndex(nextIdx);
    initLevel(nextIdx);
  };

  // Keyboard support for typing!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key.toUpperCase();
      
      // Handle backspace to deselect the last tile
      if (e.key === 'Backspace') {
        if (guessTiles.length > 0) {
          const lastTile = guessTiles[guessTiles.length - 1];
          deselectTile(lastTile);
        }
        return;
      }

      // Handle Enter to check the word
      if (e.key === 'Enter') {
        if (guessTiles.length === currentWordObj.word.length) {
          checkWord();
        }
        return;
      }

      // Find if the typed letter is available
      const foundTileIndex = availableTiles.findIndex(t => t.letter === key);
      if (foundTileIndex !== -1) {
        const foundTile = availableTiles[foundTileIndex];
        selectTile(foundTile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableTiles, guessTiles, gameState, currentWordObj]);

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 border ${
      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
    } shadow-lg backdrop-blur-sm transition-all duration-300`}>
      
      {/* Top bar with level & stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-dashed border-slate-700/20">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <span className="font-bold text-sm">
            Level {levelIndex + 1} of {GAME_WORDS.length}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
            currentWordObj.difficulty === 'Easy' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : currentWordObj.difficulty === 'Medium'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {currentWordObj.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5" title="Current Solve Streak">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span>Streak: <span className="text-orange-500 text-sm font-black">{streak}</span></span>
          </div>
          <div className="flex items-center gap-1.5" title="Personal Best Streak">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Best: <span className="text-amber-500">{highScore}</span></span>
          </div>
        </div>
      </div>

      {/* Target Word Frame / Current Guess Grid */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
          Your Unscrambled Guess:
        </span>
        
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`flex flex-wrap justify-center gap-2 min-h-[56px] w-full p-2.5 rounded-2xl border ${
            shake ? 'border-rose-500/50 bg-rose-500/5' : ''
          } ${
            gameState === 'success' 
              ? 'border-green-500 bg-green-500/5' 
              : isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white'
          } transition-all duration-200`}
        >
          <AnimatePresence mode="popLayout">
            {guessTiles.map((tile) => (
              <motion.span
                id={`guess-${tile.id}`}
                layoutId={tile.id}
                key={tile.id}
                onClick={() => deselectTile(tile)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border flex items-center justify-center font-black text-lg md:text-xl cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all select-none ${
                  gameState === 'success'
                    ? 'bg-green-500 border-green-600 text-white shadow-md shadow-green-900/10'
                    : isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white hover:border-teal-400 shadow-md shadow-black/30' 
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-teal-600 shadow-sm'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {tile.letter}
              </motion.span>
            ))}
            {guessTiles.length === 0 && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="self-center text-xs font-medium text-slate-400 italic py-3 select-none"
              >
                Click available tiles below or type them on your keyboard...
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Available Scrambled Letter Tiles */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
          Letters Pool (Scrambled):
        </span>
        
        <div className="flex flex-wrap justify-center gap-2 min-h-[56px]">
          <AnimatePresence>
            {availableTiles.map((tile) => (
              <motion.span
                id={`pool-${tile.id}`}
                layoutId={tile.id}
                key={tile.id}
                onClick={() => selectTile(tile)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border flex items-center justify-center font-black text-lg md:text-xl cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all select-none ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white hover:border-teal-400 shadow-md shadow-black/40' 
                    : 'bg-white border-slate-250 text-slate-800 hover:border-teal-600 shadow-sm'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {tile.letter}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Hint & Helper row */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <button
          onClick={() => setShowHint(prev => !prev)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
            showHint 
              ? (isDarkMode ? 'text-teal-400' : 'text-teal-600')
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          {showHint ? 'Hide Definition Hint' : 'Need a Clue? Reveal Hint'}
        </button>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full max-w-lg text-center"
            >
              <div className={`p-3 rounded-xl text-xs font-semibold leading-relaxed border ${
                isDarkMode 
                  ? 'bg-teal-950/20 border-teal-500/20 text-teal-300' 
                  : 'bg-teal-50 border-teal-200 text-teal-800'
              }`}>
                {currentWordObj.hint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons Grid */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {gameState === 'playing' ? (
          <>
            <button
              id="game-shuffle-btn"
              onClick={resetLevel}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs border cursor-pointer hover:bg-slate-500/10 active:scale-95 transition-all ${
                isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-300 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Shuffle Tiles
            </button>
            <button
              id="game-check-btn"
              disabled={guessTiles.length !== currentWordObj.word.length}
              onClick={checkWord}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg shadow-teal-500/10 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode ? 'bg-teal-500 hover:bg-teal-400' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Verify Solution
            </button>
            <button
              id="game-skip-btn"
              onClick={nextLevel}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-500/10 active:scale-95 transition-all ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Skip Word
            </button>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 w-full text-center"
          >
            <div className={`p-4 rounded-2xl border text-center ${
              isDarkMode ? 'bg-green-950/20 border-green-500/20' : 'bg-green-50 border-green-200'
            }`}>
              <p className={`font-black text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                🎯 Solved Successfully! Excellent Brain Training!
              </p>
              <p className="text-xs text-slate-400">
                You unscrambled <span className="font-bold text-teal-400">{currentWordObj.word}</span> correctly.
              </p>
            </div>
            
            <button
              id="game-next-btn"
              onClick={nextLevel}
              className={`flex items-center gap-1.5 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer active:scale-95 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/20' 
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/20'
              }`}
            >
              Play Next Word
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

    </div>
  );
}
