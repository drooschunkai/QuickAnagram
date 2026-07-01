import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, ArrowRight, Award, Flame, HelpCircle, Trophy } from 'lucide-react';

interface AnagramLevel {
  sourceWord: string;
  targetWord: string;
  hint: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const ANAGRAM_LEVELS: AnagramLevel[] = [
  { sourceWord: 'ELBOW', targetWord: 'BELOW', hint: 'Underneath, or in a lower position.', difficulty: 'Easy' },
  { sourceWord: 'LISTEN', targetWord: 'SILENT', hint: 'Making no sound; completely quiet.', difficulty: 'Medium' },
  { sourceWord: 'DUSTY', targetWord: 'STUDY', hint: 'To devote time and attention to acquiring knowledge.', difficulty: 'Easy' },
  { sourceWord: 'EARTH', targetWord: 'HEART', hint: 'The vital organ that pumps blood through the body.', difficulty: 'Medium' },
  { sourceWord: 'NIGHT', targetWord: 'THING', hint: 'An object, entity, or article.', difficulty: 'Easy' },
  { sourceWord: 'STEAL', targetWord: 'SLATE', hint: 'A fine-grained grey, green, or blue metamorphic rock.', difficulty: 'Hard' },
  { sourceWord: 'RETAIN', targetWord: 'TEARIN', hint: 'To rip apart or rip into with force (slang/poetic: tearing).', difficulty: 'Hard' }
];

// Shuffle letters of the source word
const shuffleLetters = (word: string): string[] => {
  const letters = word.split('');
  let shuffled = [...letters];
  let attempts = 0;
  while (attempts < 20) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Make sure it doesn't match the target word or the source word if possible
    if (shuffled.join('') !== word) {
      break;
    }
    attempts++;
  }
  return shuffled;
};

interface AnagramGameProps {
  isDarkMode: boolean;
}

export function AnagramGame({ isDarkMode }: AnagramGameProps) {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<AnagramLevel>(ANAGRAM_LEVELS[0]);
  
  // Available tiles in shuffled order of the source word
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string }[]>([]);
  // Placed tiles in current guess
  const [guessTiles, setGuessTiles] = useState<{ id: string; letter: string }[]>([]);
  
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('anagram_high_score');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  
  const [gameState, setGameState] = useState<'playing' | 'success' | 'fail'>('playing');
  const [shake, setShake] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Initialize a level
  const initLevel = useCallback((index: number) => {
    const level = ANAGRAM_LEVELS[index % ANAGRAM_LEVELS.length];
    setCurrentLevel(level);
    
    // We shuffle the source word's letters to let user find the anagram (the target word)
    const shuffled = shuffleLetters(level.sourceWord);
    
    setAvailableTiles(shuffled.map((letter, idx) => ({
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

  // Reset the current level
  const resetLevel = () => {
    const shuffled = shuffleLetters(currentLevel.sourceWord);
    setAvailableTiles(shuffled.map((letter, idx) => ({
      id: `${letter}-${idx}-${Math.random()}`,
      letter,
    })));
    setGuessTiles([]);
    setGameState('playing');
  };

  // Handle checking of the word
  const checkWord = () => {
    const currentGuess = guessTiles.map(t => t.letter).join('');
    if (currentGuess === currentLevel.targetWord) {
      setGameState('success');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem('anagram_high_score', String(newStreak));
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setStreak(0); // Reset streak on incorrect check
    }
  };

  // Skip level or load next level
  const nextLevel = () => {
    const nextIdx = (levelIndex + 1) % ANAGRAM_LEVELS.length;
    setLevelIndex(nextIdx);
    initLevel(nextIdx);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key.toUpperCase();
      
      if (e.key === 'Backspace') {
        if (guessTiles.length > 0) {
          const lastTile = guessTiles[guessTiles.length - 1];
          deselectTile(lastTile);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (guessTiles.length === currentLevel.targetWord.length) {
          checkWord();
        }
        return;
      }

      const foundTileIndex = availableTiles.findIndex(t => t.letter === key);
      if (foundTileIndex !== -1) {
        const foundTile = availableTiles[foundTileIndex];
        selectTile(foundTile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableTiles, guessTiles, gameState, currentLevel]);

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-3xl p-6 md:p-8 border ${
      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
    } shadow-lg backdrop-blur-sm transition-all duration-300`}>
      
      {/* Top bar with level & stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-dashed border-slate-700/20">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          <span className="font-bold text-sm">
            Level {levelIndex + 1} of {ANAGRAM_LEVELS.length}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
            currentLevel.difficulty === 'Easy' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : currentLevel.difficulty === 'Medium'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {currentLevel.difficulty}
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
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Source Word:
          </span>
          <span className={`text-lg md:text-xl font-black tracking-widest px-4 py-1.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800 text-teal-400' : 'bg-white border-slate-200 text-teal-600 shadow-sm'
          }`}>
            {currentLevel.sourceWord}
          </span>
        </div>

        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-2">
          Your Anagram Guess:
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
                id={`guess-anagram-${tile.id}`}
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
                Rearrange the letters to form an entirely new word...
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Available Letter Tiles */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
          Letters Pool:
        </span>
        
        <div className="flex flex-wrap justify-center gap-2 min-h-[56px]">
          <AnimatePresence>
            {availableTiles.map((tile) => (
              <motion.span
                id={`pool-anagram-${tile.id}`}
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
          {showHint ? 'Hide Anagram Hint' : 'Need a Clue? Reveal Hint'}
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
                {currentLevel.hint}
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
              id="game-anagram-shuffle-btn"
              onClick={resetLevel}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs border cursor-pointer hover:bg-slate-500/10 active:scale-95 transition-all ${
                isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-300 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Letters
            </button>
            <button
              id="game-anagram-check-btn"
              disabled={guessTiles.length !== currentLevel.targetWord.length}
              onClick={checkWord}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg shadow-teal-500/10 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode ? 'bg-teal-500 hover:bg-teal-400' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Verify Anagram
            </button>
            <button
              id="game-anagram-skip-btn"
              onClick={nextLevel}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-500/10 active:scale-95 transition-all ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Skip Level
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
                🎯 Anagram Solved! Incredible Cognitive Flexibility!
              </p>
              <p className="text-xs text-slate-400">
                You successfully transformed <span className="font-bold text-teal-400">{currentLevel.sourceWord}</span> into its anagram <span className="font-bold text-teal-400">{currentLevel.targetWord}</span>.
              </p>
            </div>
            
            <button
              id="game-anagram-next-btn"
              onClick={nextLevel}
              className={`flex items-center gap-1.5 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer active:scale-95 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/20' 
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/20'
              }`}
            >
              Play Next Level
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

    </div>
  );
}
