import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Copy, Check, Menu, Info, Zap, Github, ExternalLink, ArrowLeft, Mail, MessageSquare, Book, Share2, X, Loader2, ChevronDown, Sun, Moon, Sliders, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ABOUT_CONTENT, FAQ_ITEMS, POLICY_CONTENT, TERMS_CONTENT } from './content.ts';
import { BLOG_POSTS, BlogPost } from './blogData.ts';
import { BlogLayout } from './components/BlogLayout.tsx';

type View = 'home' | 'blog' | 'about' | 'contact' | 'dictionary' | 'policy' | 'terms' | 'words-az';

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

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  countryCode: string;
  url: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    countryCode: 'US',
    url: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    countryCode: 'SA',
    url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ar/ar_50k.txt'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    countryCode: 'ES',
    url: 'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/es.txt'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    countryCode: 'FR',
    url: 'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    countryCode: 'DE',
    url: 'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/de.txt'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    countryCode: 'IT',
    url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/it/it_50k.txt'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    countryCode: 'PT',
    url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt/pt_50k.txt'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    countryCode: 'NL',
    url: 'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt'
  }
];

const cleanInput = (val: string) => {
  return val.replace(/[^a-zA-Z\u0621-\u064A\u00C0-\u00FF\u0100-\u017F]/g, '');
};

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

  // Words Starting & Ending A-Z states
  const [azType, setAzType] = useState<'starting' | 'ending'>('starting');
  const [azLetter, setAzLetter] = useState<string>('A');
  const [azLength, setAzLength] = useState<string | number>('All');
  const [azPage, setAzPage] = useState<number>(1);
  const [azSearch, setAzSearch] = useState<string>('');

  // Blog filtering & search states
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategory, setBlogCategory] = useState('All');

  // Mobile menu control toggler
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Advanced filter options for Unscrambler (Starts with, Ends with, Contains, Word length)
  const [filterStartsWith, setFilterStartsWith] = useState('');
  const [filterEndsWith, setFilterEndsWith] = useState('');
  const [filterContains, setFilterContains] = useState('');
  const [filterWordLength, setFilterWordLength] = useState('');
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  // Language selection and dynamic database caching states
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [loadedDictionaries, setLoadedDictionaries] = useState<Record<string, string[]>>({});
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const currentLangObj = useMemo(() => LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0], [currentLanguage]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load dictionary dynamically with intelligent caching & diacritics handling
  useEffect(() => {
    async function loadDictionary() {
      if (loadedDictionaries[currentLanguage]) {
        setDictionary(loadedDictionaries[currentLanguage]);
        return;
      }

      setIsDictLoading(true);
      setError(null);
      const selectedLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
      try {
        const response = await fetch(selectedLang.url);
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const text = await response.text();
        
        let words = text.split('\n').map(w => {
          let trimmed = w.trim();
          // Remove suffix flag annotations (e.g. word/X) in hunspell dic files
          if (trimmed.includes('/')) {
            trimmed = trimmed.split('/')[0];
          }
          // Remove trailing frequencies (e.g. 'word 358209') in HermitDave frequency files
          const parts = trimmed.split(/\s+/);
          if (parts[0]) {
            return parts[0].toLowerCase();
          }
          return '';
        }).filter(w => w !== '');
        
        // Filter out words that contain punctuation or numbers
        const arRegex = /^[\u0621-\u064A]+$/;
        const latinAccentedRegex = /^[a-z\u00C0-\u00FF\u0100-\u017Fœæß]+$/;
        
        words = words.filter(w => {
          if (w.length < 2 || w.length > 15) return false;
          if (currentLanguage === 'ar') {
            return arRegex.test(w);
          }
          return latinAccentedRegex.test(w);
        });

        // Dedup dictionary words
        const uniqueWords = Array.from(new Set(words));

        setDictionary(uniqueWords);
        setLoadedDictionaries(prev => ({ ...prev, [currentLanguage]: uniqueWords }));
      } catch (err) {
        console.error(`Failed to load dictionary for ${currentLanguage}:`, err);
        setError(`Failed to load ${selectedLang.name} database. Please check your connection.`);
      } finally {
        setIsDictLoading(false);
      }
    }
    loadDictionary();
  }, [currentLanguage]);

  // Handle auto-reset and default starting letters in Words A-Z when switching languages
  useEffect(() => {
    const defaultLetter = currentLanguage === 'ar' ? 'أ' : 'A';
    setAzLetter(defaultLetter);
    setAzPage(1);
    setAzSearch('');
  }, [currentLanguage]);

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
      const matchedView: View = ['home', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms', 'words-az'].includes(cleanPath)
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
      } else if (['home', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms', 'words-az'].includes(hash)) {
        resolvedPath = hash === 'home' ? '/' : `/${hash}`;
      }
      window.history.replaceState(null, '', resolvedPath);
    }

    // 2. Run router & listen to history popstate changes
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [handleRouting]);

  // Reset pagination on filter adjustments
  useEffect(() => {
    setAzPage(1);
  }, [azType, azLetter, azLength, azSearch]);

  const alphabet = useMemo(() => {
    if (currentLanguage === 'ar') {
      return "أبتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
    }
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  }, [currentLanguage]);

  // Highly optimized character frequency tracking algorithm and dictionary filters
  const filteredAzWords = useMemo(() => {
    if (!dictionary || dictionary.length === 0) return [];
    
    const letterLower = azLetter.toLowerCase();
    const searchLower = azSearch.toLowerCase().trim();
    
    const matchesLetter = dictionary.filter(word => {
      if (azType === 'starting') {
        return word.startsWith(letterLower);
      } else {
        return word.endsWith(letterLower);
      }
    });

    let matchesLength = matchesLetter;
    if (azLength !== 'All') {
      if (azLength === '9+') {
        matchesLength = matchesLetter.filter(w => w.length >= 9);
      } else {
        const targetLen = Number(azLength);
        matchesLength = matchesLetter.filter(w => w.length === targetLen);
      }
    }

    let matchesSearch = matchesLength;
    if (searchLower) {
      matchesSearch = matchesLength.filter(w => w.includes(searchLower));
    }

    return matchesSearch.sort();
  }, [dictionary, azType, azLetter, azLength, azSearch]);

  const wordsPerPage = 120;
  const paginatedAzWords = useMemo(() => {
    return filteredAzWords.slice(0, azPage * wordsPerPage);
  }, [filteredAzWords, azPage]);

  // Dynamic Blog Filtering & Category structures
  const blogCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];
  }, []);

  const filteredBlogPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = blogCategory === 'All' || post.category === blogCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
        post.content.toLowerCase().includes(blogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogSearch, blogCategory]);

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
      const startsWithVal = mode === 'unscramble' ? filterStartsWith.toLowerCase().trim() : '';
      const endsWithVal = mode === 'unscramble' ? filterEndsWith.toLowerCase().trim() : '';
      const containsVal = mode === 'unscramble' ? filterContains.toLowerCase().trim() : '';
      const lengthVal = mode === 'unscramble' && filterWordLength ? Number(filterWordLength.trim()) : NaN;

      for (const word of dictionary) {
        if (mode === 'unscramble') {
          if (word.length > input.length) continue;
        } else {
          if (word.length !== input.length) continue;
        }

        // Apply advanced advanced filters (Starts with, Ends with, Contains, Word length)
        if (startsWithVal && !word.startsWith(startsWithVal)) continue;
        if (endsWithVal && !word.endsWith(endsWithVal)) continue;
        if (containsVal && !word.includes(containsVal)) continue;
        if (!isNaN(lengthVal) && word.length !== lengthVal) continue;

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
  }, [input, dictionary, mode, filterStartsWith, filterEndsWith, filterContains, filterWordLength]);

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
      title: `LetterHub - ${word}`,
      text: `Found the word "${word.toUpperCase()}" using LetterHub! Check it out:`,
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
      navigator.clipboard.writeText(`Check out "${word.toUpperCase()}" on LetterHub: ${window.location.href}`);
      setSharedWord(word);
      setTimeout(() => setSharedWord(null), 2000);
    }
  };

  const sortedLengths = useMemo(() => Object.keys(results).map(Number).sort((a, b) => b - a), [results]);
  const totalFound = useMemo(() => Object.values(results).reduce((acc: number, curr: string[]) => acc + curr.length, 0), [results]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-[#fdfdfb] text-slate-800'} font-sans flex flex-col transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`px-6 md:px-12 py-6 flex flex-col border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white/50'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <img src="/logo.svg" alt="LetterHub Logo" className={`w-10 h-10 rounded-xl shadow-lg ${isDarkMode ? 'shadow-teal-900/20' : 'shadow-teal-100'} object-contain bg-white p-1`} referrerPolicy="no-referrer" />
            <div>
              <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} block leading-tight`}>LetterHub</span>
              <span className={`text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>Ultimate Word Engine</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <div className={`flex gap-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <button onClick={() => { navigateTo('home'); setMode('unscramble'); }} className={`${view === 'home' && mode === 'unscramble' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'home' && mode === 'unscramble' ? '' : 'border-transparent'}`}>Unscrambler</button>
              <button onClick={() => { navigateTo('home'); setMode('anagram'); }} className={`${view === 'home' && mode === 'anagram' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'home' && mode === 'anagram' ? '' : 'border-transparent'}`}>Anagram Solver</button>
              <button onClick={() => navigateTo('words-az')} className={`${view === 'words-az' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'words-az' ? '' : 'border-transparent'}`}>Words A-Z</button>
              <button onClick={() => navigateTo('dictionary')} className={`${view === 'dictionary' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'dictionary' ? '' : 'border-transparent'}`}>Dictionary</button>
              <button onClick={() => navigateTo('blog')} className={`${view === 'blog' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'blog' ? '' : 'border-transparent'}`}>Blog</button>
              <button onClick={() => navigateTo('about')} className={`${view === 'about' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'about' ? '' : 'border-transparent'}`}>About</button>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-sm font-semibold border ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-705 hover:bg-slate-200'
                }`}
                title="Select Language"
              >
                {isDictLoading ? (
                  <Loader2 className="animate-spin text-teal-500" size={16} />
                ) : (
                  <span className="text-base leading-none">{currentLangObj.flag}</span>
                )}
                <span className="uppercase font-bold tracking-wider text-xs">{currentLangObj.code}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-2xl border-2 shadow-xl z-50 overflow-hidden ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-slate-200' 
                          : 'bg-white border-slate-150 text-slate-805'
                      }`}
                    >
                      <div className="p-1.5 space-y-0.5">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                              currentLanguage === lang.code
                                ? (isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-700')
                                : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-650')
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                              {lang.countryCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-sm font-semibold border ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-200' 
                    : 'bg-slate-100 border-slate-200 text-slate-705'
                }`}
                aria-label="Select Language"
              >
                {isDictLoading ? (
                  <Loader2 className="animate-spin text-teal-500" size={14} />
                ) : (
                  <span className="text-base leading-none">{currentLangObj.flag}</span>
                )}
                <span className="uppercase font-bold text-xs">{currentLangObj.code}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-44 rounded-2xl border shadow-xl z-50 overflow-hidden ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-slate-200' 
                          : 'bg-white border-slate-150 text-slate-805'
                      }`}
                    >
                      <div className="p-1 space-y-0.5">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-colors ${
                              currentLanguage === lang.code
                                ? (isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-700')
                                : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-650')
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold opacity-60">
                              {lang.countryCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Options */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-4"
            >
              <div className={`flex flex-col gap-2 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-850' : 'bg-slate-50 border border-slate-100'} text-sm font-semibold mt-2`}>
                <button onClick={() => { navigateTo('home'); setMode('unscramble'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'home' && mode === 'unscramble' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Unscrambler</button>
                <button onClick={() => { navigateTo('home'); setMode('anagram'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'home' && mode === 'anagram' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Anagram Solver</button>
                <button onClick={() => { navigateTo('words-az'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'words-az' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Words A-Z</button>
                <button onClick={() => { navigateTo('dictionary'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'dictionary' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Dictionary</button>
                <button onClick={() => { navigateTo('blog'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'blog' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Blog</button>
                <button onClick={() => { navigateTo('about'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'about' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>About</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
                {mode === 'unscramble' ? 'Find words from your letters' : 'Anagram Solver'}
              </h1>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>
                {mode === 'unscramble' 
                  ? 'Enter any combination of letters and discover all possible words you can make' 
                  : 'Find all perfect anagrams.'}
              </p>
              <div className="group">
                <input maxLength={15} value={input} onChange={(e) => setInput(cleanInput(e.target.value).toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleProcess()} className={`w-full h-20 px-8 text-3xl font-mono border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'} rounded-3xl outline-none transition-all uppercase`} placeholder="ENTER LETTERS" />
              </div>

              {/* Advanced Filter Options (Starts with, Ends with, Contains, Word length) */}
              {mode === 'unscramble' && (
                <div className="mt-8 text-left">
                  <button
                    type="button"
                    onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isDarkMode 
                        ? 'text-slate-300 hover:bg-slate-900' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders size={18} className="text-slate-400" />
                    <span>Options</span>
                    {isOptionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {isOptionsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className={`p-6 rounded-3xl border-2 ${
                          isDarkMode 
                            ? 'bg-slate-900/60 border-slate-850/85' 
                            : 'bg-[#fafafa] border-slate-200'
                        }`}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Starts with */}
                            <div className="flex flex-col gap-1.5">
                              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Starts with
                              </label>
                              <input
                                type="text"
                                value={filterStartsWith}
                                onChange={(e) => setFilterStartsWith(cleanInput(e.target.value).toUpperCase())}
                                placeholder="e.g., a"
                                className={`h-11 px-4 rounded-xl border ${
                                  isDarkMode 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                                } outline-none text-sm transition-all`}
                              />
                            </div>

                            {/* Ends with */}
                            <div className="flex flex-col gap-1.5">
                              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Ends with
                              </label>
                              <input
                                type="text"
                                value={filterEndsWith}
                                onChange={(e) => setFilterEndsWith(cleanInput(e.target.value).toUpperCase())}
                                placeholder="e.g., s"
                                className={`h-11 px-4 rounded-xl border ${
                                  isDarkMode 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                                } outline-none text-sm transition-all`}
                              />
                            </div>

                            {/* Contains */}
                            <div className="flex flex-col gap-1.5">
                              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Contains
                              </label>
                              <input
                                type="text"
                                value={filterContains}
                                onChange={(e) => setFilterContains(cleanInput(e.target.value).toUpperCase())}
                                placeholder="e.g., ing"
                                className={`h-11 px-4 rounded-xl border ${
                                  isDarkMode 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                                } outline-none text-sm transition-all`}
                              />
                            </div>

                            {/* Word length */}
                            <div className="flex flex-col gap-1.5">
                              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Word length
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={filterWordLength}
                                onChange={(e) => setFilterWordLength(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="e.g., 5"
                                className={`h-11 px-4 rounded-xl border ${
                                  isDarkMode 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                                } outline-none text-sm transition-all`}
                              />
                            </div>
                          </div>

                          {/* Reset Filters utility */}
                          {(filterStartsWith || filterEndsWith || filterContains || filterWordLength) && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterStartsWith('');
                                  setFilterEndsWith('');
                                  setFilterContains('');
                                  setFilterWordLength('');
                                }}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
                              >
                                Clear Options
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Call to Action: Unscramble It / Find */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing || isDictLoading}
                  className={`px-10 py-4 font-black rounded-2xl shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[240px] text-base uppercase tracking-wider ${
                    mode === 'unscramble'
                      ? 'bg-[#e05300] hover:bg-[#c44700] text-white'
                      : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    mode === 'unscramble' ? 'Unscramble It' : 'Find'
                  )}
                </button>
              </div>
            </section>

            {isDictLoading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="animate-spin text-teal-500 mb-4" size={40} />
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Loading {currentLangObj.name} wordlist database...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  This takes just a second.
                </p>
              </div>
            ) : totalFound > 0 ? (
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
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about LetterHub and word unscrambling.</p>
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

        {view === 'words-az' && (
          <div className="max-w-7xl mx-auto w-full py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="max-w-3xl mx-auto w-full text-center mb-12">
              <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
                A-Z Word Finder
              </h1>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>
                Instant catalogs of competitive board game compatible words. Search and browse lists by starting or ending letter.
              </p>
              
              {/* Type Switcher: Starting With vs Ending With */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
                <div className={`inline-flex p-1.5 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xl`}>
                  <button 
                    onClick={() => setAzType('starting')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${azType === 'starting' ? (isDarkMode ? 'bg-slate-800 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm') : 'text-slate-500 hover:text-slate-405'}`}
                  >
                    Words Starting With
                  </button>
                  <button 
                    onClick={() => setAzType('ending')} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${azType === 'ending' ? (isDarkMode ? 'bg-slate-800 text-teal-400 shadow-sm' : 'bg-white text-teal-600 shadow-sm') : 'text-slate-500 hover:text-slate-405'}`}
                  >
                    Words Ending With
                  </button>
                </div>
              </div>

              {/* Letter Selectors Grid */}
              <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'} border mb-10`}>
                <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} mb-4 text-center`}>
                  Browse by Letter ({azLetter})
                </h3>
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setAzLetter(letter)}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-xl text-sm font-black font-mono transition-all flex items-center justify-center ${
                        azLetter === letter
                          ? (isDarkMode ? 'bg-teal-400 text-slate-950 shadow-lg shadow-teal-400/10' : 'bg-teal-700 text-white shadow-md shadow-teal-700/10')
                          : (isDarkMode ? 'bg-slate-800/50 hover:bg-slate-750 text-slate-350 hover:text-white' : 'bg-white hover:bg-slate-100 text-slate-700 hover:border-slate-300 border border-slate-200')
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refinement Options Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                {/* Length pills */}
                <div className="lg:col-span-8 flex flex-col items-start gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Filter by Length
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 2, 3, 4, 5, 6, 7, 8, '9+'].map((len) => (
                      <button
                        key={len}
                        onClick={() => setAzLength(len)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          azLength === len
                            ? (isDarkMode ? 'bg-teal-400/20 text-teal-400 border border-teal-500/20' : 'bg-teal-50 text-teal-700 border border-teal-200')
                            : (isDarkMode ? 'bg-slate-900 border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                        }`}
                      >
                        {len} {len === 'All' ? '' : len === '9+' ? 'Letters' : 'Ltrs'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inline instant search filter */}
                <div className="lg:col-span-4 flex flex-col items-start gap-2 w-full">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Filter by characters
                  </span>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={azSearch}
                      onChange={(e) => setAzSearch(cleanInput(e.target.value))}
                      placeholder={`Search within ${azLetter} words...`}
                      className={`w-full h-10 pl-9 pr-8 rounded-xl text-xs border ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                      } outline-none transition-all`}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    {azSearch && (
                      <button onClick={() => setAzSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Results listing layout */}
            {filteredAzWords.length > 0 ? (
              <div className="flex-1 flex flex-col pt-4">
                <div className={`mb-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-3 flex justify-between items-center`}>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Words {azType === 'starting' ? 'Starting' : 'Ending'} with "{azLetter}" {azLength !== 'All' ? `(${azLength} Letters)` : ''} ({filteredAzWords.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">
                    Showing {Math.min(filteredAzWords.length, azPage * wordsPerPage)} of {filteredAzWords.length}
                  </span>
                </div>

                {/* Response Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-10">
                  {paginatedAzWords.map((word) => (
                    <div 
                      key={word} 
                      className={`group relative flex flex-col p-4 ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50' 
                          : 'bg-white border-slate-200 hover:border-teal-300'
                      } border rounded-2xl transition-all shadow-sm justify-between gap-3`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-105' : 'text-slate-850'} text-sm`}>
                          {word}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                          {word.length}L
                        </span>
                      </div>
                      
                      <div className="flex gap-1 justify-end mt-1 border-t border-slate-100/10 dark:border-slate-800/15 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => fetchDefinition(word)} 
                          title="Get Definition" 
                          className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-405 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors`}
                        >
                          <Book size={12} />
                        </button>
                        <button 
                          onClick={() => shareWord(word)} 
                          title="Share" 
                          className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-405 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-405 hover:text-teal-600'} transition-colors`}
                        >
                          {sharedWord === word ? <Check size={12} className="text-teal-500" /> : <Share2 size={12} />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(word)} 
                          title="Copy Word" 
                          className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-405 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-405 hover:text-teal-600'} transition-colors`}
                        >
                          {copiedWord === word ? <Check size={12} className="text-teal-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Button */}
                {filteredAzWords.length > paginatedAzWords.length && (
                  <div className="flex justify-center mb-12">
                    <button
                      onClick={() => setAzPage(prev => prev + 1)}
                      className={`px-8 py-3.5 rounded-2xl font-bold transition-all shadow-sm ${
                        isDarkMode
                          ? 'bg-slate-900 border border-slate-800 hover:border-teal-500/35 text-teal-400 hover:bg-slate-850'
                          : 'bg-white border border-slate-200 hover:border-teal-300 text-teal-700 hover:bg-slate-50'
                      }`}
                    >
                      Load More Words
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-3xl border-2 border-dashed max-w-xl mx-auto my-6`}>
                <p className="text-slate-400 font-medium">No matches found with those starting or filter parameters!</p>
              </div>
            )}
            
            <div id="results-mid-ad" className={`w-full h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-405'} border border-dashed rounded-xl mb-12 flex items-center justify-center text-xs font-mono`}>Advertisements</div>
          </div>
        )}

        {view === 'blog' && (
          <div className="max-w-7xl mx-auto w-full">
            {!selectedPost ? (
              <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12 max-w-2xl mx-auto">
                  <h1 className={`text-5xl md:text-6xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>LetterHub Blog</h1>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg`}>Insights, strategies, and the curious history of the English language. Optimized for word game mastery.</p>
                </div>

                {/* Blog Search & Categories Filter */}
                <div className="mb-12 max-w-4xl mx-auto space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search articles on Scrabble, Wordle strategies, history, trivia..."
                      className={`w-full h-14 pl-12 pr-10 rounded-2xl border-2 ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                      } outline-none transition-all text-sm shadow-sm`}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    {blogSearch && (
                      <button onClick={() => setBlogSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    {blogCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setBlogCategory(cat)}
                        className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all ${
                          blogCategory === cat
                            ? (isDarkMode ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20' : 'bg-teal-700 text-white shadow-sm')
                            : (isDarkMode ? 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100')
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                {filteredBlogPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogPosts.map((post) => (
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
                ) : (
                  <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-3xl border-2 border-dashed max-w-xl mx-auto`}>
                    <p className="text-slate-400 font-medium">No blog posts found matching your filters. Try a different query!</p>
                  </div>
                )}
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
                <div className="flex gap-4 items-start"><Mail className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} /> <div><h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Email</h4><p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>hello@unscramblerhub.com</p></div></div>
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
              <img src="/logo.svg" alt="LetterHub" className="w-6 h-6 rounded object-contain bg-white p-0.5" referrerPolicy="no-referrer" />
              <h4 className="text-white font-bold">LetterHub</h4>
            </div>
            <p className="text-xs">World's fastest word extraction tool.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigateTo('home')} className="hover:text-teal-400 text-left">Scrabble Unscrambler</button></li>
              <li><button onClick={() => navigateTo('home')} className="hover:text-teal-400 text-left">Anagram Solver</button></li>
              <li><button onClick={() => navigateTo('words-az')} className="hover:text-teal-400 text-left">A-Z Word Finder</button></li>
            </ul>
          </div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Company</h5><ul className="space-y-2 text-xs"><li><button onClick={() => navigateTo('about')} className="hover:text-teal-400">About</button></li><li><button onClick={() => navigateTo('blog')} className="hover:text-teal-400">Blog</button></li><li><button onClick={() => navigateTo('contact')} className="hover:text-teal-400">Contact</button></li></ul></div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Privacy</h5><ul className="space-y-2 text-xs"><li><button onClick={() => navigateTo('policy')} className="hover:text-teal-400">Policy</button></li><li><button onClick={() => navigateTo('terms')} className="hover:text-teal-400">Terms</button></li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto w-full pt-12 mt-12 border-t border-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
           © 2024 LetterHub • All Rights Reserved
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
