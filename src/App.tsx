import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Copy, Check, Menu, Info, Zap, Github, ExternalLink, ArrowLeft, Mail, MessageSquare, Book, Share2, X, Loader2, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ABOUT_CONTENT, FAQ_ITEMS, POLICY_CONTENT, TERMS_CONTENT } from './content.ts';
import { BLOG_POSTS, BlogPost } from './blogData.ts';
import { BlogLayout } from './components/BlogLayout.tsx';

type View = 'home' | 'blog' | 'about' | 'contact' | 'dictionary' | 'policy' | 'terms';

interface Definition {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

const DICTIONARY_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'unscramble' | 'anagram'>('unscramble');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [results, setResults] = useState<Record<number, string[]>>({});
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<Definition | null>(null);
  const [isDefining, setIsDefining] = useState(false);
  const [dictInput, setDictInput] = useState('');
  const [sharedWord, setSharedWord] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load dictionary
  useEffect(() => {
    async function loadDictionary() {
      try {
        const response = await fetch(DICTIONARY_URL);
        const text = await response.text();
        const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length >= 2 && w.length <= 15);
        setDictionary(words);
      } catch (err) {
        console.error('Failed to load dictionary:', err);
        setError('Failed to load dictionary. Please refresh.');
      }
    }
    loadDictionary();
  }, []);

  const navigateTo = (newView: View, slug?: string) => {
    setView(newView);
    if (slug) {
      const post = BLOG_POSTS.find(p => p.id === slug);
      if (post) setSelectedPost(post);
    } else {
      setSelectedPost(null);
    }
    window.scrollTo(0, 0);
    
    // Update path instead of hash for standard crawlable and indexable SEO pathnames
    const newPath = newView === 'home'
      ? '/'
      : slug
        ? `/blog/${slug}`
        : `/${newView}`;

    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  // Path-based routing handler that extracts the route view and blog post slug
  const handleRouting = useCallback(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const slug = path.split('/')[2] || '';
      const post = BLOG_POSTS.find(p => p.id === slug);
      if (post) {
        setView('blog');
        setSelectedPost(post);
      } else {
        setView('blog');
        setSelectedPost(null);
      }
    } else {
      const cleanPath = path.replace('/', '') as View;
      const matchedView: View = ['home', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms'].includes(cleanPath)
        ? cleanPath
        : (path === '/' ? 'home' : 'home'); // Default fallback to home
      setView(matchedView);
      setSelectedPost(null);
    }
  }, []);

  // Handle initial routing and back/forward browser button navigation
  useEffect(() => {
    // 1. Support legacy hash links redirection to clean path URLs gracefully
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      let resolvedPath = '/';
      if (hash.startsWith('blog/')) {
        const slug = hash.split('/')[1];
        resolvedPath = `/blog/${slug}`;
      } else if (['home', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms'].includes(hash)) {
        resolvedPath = hash === 'home' ? '/' : `/${hash}`;
      }
      window.history.replaceState(null, '', resolvedPath);
    }

    // 2. Run router & listen to history popstate changes
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [handleRouting]);

  const getCharCounts = (str: string) => {
    const counts: Record<string, number> = {};
    for (const char of str.toLowerCase()) {
      counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
  };

  const handleProcess = useCallback(() => {
    if (!input || input.length < 2) return;
    setIsProcessing(true);
    setTimeout(() => {
      const targetCounts = getCharCounts(input);
      const matched: Record<number, string[]> = {};
      for (const word of dictionary) {
        if (mode === 'unscramble') {
          if (word.length > input.length) continue;
        } else {
          if (word.length !== input.length) continue;
        }
        const wordCounts = getCharCounts(word);
        let possible = true;
        for (const char in wordCounts) {
          if (!targetCounts[char] || wordCounts[char] > targetCounts[char]) {
            possible = false;
            break;
          }
        }
        if (possible) {
          if (!matched[word.length]) matched[word.length] = [];
          matched[word.length].push(word);
        }
      }
      Object.keys(matched).forEach(len => matched[Number(len)].sort());
      setResults(matched);
      setIsProcessing(false);
    }, 400);
  }, [input, dictionary, mode]);

  const copyToClipboard = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const fetchDefinition = async (word: string) => {
    setIsDefining(true);
    setSelectedDefinition(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (!response.ok) throw new Error('Definition not found');
      const data = await response.json();
      setSelectedDefinition(data[0]);
    } catch (err) {
      console.error('Failed to fetch definition:', err);
      // Fallback for UI
      setSelectedDefinition({
        word: word,
        meanings: [{
          partOfSpeech: 'error',
          definitions: [{ definition: 'Sorry, we couldn\'t find a definition for this word in our database.' }]
        }]
      });
    } finally {
      setIsDefining(false);
    }
  };

  const shareWord = async (word: string) => {
    const shareData = {
      title: `QuickAnagram - ${word}`,
      text: `Found the word "${word.toUpperCase()}" using QuickAnagram! Check it out:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: Copy unique share link
      navigator.clipboard.writeText(`Check out "${word.toUpperCase()}" on QuickAnagram: ${window.location.href}`);
      setSharedWord(word);
      setTimeout(() => setSharedWord(null), 2000);
    }
  };

  const sortedLengths = useMemo(() => Object.keys(results).map(Number).sort((a, b) => b - a), [results]);
  const totalFound = useMemo(() => Object.values(results).reduce((acc: number, curr: string[]) => acc + curr.length, 0), [results]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-[#fdfdfb] text-slate-800'} font-sans flex flex-col transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`px-6 md:px-12 py-6 flex justify-between items-center border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white/50'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
          <img src="/logo.svg" alt="QuickAnagram Logo" className={`w-10 h-10 rounded-xl shadow-lg ${isDarkMode ? 'shadow-teal-900/20' : 'shadow-teal-100'} object-contain bg-white p-1`} referrerPolicy="no-referrer" />
          <div>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} block leading-tight`}>QuickAnagram</span>
            <span className={`text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>Fast Word Solver</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <div className={`flex gap-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <button onClick={() => { navigateTo('home'); setMode('unscramble'); }} className={`${view === 'home' && mode === 'unscramble' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'home' && mode === 'unscramble' ? '' : 'border-transparent'}`}>Unscrambler</button>
            <button onClick={() => { navigateTo('home'); setMode('anagram'); }} className={`${view === 'home' && mode === 'anagram' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'home' && mode === 'anagram' ? '' : 'border-transparent'}`}>Anagram Solver</button>
            <button onClick={() => navigateTo('dictionary')} className={`${view === 'dictionary' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'dictionary' ? '' : 'border-transparent'}`}>Dictionary</button>
            <button onClick={() => navigateTo('blog')} className={`${view === 'blog' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'blog' ? '' : 'border-transparent'}`}>Blog</button>
            <button onClick={() => navigateTo('about')} className={`${view === 'about' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'about' ? '' : 'border-transparent'}`}>About</button>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {view === 'home' && (
          <>
            <div id="top-ad-slot" className={`w-full min-h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl mb-8 flex items-center justify-center text-xs font-mono`}>Advertisements</div>
            <section className="max-w-2xl mx-auto w-full text-center mb-12">
              <div className={`inline-flex p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xl mb-8`}>
                <button onClick={() => setMode('unscramble')} className={`px-6 py-2 rounded-xl text-sm font-bold ${mode === 'unscramble' ? (isDarkMode ? 'bg-slate-800 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm') : 'text-slate-500'}`}>Unscramble</button>
                <button onClick={() => setMode('anagram')} className={`px-6 py-2 rounded-xl text-sm font-bold ${mode === 'anagram' ? (isDarkMode ? 'bg-slate-800 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm') : 'text-slate-500'}`}>Anagrams</button>
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>{mode === 'unscramble' ? 'Word Unscrambler' : 'Anagram Solver'}</h1>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>{mode === 'unscramble' ? 'Find valid words for Scrabble and more.' : 'Find all perfect anagrams.'}</p>
              <div className="relative group">
                <input maxLength={15} value={input} onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleProcess()} className={`w-full h-20 px-8 text-3xl font-mono border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'} rounded-3xl outline-none transition-all uppercase`} placeholder="ENTER LETTERS" />
                <button onClick={handleProcess} disabled={isProcessing} className={`absolute right-4 top-1/2 -translate-y-1/2 h-12 px-8 ${isDarkMode ? 'bg-teal-400 text-slate-950 hover:bg-teal-300' : 'bg-teal-700 text-white hover:bg-teal-800'} font-bold rounded-2xl transition-colors`}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'UNSCRAMBLE'}
                </button>
              </div>
            </section>

            {totalFound > 0 ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`mb-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4`}>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Found {totalFound} words</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                  {sortedLengths.map((len) => (
                    <div key={len} className="flex flex-col">
                      <div className={`flex justify-between items-center mb-5 pb-3 border-b-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{len} Letter Words</h3>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-teal-400 bg-teal-900/40' : 'text-teal-600 bg-teal-50'} px-3 py-1 rounded-full`}>{results[len].length}</span>
                      </div>
                      <div className="space-y-2">
                        {results[len].map((word) => (
                          <div key={word} className={`group relative flex justify-between items-center p-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50' : 'bg-white border-slate-200 hover:border-teal-300'} border rounded-2xl transition-all shadow-sm`}>
                             <span className={`font-mono font-bold uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{word}</span>
                            <div className="flex gap-1">
                              <button onClick={() => fetchDefinition(word)} title="Define" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors`}>
                                <Book size={14} />
                              </button>
                              <button onClick={() => shareWord(word)} title="Share" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors`}>
                                {sharedWord === word ? <Check size={14} className="text-teal-500" /> : <Share2 size={14} />}
                              </button>
                              <button onClick={() => copyToClipboard(word)} title="Copy" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors`}>
                                {copiedWord === word ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : input.length > 0 && !isProcessing && (
              <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-3xl border-2 border-dashed mb-12`}>
                <p className="text-slate-400 font-medium">No words found. Try different letters!</p>
              </div>
            )}

            <div id="results-mid-ad" className={`w-full h-[250px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl mb-12 flex items-center justify-center text-xs`}>Middle Ad</div>
            
            {/* Educational SEO Content Section */}
            <section className={`mt-12 pt-16 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto`}>
              <div className="max-w-2xl mx-auto">
                {mode === 'unscramble' ? (
                  /* Word Unscrambler Info */
                  <div className="space-y-6">
                    <div className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-3 mb-2`}>
                      <Search size={24} />
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Word Unscrambler Guide</h2>
                    </div>
                    
                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} mb-2`}>What is the use of Word Unscrambler?</h3>
                      <ul className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm space-y-2 list-disc pl-5`}>
                        <li>Instantly solve complex Scrabble racks and Words with Friends boards.</li>
                        <li>Discover high-scoring words you didn't know existed in your vocabulary.</li>
                        <li>Improve your pattern recognition for competitive board game play.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} mb-2`}>How does this work?</h3>
                      <ul className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm space-y-2 list-disc pl-5`}>
                        <li>Our lightning-fast algorithm cross-references your tiles with a 370k+ word dictionary.</li>
                        <li>It uses client-side character counting to ensure sub-millisecond response times without lag.</li>
                      </ul>
                    </div>

                    <div className={`${isDarkMode ? 'bg-teal-950 border-teal-900 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-700'} p-4 rounded-xl border`}>
                      <p className="text-xs leading-relaxed font-medium transition-all">
                        <strong className={`${isDarkMode ? 'text-teal-200' : 'text-teal-900'}`}>Tip:</strong> Aim for "Bingos" by looking for 7-letter words. These use your entire rack and grant massive point bonuses in most tournament-style games.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Anagram Solver Info */
                  <div className="space-y-6">
                    <div className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-3 mb-2`}>
                      <Zap size={24} />
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Anagram Solver Guide</h2>
                    </div>
                    
                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} mb-2`}>What is the use of Anagram Solver?</h3>
                      <ul className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm space-y-2 list-disc pl-5`}>
                        <li>Perfect for solving daily jumbles, cryptic crosswords, and logic puzzles.</li>
                        <li>Find clever aliases, hidden meanings, or just play with the permutations of a name.</li>
                        <li>Expand your linguistic agility by seeing how letters rearrange into new concepts.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} mb-2`}>How does this work?</h3>
                      <ul className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm space-y-2 list-disc pl-5`}>
                        <li>The solver performs a strict one-to-one character mapping for perfect matches.</li>
                        <li>Every letter in your input must be used exactly once in the resulting word list.</li>
                      </ul>
                    </div>

                    <div className={`${isDarkMode ? 'bg-teal-950 border-teal-900 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-700'} p-4 rounded-xl border`}>
                      <p className="text-xs leading-relaxed font-medium transition-all">
                        <strong className={`${isDarkMode ? 'text-teal-200' : 'text-teal-900'}`}>Tip:</strong> Anagrams are common in usernames and riddles. Try unscrambling common words to find hidden palindromes or related linguistic connections.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div id="bottom-ad-shelf" className={`w-full h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl mt-16 flex items-center justify-center text-xs`}>Footer Ad Slot</div>
            </section>

            {/* SEO FAQ Section */}
            <section className={`mt-20 py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-y -mx-6 md:-mx-12 px-6 md:px-12`}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Frequently Asked Questions</h2>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about QuickAnagram and word unscrambling.</p>
                </div>
                
                <div className="space-y-4">
                  {FAQ_ITEMS.map((item, idx) => (
                    <details key={idx} className={`group border ${isDarkMode ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-950 hover:border-teal-500/30' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-200'} rounded-2xl transition-all`}>
                      <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                        <h3 className={`font-bold pr-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.question}</h3>
                        <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" size={20} />
                      </summary>
                      <div className={`px-6 pb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed text-sm`}>
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>

          </>
        )}

        {view === 'dictionary' && (
          <div className="max-w-4xl mx-auto w-full py-12">
            <section className="max-w-2xl mx-auto w-full text-center mb-16">
              <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Word Dictionary</h1>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>Search definitions, phonetics, and usage examples.</p>
              <div className="relative">
                <input 
                  value={dictInput} 
                  onChange={(e) => setDictInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && fetchDefinition(dictInput)}
                  className={`w-full h-20 px-8 text-3xl font-mono border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'} rounded-3xl outline-none transition-all uppercase`} 
                  placeholder="SEARCH WORD..." 
                />
                <button 
                  onClick={() => fetchDefinition(dictInput)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 h-12 px-8 ${isDarkMode ? 'bg-teal-400 text-slate-950 hover:bg-teal-300' : 'bg-teal-700 text-white hover:bg-teal-800'} font-bold rounded-2xl transition-colors`}
                >
                  {isDefining ? <Loader2 className="animate-spin" /> : 'Search'}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {(selectedDefinition || isDefining) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-lg'} border rounded-3xl p-10`}
                >
                  {isDefining ? (
                    <div className="flex flex-col items-center py-20 gap-4">
                      <Loader2 size={48} className="text-teal-600 animate-spin" />
                      <p className="text-slate-400 font-medium">Looking up definition...</p>
                    </div>
                  ) : selectedDefinition && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 uppercase`}>{selectedDefinition.word}</h2>
                          {selectedDefinition.phonetic && <span className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-mono text-xl`}>{selectedDefinition.phonetic}</span>}
                        </div>
                        <button onClick={() => shareWord(selectedDefinition.word)} className={`${isDarkMode ? 'bg-teal-950 text-teal-400 hover:bg-teal-900' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'} p-4 rounded-2xl transition-all flex gap-3 font-bold items-center`}>
                          <Share2 size={20} />
                          Share Result
                        </button>
                      </div>

                      <div className="grid gap-10">
                        {selectedDefinition.meanings.map((meaning, idx) => (
                          <div key={idx} className={`border-l-4 ${isDarkMode ? 'border-teal-400' : 'border-teal-500'} pl-8 py-2`}>
                            <span className={`text-xs font-black uppercase ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} tracking-widest block mb-4 italic`}>{meaning.partOfSpeech}</span>
                            <div className="space-y-6">
                              {meaning.definitions.map((def, dIdx) => (
                                <div key={dIdx}>
                                  <p className={`text-xl ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} leading-relaxed font-medium mb-3`}>{def.definition}</p>
                                  {def.example && <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm italic`}>"{def.example}"</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {view === 'blog' && (
          <div className="max-w-7xl mx-auto w-full">
            {!selectedPost ? (
              <div className="py-12">
                <div className="text-center mb-20 max-w-2xl mx-auto">
                  <h1 className={`text-5xl md:text-6xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>QuickAnagram Blog</h1>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg`}>Insights, strategies, and the curious history of the English language. Optimized for word game mastery.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {BLOG_POSTS.map((post) => (
                    <motion.div 
                      key={post.id} 
                      whileHover={{ y: -8 }}
                      onClick={() => navigateTo('blog', post.id)} 
                      className={`p-10 ${isDarkMode ? 'bg-slate-900 border-slate-800/50 hover:shadow-teal-900/10' : 'bg-white border-slate-100 hover:shadow-xl'} border rounded-[2rem] shadow-sm transition-all cursor-pointer flex flex-col h-full`}
                    >
                      <div className={`flex justify-between mb-6 text-[10px] font-black ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} uppercase tracking-widest`}>
                        <span className={`px-2 py-1 ${isDarkMode ? 'bg-teal-400/10' : 'bg-teal-500/10'} rounded`}>{post.category}</span>
                        <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{post.date}</span>
                      </div>
                      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>{post.title}</h2>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mb-8 flex-1`}>{post.excerpt}</p>
                      <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100/10'} flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold text-sm`}>
                        Read Story <ArrowLeft className="rotate-180" size={14} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <BlogLayout 
                post={selectedPost} 
                onBack={() => navigateTo('blog')} 
                isDarkMode={isDarkMode}
                onNavigateToTool={(mode) => {
                  setMode(mode);
                  navigateTo('home');
                }}
              />
            )}
          </div>
        )}

        {view === 'about' && (
          <div className="max-w-3xl mx-auto w-full py-20 text-center">
            <h1 className={`text-5xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pure Performance.</h1>
            <p className={`text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-16`}>{ABOUT_CONTENT.mission}</p>
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-10 rounded-3xl border`}>
                <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Our Story</h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{ABOUT_CONTENT.history}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-teal-900/30 border-teal-800' : 'bg-teal-700 border-teal-800'} p-10 rounded-3xl text-white shadow-lg shadow-teal-900/20`}>
                <h3 className="text-2xl font-bold mb-6">Our Values</h3>
                <ul className="space-y-4">{ABOUT_CONTENT.values.map(v => <li key={v} className="flex items-center gap-2 font-bold"><Check size={16} className={`${isDarkMode ? 'text-teal-400' : 'text-teal-400'}`} /> {v}</li>)}</ul>
              </div>
            </div>
          </div>
        )}

        {view === 'contact' && (
          <div className="max-w-5xl mx-auto w-full py-20 grid md:grid-cols-2 gap-20">
            <div>
              <h1 className={`text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Get in Touch</h1>
              <p className={`text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-12`}>Have questions? We are all ears.</p>
              <div className="space-y-8">
                <div className="flex gap-4 items-start"><Mail className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} /> <div><h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Email</h4><p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>support@quickanagram.app</p></div></div>
                <div className="flex gap-4 items-start"><MessageSquare className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} /> <div><h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Chat</h4><p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mon-Fri, 9-5 EST</p></div></div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-10 rounded-3xl border shadow-lg`}>
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <input className={`w-full h-14 px-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`} placeholder="Name" />
                <input className={`w-full h-14 px-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`} placeholder="Email" />
                <textarea className={`w-full p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`} placeholder="Message" rows={4}></textarea>
                <button className={`w-full h-14 ${isDarkMode ? 'bg-teal-400 text-slate-950 hover:bg-teal-300' : 'bg-teal-700 text-white hover:bg-teal-800'} font-bold rounded-2xl transition-colors shadow-lg shadow-teal-900/10`}>Send</button>
              </form>
            </div>
          </div>
        )}

        {view === 'policy' && (
          <div className="max-w-3xl mx-auto w-full py-20">
            <h1 className={`text-5xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{POLICY_CONTENT.title}</h1>
            <p className="text-slate-500 mb-12">Last Updated: {POLICY_CONTENT.lastUpdated}</p>
            <div className="space-y-12">
              {POLICY_CONTENT.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{section.title}</h3>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{section.content}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigateTo('home')} className={`mt-16 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>
              <ArrowLeft size={18} /> Back to Solver
            </button>
          </div>
        )}

        {view === 'terms' && (
          <div className="max-w-3xl mx-auto w-full py-20">
            <h1 className={`text-5xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{TERMS_CONTENT.title}</h1>
            <p className="text-slate-500 mb-12">Last Updated: {TERMS_CONTENT.lastUpdated}</p>
            <div className="space-y-12">
              {TERMS_CONTENT.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{section.title}</h3>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{section.content}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigateTo('home')} className={`mt-16 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>
              <ArrowLeft size={18} /> Back to Solver
            </button>
          </div>
        )}
      </main>

      <footer className={`px-6 md:px-12 py-10 ${isDarkMode ? 'bg-black text-slate-400' : 'bg-slate-900 text-slate-400'} mt-20 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="QuickAnagram" className="w-6 h-6 rounded object-contain bg-white p-0.5" referrerPolicy="no-referrer" />
              <h4 className="text-white font-bold">QuickAnagram</h4>
            </div>
            <p className="text-xs">World's fastest word extraction tool.</p>
          </div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Tools</h5><ul className="space-y-2 text-xs"><li><button onClick={() => navigateTo('home')} className="hover:text-teal-400">Scrabble</button></li><li><button onClick={() => navigateTo('home')} className="hover:text-teal-400">Anagrams</button></li></ul></div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Company</h5><ul className="space-y-2 text-xs"><li><button onClick={() => navigateTo('about')} className="hover:text-teal-400">About</button></li><li><button onClick={() => navigateTo('blog')} className="hover:text-teal-400">Blog</button></li><li><button onClick={() => navigateTo('contact')} className="hover:text-teal-400">Contact</button></li></ul></div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Privacy</h5><ul className="space-y-2 text-xs"><li><button onClick={() => navigateTo('policy')} className="hover:text-teal-400">Policy</button></li><li><button onClick={() => navigateTo('terms')} className="hover:text-teal-400">Terms</button></li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto w-full pt-12 mt-12 border-t border-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
           © 2024 QuickAnagram • All Rights Reserved
        </div>
      </footer>

      {/* Global Definition Overlay */}
      <AnimatePresence>
        {view !== 'dictionary' && (selectedDefinition || isDefining) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDefinition(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col`}
            >
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'} flex justify-between items-center sticky top-0 z-10`}>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                  <Book size={20} />
                  Word Definition
                </h3>
                <button onClick={() => setSelectedDefinition(null)} className={`p-2 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} rounded-xl transition-all`}>
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-10 overflow-y-auto">
                {isDefining ? (
                  <div className="flex flex-col items-center py-20 gap-4">
                    <Loader2 size={48} className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} animate-spin`} />
                    <p className="text-slate-400 font-medium">Looking up definition...</p>
                  </div>
                ) : selectedDefinition && (
                  <div className="space-y-8">
                    <div>
                      <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1 uppercase leading-none`}>{selectedDefinition.word}</h2>
                      {selectedDefinition.phonetic && <span className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-mono italic`}>{selectedDefinition.phonetic}</span>}
                    </div>

                    <div className="grid gap-8">
                      {selectedDefinition.meanings.map((meaning, idx) => (
                        <div key={idx}>
                          <span className={`inline-block px-3 py-1 rounded-full ${isDarkMode ? 'bg-teal-400/20 text-teal-400' : 'bg-teal-50 text-teal-700'} text-[10px] font-black uppercase mb-4`}>{meaning.partOfSpeech}</span>
                          <div className="space-y-4">
                            {meaning.definitions.map((def, dIdx) => (
                              <div key={dIdx} className="group">
                                <p className={`leading-relaxed font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{def.definition}</p>
                                {def.example && <p className={`${isDarkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'} text-sm italic pl-4 border-l-2`}>"{def.example}"</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
