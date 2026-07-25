import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Copy, Check, Menu, Info, Zap, Github, ExternalLink, ArrowLeft, Mail, MessageSquare, Book, Share2, X, Loader2, ChevronDown, Sun, Moon, Sliders, ChevronUp, RefreshCw, BookOpen, Bookmark, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ABOUT_CONTENT, FAQ_ITEMS, POLICY_CONTENT, TERMS_CONTENT } from './content.ts';
import { BLOG_POSTS, BlogPost } from './blogData.ts';
import { BlogLayout } from './components/BlogLayout.tsx';
import { HomeView } from './components/HomeView.tsx';
import { UnscramblerView } from './components/UnscramblerView.tsx';
import { AnagramSolverView } from './components/AnagramSolverView.tsx';
import { CognitiveGame } from './components/CognitiveGame.tsx';
import { AnagramGame } from './components/AnagramGame.tsx';
import { FALLBACK_WORDS } from './fallbackWords.ts';

type View = 'home' | 'unscrambler' | 'anagram-solver' | 'blog' | 'about' | 'contact' | 'dictionary' | 'policy' | 'terms' | 'words-az' | 'strategy';

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

interface DictionaryWord {
  original: string;
  normalized: string;
}

export const normalizeWord = (word: string, lang: string): string => {
  if (typeof word !== 'string') {
    if (!word) return '';
    word = String(word);
  }
  if (!word) return '';
  const lower = word.toLowerCase();
  if (lang === 'ar') {
    return lower
      // Remove diacritics/tashkeel
      .replace(/[\u064B-\u065F]/g, '')
      // Normalize Alifs (أ, إ, آ, ٱ to ا)
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
      // Normalize Taa Marbuta (ة to ه)
      .replace(/\u0629/g, '\u0647')
      // Normalize Alif Maksura (ى to ي)
      .replace(/\u0649/g, '\u064A');
  }
  return lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeStrategyArticle, setActiveStrategyArticle] = useState<'unscrambling' | 'anagramming'>('unscrambling');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [unscrambleInput, setUnscrambleInput] = useState('');
  const [unscrambleResults, setUnscrambleResults] = useState<Record<number, string[]>>({});
  const [unscrambleIsProcessing, setUnscrambleIsProcessing] = useState(false);

  const [anagramInput, setAnagramInput] = useState('');
  const [anagramResults, setAnagramResults] = useState<Record<number, string[]>>({});
  const [anagramIsProcessing, setAnagramIsProcessing] = useState(false);

  const [dictionary, setDictionary] = useState<DictionaryWord[]>(FALLBACK_WORDS);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<Definition | null>(null);
  const [isDefining, setIsDefining] = useState(false);
  const [dictInput, setDictInput] = useState('');
  const [sharedWord, setSharedWord] = useState<string | null>(null);

  // Homepage inputs for preview searches
  const [homeUnscrambleInput, setHomeUnscrambleInput] = useState('');
  const [homeAnagramInput, setHomeAnagramInput] = useState('');
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
  const [loadedDictionaries, setLoadedDictionaries] = useState<Record<string, DictionaryWord[]>>({});
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
        
        // Filter out words that contain punctuation or numbers (allowing Arabic diacritics)
        const arRegex = /^[\u0621-\u064A\u064B-\u065F]+$/;
        const latinAccentedRegex = /^[a-z\u00C0-\u00FF\u0100-\u017Fœæß]+$/;
        
        const dictWords: DictionaryWord[] = [];
        const seen = new Set<string>();

        words.forEach(w => {
          let isValid = false;
          if (currentLanguage === 'ar') {
            isValid = arRegex.test(w);
          } else {
            isValid = latinAccentedRegex.test(w);
          }

          if (isValid) {
            const norm = normalizeWord(w, currentLanguage);
            if (norm.length >= 2 && norm.length <= 15) {
              if (!seen.has(w)) {
                seen.add(w);
                dictWords.push({
                  original: w,
                  normalized: norm
                });
              }
            }
          }
        });

        setDictionary(dictWords);
        setLoadedDictionaries(prev => ({ ...prev, [currentLanguage]: dictWords }));
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

  const navigateTo = (newView: View, slug?: string, initialInput?: string) => {
    setView(newView);
    if (slug) {
      const post = BLOG_POSTS.find(p => p.id === slug);
      if (post) setSelectedPost(post);
    } else {
      setSelectedPost(null);
    }
    window.scrollTo(0, 0);

    // Auto-run search if entering a tool view with letters, or clear state if returning home
    if (newView === 'unscrambler') {
      const activeInput = initialInput || unscrambleInput;
      if (activeInput && activeInput.length >= 2) {
        if (initialInput) {
          setUnscrambleInput(initialInput);
        }
        setTimeout(() => {
          handleUnscrambleProcess(activeInput);
        }, 50);
      }
    } else if (newView === 'anagram-solver') {
      const activeInput = initialInput || anagramInput;
      if (activeInput && activeInput.length >= 2) {
        if (initialInput) {
          setAnagramInput(initialInput);
        }
        setTimeout(() => {
          handleAnagramProcess(activeInput);
        }, 50);
      }
    } else if (newView === 'home') {
      setUnscrambleInput('');
      setUnscrambleResults({});
      setAnagramInput('');
      setAnagramResults({});
      setHomeUnscrambleInput('');
      setHomeAnagramInput('');
    }
    
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
    let path = window.location.pathname;
    let hadTrailingSlash = false;
    // Strip trailing slash for consistent route matching (except for the root path "/")
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
      hadTrailingSlash = true;
    }

    // Sync browser URL to match normalized path (e.g. /words-az/ -> /words-az) without reloading
    if (hadTrailingSlash) {
      window.history.replaceState(null, '', path);
    }

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
      const cleanPath = path.substring(1) as View;
      const matchedView: View = ['home', 'unscrambler', 'anagram-solver', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms', 'words-az', 'strategy'].includes(cleanPath)
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
      } else if (['home', 'unscrambler', 'anagram-solver', 'blog', 'about', 'contact', 'dictionary', 'policy', 'terms', 'words-az', 'strategy'].includes(hash)) {
        resolvedPath = hash === 'home' ? '/' : `/${hash}`;
      }
      window.history.replaceState(null, '', resolvedPath);
    }

    // 2. Run router & listen to history popstate changes
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [handleRouting]);

  // Dynamic Cross-Domain Canonical Tag Management pointing to the primary domain: unscramblerhub.com
  useEffect(() => {
    const path = window.location.pathname;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `https://unscramblerhub.com${normalizedPath === '/' ? '/' : normalizedPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [view, selectedPost]);

  // Dynamic robots meta tag management to block search indexing for Words A-Z and Dictionary views
  useEffect(() => {
    const isNoIndexView = view === 'words-az' || view === 'dictionary';
    let robotsMeta = document.querySelector('meta[name="robots"]');

    if (isNoIndexView) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, follow');
    } else {
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }
  }, [view]);

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
    
    const letterLower = normalizeWord(azLetter, currentLanguage);
    const searchLower = normalizeWord(azSearch, currentLanguage).trim();
    
    const matchesLetter = dictionary.filter(word => {
      if (azType === 'starting') {
        return word.normalized.startsWith(letterLower);
      } else {
        return word.normalized.endsWith(letterLower);
      }
    });

    let matchesLength = matchesLetter;
    if (azLength !== 'All') {
      if (azLength === '9+') {
        matchesLength = matchesLetter.filter(w => w.normalized.length >= 9);
      } else {
        const targetLen = Number(azLength);
        matchesLength = matchesLetter.filter(w => w.normalized.length === targetLen);
      }
    }

    let matchesSearch = matchesLength;
    if (searchLower) {
      matchesSearch = matchesLength.filter(w => w.normalized.includes(searchLower));
    }

    return matchesSearch.map(w => w.original).sort();
  }, [dictionary, azType, azLetter, azLength, azSearch, currentLanguage]);

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

  const handleUnscrambleProcess = useCallback((overrideInput?: string) => {
    const query = typeof overrideInput === 'string' ? overrideInput : unscrambleInput;
    if (!query || query.length < 2) return;
    setUnscrambleIsProcessing(true);
    setTimeout(() => {
      const normalizedInput = normalizeWord(query, currentLanguage);
      const targetCounts = getCharCounts(normalizedInput);
      const matched: Record<number, string[]> = {};
      const startsWithVal = normalizeWord(filterStartsWith, currentLanguage).trim();
      const endsWithVal = normalizeWord(filterEndsWith, currentLanguage).trim();
      const containsVal = normalizeWord(filterContains, currentLanguage).trim();
      const lengthVal = filterWordLength ? Number(filterWordLength.trim()) : NaN;

      for (const word of dictionary) {
        if (word.normalized.length > normalizedInput.length) continue;

        // Apply advanced advanced filters (Starts with, Ends with, Contains, Word length)
        if (startsWithVal && !word.normalized.startsWith(startsWithVal)) continue;
        if (endsWithVal && !word.normalized.endsWith(endsWithVal)) continue;
        if (containsVal && !word.normalized.includes(containsVal)) continue;
        if (!isNaN(lengthVal) && word.normalized.length !== lengthVal) continue;

        const wordCounts = getCharCounts(word.normalized);
        let possible = true;
        for (const char in wordCounts) {
          if (!targetCounts[char] || wordCounts[char] > targetCounts[char]) {
            possible = false;
            break;
          }
        }
        if (possible) {
          const len = word.original.length;
          if (!matched[len]) matched[len] = [];
          matched[len].push(word.original);
        }
      }
      Object.keys(matched).forEach(len => matched[Number(len)].sort());
      setUnscrambleResults(matched);
      setUnscrambleIsProcessing(false);

      // Instantly scroll results into focus smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById('unscrambler-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }, 0);
  }, [unscrambleInput, dictionary, filterStartsWith, filterEndsWith, filterContains, filterWordLength, currentLanguage]);

  const handleAnagramProcess = useCallback((overrideInput?: string) => {
    const query = typeof overrideInput === 'string' ? overrideInput : anagramInput;
    if (!query || query.length < 2) return;
    setAnagramIsProcessing(true);
    setTimeout(() => {
      const normalizedInput = normalizeWord(query, currentLanguage);
      const targetCounts = getCharCounts(normalizedInput);
      const matched: Record<number, string[]> = {};

      for (const word of dictionary) {
        if (word.normalized.length !== normalizedInput.length) continue;

        const wordCounts = getCharCounts(word.normalized);
        let possible = true;
        for (const char in wordCounts) {
          if (!targetCounts[char] || wordCounts[char] > targetCounts[char]) {
            possible = false;
            break;
          }
        }
        if (possible) {
          const len = word.original.length;
          if (!matched[len]) matched[len] = [];
          matched[len].push(word.original);
        }
      }
      Object.keys(matched).forEach(len => matched[Number(len)].sort());
      setAnagramResults(matched);
      setAnagramIsProcessing(false);

      // Instantly scroll results into focus smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById('unscrambler-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }, 0);
  }, [anagramInput, dictionary, currentLanguage]);

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
      title: `UnscramblerHub - ${word}`,
      text: `Found the word "${word.toUpperCase()}" using UnscramblerHub! Check it out:`,
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
      navigator.clipboard.writeText(`Check out "${word.toUpperCase()}" on UnscramblerHub: ${window.location.href}`);
      setSharedWord(word);
      setTimeout(() => setSharedWord(null), 2000);
    }
  };

  const unscrambleSortedLengths = useMemo(() => Object.keys(unscrambleResults).map(Number).sort((a, b) => b - a), [unscrambleResults]);
  const unscrambleTotalFound = useMemo(() => Object.values(unscrambleResults).reduce((acc: number, curr: string[]) => acc + curr.length, 0), [unscrambleResults]);

  const anagramSortedLengths = useMemo(() => Object.keys(anagramResults).map(Number).sort((a, b) => b - a), [anagramResults]);
  const anagramTotalFound = useMemo(() => Object.values(anagramResults).reduce((acc: number, curr: string[]) => acc + curr.length, 0), [anagramResults]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-[#fdfdfb] text-slate-800'} font-sans flex flex-col transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`px-6 md:px-12 py-6 flex flex-col border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white/50'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex justify-between items-center w-full">
          <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.svg" alt="UnscramblerHub Logo" className={`w-10 h-10 rounded-xl shadow-lg ${isDarkMode ? 'shadow-teal-900/20' : 'shadow-teal-100'} object-contain bg-white p-1`} referrerPolicy="no-referrer" />
            <div>
              <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} block leading-tight`}>UnscramblerHub</span>
              <span className={`text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>Ultimate Word Engine</span>
            </div>
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <div className={`flex gap-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <a href="/unscrambler" onClick={(e) => { e.preventDefault(); navigateTo('unscrambler'); }} className={`${view === 'unscrambler' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'unscrambler' ? '' : 'border-transparent'}`}>Unscrambler</a>
              <a href="/anagram-solver" onClick={(e) => { e.preventDefault(); navigateTo('anagram-solver'); }} className={`${view === 'anagram-solver' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'anagram-solver' ? '' : 'border-transparent'}`}>Anagram Solver</a>
              <a href="/words-az" onClick={(e) => { e.preventDefault(); navigateTo('words-az'); }} className={`${view === 'words-az' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'words-az' ? '' : 'border-transparent'}`}>Words A-Z</a>
              <a href="/dictionary" onClick={(e) => { e.preventDefault(); navigateTo('dictionary'); }} className={`${view === 'dictionary' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'dictionary' ? '' : 'border-transparent'}`}>Dictionary</a>
              <a href="/blog" onClick={(e) => { e.preventDefault(); navigateTo('blog'); }} className={`${view === 'blog' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'blog' ? '' : 'border-transparent'}`}>Blog</a>
              <a href="/strategy" onClick={(e) => { e.preventDefault(); navigateTo('strategy'); }} className={`${view === 'strategy' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'strategy' ? '' : 'border-transparent'}`}>Strategy Guide</a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} className={`${view === 'about' ? (isDarkMode ? 'text-teal-400 border-teal-400' : 'text-teal-600 border-teal-600') : (isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600')} pb-1 border-b-2 transition-colors ${view === 'about' ? '' : 'border-transparent'}`}>About</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                    <div className="fixed inset-0 z-45" onClick={() => setIsLangDropdownOpen(false)} />
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

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
                <a href="/unscrambler" onClick={(e) => { e.preventDefault(); navigateTo('unscrambler'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'unscrambler' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Unscrambler</a>
                <a href="/anagram-solver" onClick={(e) => { e.preventDefault(); navigateTo('anagram-solver'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'anagram-solver' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Anagram Solver</a>
                <a href="/words-az" onClick={(e) => { e.preventDefault(); navigateTo('words-az'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'words-az' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Words A-Z</a>
                <a href="/dictionary" onClick={(e) => { e.preventDefault(); navigateTo('dictionary'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'dictionary' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Dictionary</a>
                <a href="/blog" onClick={(e) => { e.preventDefault(); navigateTo('blog'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'blog' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Blog</a>
                <a href="/strategy" onClick={(e) => { e.preventDefault(); navigateTo('strategy'); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'strategy' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>Strategy Guide</a>
                <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('about'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-teal-500/10 ${view === 'about' ? (isDarkMode ? 'text-teal-400 bg-teal-400/5' : 'text-teal-600 bg-slate-100') : ''}`}>About</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 flex flex-col px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {view === 'home' && (
          <HomeView
            isDarkMode={isDarkMode}
            currentLanguage={currentLanguage}
            homeUnscrambleInput={homeUnscrambleInput}
            setHomeUnscrambleInput={setHomeUnscrambleInput}
            homeAnagramInput={homeAnagramInput}
            setHomeAnagramInput={setHomeAnagramInput}
            cleanInput={cleanInput}
            navigateTo={navigateTo}
          />
        )}

        {view === 'unscrambler' && (
          <UnscramblerView
            isDarkMode={isDarkMode}
            currentLanguage={currentLanguage}
            currentLangObj={currentLangObj}
            input={unscrambleInput}
            setInput={setUnscrambleInput}
            cleanInput={cleanInput}
            filterStartsWith={filterStartsWith}
            setFilterStartsWith={setFilterStartsWith}
            filterEndsWith={filterEndsWith}
            setFilterEndsWith={setFilterEndsWith}
            filterContains={filterContains}
            setFilterContains={setFilterContains}
            filterWordLength={filterWordLength}
            setFilterWordLength={setFilterWordLength}
            isOptionsExpanded={isOptionsExpanded}
            setIsOptionsExpanded={setIsOptionsExpanded}
            handleProcess={handleUnscrambleProcess}
            isProcessing={unscrambleIsProcessing}
            isDictLoading={isDictLoading}
            totalFound={unscrambleTotalFound}
            sortedLengths={unscrambleSortedLengths}
            results={unscrambleResults}
            fetchDefinition={fetchDefinition}
            shareWord={shareWord}
            sharedWord={sharedWord}
            copyToClipboard={copyToClipboard}
            copiedWord={copiedWord}
            navigateTo={navigateTo}
          />
        )}

        {view === 'anagram-solver' && (
          <AnagramSolverView
            isDarkMode={isDarkMode}
            currentLanguage={currentLanguage}
            currentLangObj={currentLangObj}
            input={anagramInput}
            setInput={setAnagramInput}
            cleanInput={cleanInput}
            handleProcess={handleAnagramProcess}
            isProcessing={anagramIsProcessing}
            isDictLoading={isDictLoading}
            totalFound={anagramTotalFound}
            sortedLengths={anagramSortedLengths}
            results={anagramResults}
            fetchDefinition={fetchDefinition}
            shareWord={shareWord}
            sharedWord={sharedWord}
            copyToClipboard={copyToClipboard}
            copiedWord={copiedWord}
            navigateTo={navigateTo}
          />
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
                  <h1 className={`text-5xl md:text-6xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>UnscramblerHub Blog</h1>
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
                      <motion.a 
                        key={post.id} 
                        href={`/blog/${post.id}`}
                        whileHover={{ y: -8 }}
                        onClick={(e) => { e.preventDefault(); navigateTo('blog', post.id); }} 
                        className={`p-10 ${isDarkMode ? 'bg-slate-900 border-slate-800/50 hover:shadow-teal-900/10' : 'bg-white border-slate-100 hover:shadow-xl'} border rounded-[2rem] shadow-sm transition-all cursor-pointer flex flex-col h-full block`}
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
                      </motion.a>
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
                  if (mode === 'unscramble') {
                    navigateTo('unscrambler');
                  } else {
                    navigateTo('anagram-solver');
                  }
                }}
              />
            )}
          </div>
        )}

        {view === 'about' && (
          <div className="max-w-4xl mx-auto w-full py-16 px-4">
            <link rel="canonical" href="https://unscramblerhub.com/about" />
            
            <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              About UnscramblerHub
            </h1>
            
            <p className={`text-lg md:text-xl font-bold mb-8 leading-relaxed ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
              Welcome to UnscramblerHub.com, your ultimate digital companion for word games, puzzles, and linguistic exploration.
            </p>

            <div className={`prose max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-12 space-y-6 text-base md:text-lg`}>
              <p className="leading-relaxed">
                UnscramblerHub was founded in late 2024 by Liam, a software developer and word-game enthusiast, initially to solve a "vowel dump" issue during a family Scrabble night. He wanted to build an extremely fast, clean, and responsive tool that doesn't suffer from the sluggish loading speeds and heavy ad-clutter of traditional word solver websites. Today, UnscramblerHub is a high-performance, responsive platform designed for word game players globally. Whether you are locked in a high-stakes family battle of Scrabble, trying to preserve your daily streak on Wordle, deciphering a complex crossword puzzle, or tackling a classic anagram jumble, UnscramblerHub ensures you never stay stuck for long.
              </p>

              <h2 className={`text-2xl font-bold mt-10 mb-4 ${isDarkMode ? 'text-slate-105' : 'text-slate-800'}`}>
                Our Mission
              </h2>
              <p className="leading-relaxed">
                Our core goal is to bridge the gap between utility and education. We don't believe an anagram solver should just be a tool for quick answers; we believe it should be a powerful instrument for learning. We design our algorithms to quickly and accurately untangle chaotic letter combinations, while actively structuring our platform to help users discover new vocabulary, understand English syllable structures, and train their minds to see patterns faster.
              </p>

              <h2 className={`text-2xl font-bold mt-10 mb-4 ${isDarkMode ? 'text-slate-105' : 'text-slate-800'}`}>
                What We Value
              </h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Accessibility:</strong> We believe powerful digital tools should be clean, lightning-fast, intuitive, and completely free to use on any device.
                </li>
                <li>
                  <strong>Linguistic Integrity:</strong> Our solvers rely on verified, comprehensive master dictionaries that align with standard competitive word-game regulations.
                </li>
                <li>
                  <strong>Cognitive Growth:</strong> We don't just want to help you win your next turn—we want to help you build a richer, deeper vocabulary that stays with you long after the game board is packed away.
                </li>
              </ul>

              <p className="leading-relaxed pt-4">
                Thank you for making UnscramblerHub your go-to destination for all things words. Grab your letter tiles, clear your rack, and let's solve some puzzles together!
              </p>

              <h2 className={`text-2xl font-bold mt-10 mb-4 ${isDarkMode ? 'text-slate-105' : 'text-slate-800'}`}>
                Verified Solver Technology & Core Lexicons
              </h2>
              
              <p className="leading-relaxed">
                To guarantee high utility and original, high-quality answers rather than simple word lists, our platform relies on specialized data processing logic and verified word repositories:
              </p>

              <div className="overflow-x-auto my-6 border rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}>
                    <tr>
                      <th className="px-4 py-3 text-left font-bold tracking-wider">Service Tool</th>
                      <th className="px-4 py-3 text-left font-bold tracking-wider">Core Technology</th>
                      <th className="px-4 py-3 text-left font-bold tracking-wider">Lexicon Base</th>
                      <th className="px-4 py-3 text-left font-bold tracking-wider">Primary Benefit</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-200 ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-white text-slate-700'}`}>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Word Unscrambler</td>
                      <td className="px-4 py-3">Client-Side Jumble Solver</td>
                      <td className="px-4 py-3">SOWPODS & TWL06 Lexicon Lists</td>
                      <td className="px-4 py-3">Instant letter unscrambling</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Anagram Solver</td>
                      <td className="px-4 py-3">Letter Permutation Array</td>
                      <td className="px-4 py-3">Standard English Vocabulary</td>
                      <td className="px-4 py-3">Finds exact matches quickly</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Dictionary Lookup</td>
                      <td className="px-4 py-3">JSON Request Protocol</td>
                      <td className="px-4 py-3">Free Dictionary API database</td>
                      <td className="px-4 py-3">Clean definitions and usage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className={`flex items-center gap-2 ${isDarkMode ? 'text-teal-400 border-teal-400 hover:bg-teal-400/10' : 'text-teal-700 border-teal-700 hover:bg-teal-50 border'} font-bold px-6 py-3 rounded-2xl transition-colors`}>
                <ArrowLeft size={18} /> Back to Home
              </a>
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

            {/* Frequently Asked Questions Before Contacting & Physical Address Guidelines */}
            <div className="md:col-span-2 mt-12 pt-12 border-t border-slate-700/20 space-y-12">
              <div>
                <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Frequently Asked Questions Before Contacting
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                  Before sending us an email, please review these common questions regarding our word solvers, anagram indexes, and partnership opportunities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                      Can I request custom word list filters?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Yes! We are constantly updating our dictionary databases. If you find a word is missing or would like to request new Scrabble / Wordle letter patterns, please contact us with details.
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                      Is my user data tracked when I unscramble letters?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Absolutely not. All word solving, anagram matching, and letter unscrambling is executed directly on your client browser. We do not store or track any letter combinations you search.
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                      How do I submit feedback about definitions?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      If you notice any typo or incorrect explanation in our dictionary meanings modal, copy the word and send it to our support email. We process updates weekly.
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                      Advertising and Business Inquiries
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      For header bidding, direct sponsorships, or premium ad placement requests, please mention your ad network name and traffic requirements in your message.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                <div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} mb-1`}>
                    UnscramblerHub Software Group (UnscramblerHub Headquarters)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Registered Digital Publisher • Compliance Office Code: UH-992-B
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-500 font-semibold">100 Main Street, Suite 400</p>
                  <p className="text-xs text-slate-500">New York, NY 10001, United States</p>
                  <p className="text-xs text-slate-500">Email: legal@unscramblerhub.com</p>
                </div>
              </div>
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
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className={`mt-16 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold inline-flex`}>
              <ArrowLeft size={18} /> Back to Home
            </a>
          </div>
        )}

        {view === 'terms' && (
          <div className="max-w-4xl mx-auto w-full py-16 px-4">
            <link rel="canonical" href="https://unscramblerhub.com/terms" />
            
            <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Terms of Service & Disclaimer
            </h1>
            
            <p className="text-slate-500 mb-8">Last Updated: June 29, 2026</p>

            <div className={`p-6 rounded-2xl mb-10 border ${isDarkMode ? 'bg-slate-950/50 border-teal-500/20 text-teal-400' : 'bg-teal-50/50 border-teal-700/20 text-teal-900'} text-base md:text-lg leading-relaxed`}>
              <strong>By using the word tools, unscrambling engines, and dictionary search forms at UnscramblerHub, you fully agree to these simple Terms of Service, Acceptable Use rules, and Third-Party Intellectual Property Disclaimers.</strong>
            </div>

            <div className={`prose max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} space-y-8 text-base md:text-lg`}>
              
              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  1. Acceptable Use
                </h2>
                <p className="leading-relaxed">
                  The tools and word finders provided at <a href="https://unscramblerhub.com" className="font-semibold underline hover:text-teal-500">https://unscramblerhub.com</a> are meant to help you as an educational and recreational word-game helper. You are welcome to input jumbled letters to find valid words, learn anagram paths, and improve your spelling skills. Automated web scraping, bots, and trying to overload our client-side systems are not permitted.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  2. Third-Party Trademarks (Disclaimer)
                </h2>
                <p className="leading-relaxed mb-4">
                  To keep things clear for our visitors and search networks, we declare that our site is completely independent of all official game brands:
                </p>
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-red-500/10 text-slate-300' : 'bg-red-50/30 border-red-200 text-slate-700'} text-sm leading-relaxed mb-6`}>
                  <strong>TRADEMARK NOTICE:</strong> UnscramblerHub is a completely independent digital property. We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Mattel, Hasbro, Scrabble, Words with Friends, Zynga, or The New York Times (Wordle). All trademarks and registered logos are the property of their respective owners, and our educational word solver is offered strictly under fair-use guidelines.
                </div>
              </section>

              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  3. Ads, Cookies & Monetization
                </h2>
                <p className="leading-relaxed">
                  We display programmatic advertisements served by third-party networks like Google AdSense to keep our word solvers 100% free. By using this site, you agree to cookie tracking as described in our <a href="https://unscramblerhub.com/policy" onClick={(e) => { e.preventDefault(); navigateTo('policy'); }} className="font-semibold underline hover:text-teal-500">Privacy Policy</a>. You can manage your ad personalization settings at any time.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  4. Tool Limits & Operating Guidelines
                </h2>
                <p className="leading-relaxed mb-4">
                  The following simple table defines the guidelines and limits of our word finder services:
                </p>

                <div className="overflow-x-auto my-6 border rounded-xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className={isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left font-bold tracking-wider">Service Route</th>
                        <th className="px-4 py-3 text-left font-bold tracking-wider">Usage Category</th>
                        <th className="px-4 py-3 text-left font-bold tracking-wider">Operational Limit</th>
                        <th className="px-4 py-3 text-left font-bold tracking-wider">Privacy Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-200 ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-white text-slate-700'}`}>
                      <tr>
                        <td className="px-4 py-3 font-semibold">Word Unscrambler</td>
                        <td className="px-4 py-3">Educational Helper</td>
                        <td className="px-4 py-3">Up to 15 Letters per Search</td>
                        <td className="px-4 py-3">100% client-side browser processing</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold">Anagram Solver</td>
                        <td className="px-4 py-3">Letter Permutations</td>
                        <td className="px-4 py-3">Finds exact anagram matches</td>
                        <td className="px-4 py-3">No search letters are ever saved</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold">Dictionary Lookup</td>
                        <td className="px-4 py-3">Spelling & Meanings</td>
                        <td className="px-4 py-3">Fetch dynamic definitions</td>
                        <td className="px-4 py-3">Only word queries sent to external API</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  5. No Warranties & Limitations
                </h2>
                <p className="leading-relaxed">
                  All services, word lists, point values, and definitions are provided on an "as-is" and "as-available" basis. Dictionaries can change, so we cannot guarantee 100% agreement with live game tournament rules or individual boards. We are not responsible for any competitive gameplay losses, search discrepancies, or temporary offline service issues.
                </p>
              </section>

              <section>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  6. Contact Us
                </h2>
                <p className="leading-relaxed">
                  If you have questions about trademarks, terms, or server setups, please reach out via our official contact page at <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }} className="font-semibold underline hover:text-teal-500">https://unscramblerhub.com/contact</a> or send an email directly to <strong>hello@unscramblerhub.com</strong>.
                </p>
              </section>

            </div>

            <div className="flex justify-center mt-12">
              <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className={`flex items-center gap-2 ${isDarkMode ? 'text-teal-400 border-teal-400 hover:bg-teal-400/10' : 'text-teal-700 border-teal-700 hover:bg-teal-50 border'} font-bold px-6 py-3 rounded-2xl transition-colors`}>
                <ArrowLeft size={18} /> Back to Home
              </a>
            </div>
          </div>
        )}

        {view === 'strategy' && (
          <div className="max-w-4xl mx-auto w-full py-16 px-4">
            <link rel="canonical" href="https://unscramblerhub.com/strategy" />
            
            {/* Elegant Article Tab Selector */}
            <div className="flex justify-center mb-10">
              <div className={`flex p-1.5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              } shadow-inner`}>
                <button
                  onClick={() => setActiveStrategyArticle('unscrambling')}
                  className={`px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    activeStrategyArticle === 'unscrambling'
                      ? (isDarkMode ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-teal-600 text-white shadow-md shadow-teal-600/10')
                      : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  Word Unscrambling
                </button>
                <button
                  onClick={() => setActiveStrategyArticle('anagramming')}
                  className={`px-6 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    activeStrategyArticle === 'anagramming'
                      ? (isDarkMode ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-teal-600 text-white shadow-md shadow-teal-600/10')
                      : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  Word Anagramming
                </button>
              </div>
            </div>

            {activeStrategyArticle === 'unscrambling' ? (
              <>
                <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  The Psychology and Strategy of Word Unscrambling
                </h1>
                <p className={`text-lg md:text-xl text-center font-bold mb-12 leading-relaxed ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  How to Train Your Brain to See Hidden Words
                </p>
              </>
            ) : (
              <>
                <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  The Psychology and Strategy of Word Anagramming
                </h1>
                <p className={`text-lg md:text-xl text-center font-bold mb-12 leading-relaxed ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  How to Train Your Brain
                </p>
              </>
            )}

            {/* Interactive Strategy Feature: Cognitive Training Playground */}
            {activeStrategyArticle === 'unscrambling' ? (
              <div className="mb-12">
                <h3 className={`text-sm font-black uppercase tracking-widest text-center mb-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  Cognitive Training: Interactive Unscrambler Game
                </h3>
                <p className="text-xs text-center mb-6 max-w-md mx-auto leading-relaxed text-slate-400">
                  Staring at static letter rows creates a cognitive bottleneck. Physically moving your letter tiles is the fastest way to trigger pattern recognition. Click tiles or type on your keyboard to solve!
                </p>
                
                <CognitiveGame isDarkMode={isDarkMode} />
              </div>
            ) : (
              <div className="mb-12">
                <h3 className={`text-sm font-black uppercase tracking-widest text-center mb-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  Cognitive Training: Interactive Anagram Matcher
                </h3>
                <p className="text-xs text-center mb-6 max-w-md mx-auto leading-relaxed text-slate-400">
                  Orthographic fixation forces our brains to see only the original word. By actively rearranging letters into alternative structures, you train your brain to break the Einstellung effect. Click tiles or type on your keyboard to solve!
                </p>
                
                <AnagramGame isDarkMode={isDarkMode} />
              </div>
            )}

            {activeStrategyArticle === 'unscrambling' ? (
              <div className={`prose max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} space-y-8 text-base md:text-lg leading-relaxed`}>
                
                <section className="space-y-4">
                  <p>
                    For decades, word games have held a legendary status in the realm of casual gaming and competitive puzzles. From the classic living room battles of Scrabble® to the global, daily ritual of Wordle®, millions of people spend their mornings and evenings staring at a jumble of letters, trying to force order out of chaos.
                  </p>
                  <p>
                    But what actually happens inside the human brain when we try to unscramble words? Why do some people spot a seven-letter panagram instantly, while others struggle to find a basic three-letter word in the exact same pile?
                  </p>
                  <p>
                    Unscrambling words isn't just an innate talent; it is a cognitive skill rooted in visual psychology, pattern recognition, and structural linguistics. By understanding how your brain processes mixed-up letter strings, you can actively train your mind to see hidden words faster, elevate your competitive game play, and turn any word solver tool into a powerful personal coach.
                  </p>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    The Cognitive Science Behind Anagrams
                  </h2>
                  <p>
                    To master word games, it helps to first understand the mental hurdles your brain must overcome. When you read a normal sentence, your brain doesn't actually process every letter individually. Instead, it recognizes words as complete shapes—a cognitive phenomenon known as <strong>word shape recognition</strong> or <strong>orthographic processing</strong>.
                  </p>
                  <p>
                    When letters are scrambled into an anagram, this shortcut backfires. Your brain tries to read the jumble as a cohesive unit, gets confused by the lack of a familiar shape, and experiences a form of cognitive friction.
                  </p>
                  <p>
                    Psychologists have noted that our brains love order. When faced with a word scramble, your working memory attempts to mentally rotate, shift, and substitute letters into configurations that match your internal lexicon (your mental dictionary). If your letter pool contains a rare letter like Q, X, or Z, the brain often fixates heavily on that outlier, creating a mental bottleneck that blocks you from noticing simpler vowel-consonant arrangements hiding right next to it.
                  </p>
                </section>

                <section className="space-y-6 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Advanced Tactics for Competitive Word Play
                  </h2>
                  <p>
                    Whether you are matching wits in Words with Friends® or competing in a local Scrabble® tournament, relying on raw intuition will only get you so far. Top-tier players utilize systematic visual strategies to dismantle word puzzles piece by piece.
                  </p>

                  <div className="space-y-4 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      1. The Spatial Re-arrangement Technique
                    </h3>
                    <p>
                      Staring at a stagnant row of tiles forces your brain to repeatedly view the same incorrect patterns. One of the simplest yet most effective adjustments you can make is to physically move your tiles.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                      <li>
                        <strong>The Circular Method:</strong> If playing a digital game, or if you can move your physical tiles, arrange the letters in a circle rather than a linear line. A circle eliminates the concept of a "beginning" and an "ending," allowing your peripheral vision to naturally bridge vowels and consonants from entirely new angles.
                      </li>
                      <li>
                        <strong>The Vowel/Consonant Split:</strong> Separate your vowels (A, E, I, O, U) from your consonants. Push the vowels to the top row and the consonants to the bottom. This layout mirrors the basic architectural blueprint of the English language, making it instantly easier to see how many syllables you can construct.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      2. High-Value Tile Anchoring
                    </h3>
                    <p>
                      In games like Scrabble®, standard letters like E, A, R, and T are easy to place but yield low point values. Conversely, letters like J, K, Q, X, and Z are high-scoring goldmines. To maximize your score, practice anchoring.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                      <li>
                        Pick your highest-value letter or your rarest consonant.
                      </li>
                      <li>
                        Mentally or physically test that letter in the three primary word positions: at the very beginning of a word, in the exact middle, or at the very end.
                      </li>
                      <li>
                        Build outward from that specific anchor point rather than trying to puzzle out all seven or eight letters simultaneously.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      3. Syllable and Morphological Tracking
                    </h3>
                    <p>
                      Instead of trying to find a massive, complex word out of nowhere, look for small, foundational structural units called morphemes.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                      <li>
                        Scan your letters for common combinations that frequently appear together in English speech, such as CH, SH, TH, WH, PH, CK, and QU.
                      </li>
                      <li>
                        When you identify a pair like TH, stack those two tiles directly on top of each other or move them close together. By treating a letter pair as a single functional unit, you drastically reduce the cognitive load on your working memory, transforming an overwhelming seven-letter problem into a much simpler five-step puzzle.
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    How to Use a Word Unscrambler Responsibly as a Study Guide
                  </h2>
                  <p>
                    There is a common misconception that utilizing a digital word solver is simply "cheating." While using an unscrambler mid-game to defeat an opponent without their knowledge defeats the competitive spirit, these tools are actually invaluable linguistic aids when integrated into your regular practice routine.
                  </p>

                  {/* Study Flow Diagram */}
                  <div className={`p-6 rounded-2xl border text-center my-8 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/50 border-slate-250'
                  }`}>
                    <h4 className={`text-xs uppercase font-black tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      The Ideal Post-Game Study Flow
                    </h4>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-xs font-bold font-mono">
                      <span className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-teal-400' : 'bg-white border border-slate-200 text-teal-700 shadow-sm'}`}>1. Play Match</span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-teal-400' : 'bg-white border border-slate-200 text-teal-700 shadow-sm'}`}>2. Save Board State</span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-teal-400' : 'bg-white border border-slate-200 text-teal-700 shadow-sm'}`}>3. Run Solver</span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-teal-400' : 'bg-white border border-slate-200 text-teal-700 shadow-sm'}`}>4. Analyze Missed Words</span>
                    </div>
                  </div>

                  <p>
                    Grandmasters in chess use software to analyze their completed games and find missed tactical opportunities. You can use UnscramblerHub in the exact same manner:
                  </p>
                  <ul className="list-disc pl-6 space-y-3 text-sm md:text-base">
                    <li>
                      <strong>Post-Game Diagnostics:</strong> After completing a tough match or a daily word puzzle, input the exact rack of letters you struggled with into the solver. Look at the highest-scoring words you completely missed. Ask yourself: Why didn't I see that combination? Was I trapped by a prefix? Did I misjudge my vowel distribution?
                    </li>
                    <li>
                      <strong>Active Vocabulary Expansion:</strong> When the solver generates a high-scoring or unusual word that you’ve never seen before, don't just gloss over it. Look up its definition, understand its part of speech, and commit it to memory. The next time those specific tiles land on your rack, you won't need a tool—your trained brain will recognize the shape instantly.
                    </li>
                    <li>
                      <strong>Pattern Familiarization:</strong> Using a solver exposes you to the structural boundaries of language. You will start to notice how frequently certain suffixes like -OUS or -ISM create massive scoring spikes, intuitively changing how you conserve and manage your letter tiles in future games.
                    </li>
                  </ul>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Conclusion: Exercise Your Mind
                  </h2>
                  <p>
                    At its core, word unscrambling is a beautiful synthesis of logic, visual processing, and language art. Your brain is highly adaptive; the more you challenge it to break down complex, chaotic letter clusters, the faster and sharper your linguistic instincts will become. Use structural strategies, change your physical perspective when you hit a wall, and utilize your word unscrambler as an interactive coach to permanently level up your word-gaming skills.
                  </p>
                </section>

              </div>
            ) : (
              <div className={`prose max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} space-y-8 text-base md:text-lg leading-relaxed`}>
                
                <section className="space-y-4">
                  <p>
                    Anagramming—the act of rearranging the letters of a word or phrase to produce a new word or phrase—is often viewed as a casual pastime found on the back pages of newspapers or tucked inside mobile puzzle apps. However, beneath this deceptive simplicity lies a complex cognitive matrix.
                  </p>
                  <p>
                    Mastering anagrams is not merely a byproduct of a massive vocabulary. It is an intricate interplay of visual-spatial processing, cognitive flexibility, executive functioning, and working memory. To consistently crack complex jumbles, one must move past brute-force guessing and implement a systematic, scientifically backed strategy.
                  </p>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    1. The Cognitive Architecture of Anagramming
                  </h2>
                  <p>
                    To understand how to train your brain for anagramming, we must first look at what happens inside the cerebral cortex when you confront a jumbled string of text like <strong>TEHAPL</strong>.
                  </p>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      The Orthographic Processing Trap
                    </h3>
                    <p>
                      When humans read, they do not look at every single letter individually. Instead, the brain utilizes a mechanism known as <strong>orthographic processing</strong> to recognize words as complete units based on their shape and familiar letter groupings. The brain’s visual word form area (VWFA) acts as a highly specialized scanner that matches visual inputs with an internal dictionary.
                    </p>
                    <p>
                      In anagramming, this evolutionary shortcut becomes a cognitive liability. Your brain looks at a jumbled string and desperately tries to force a pattern where none exists, often locking onto a nonsense word or an incorrect root. Psychologists call this cognitive fixation or the <strong>Einstellung effect</strong>—the tendency to approach a problem with a rigid, preconceived mindset.
                    </p>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Working Memory Capacity
                    </h3>
                    <p>
                      Solving an anagram requires you to hold a set of letters in your mind while simultaneously manipulating their spatial order. This process relies heavily on the phonological loop and the visuospatial sketchpad, two core sub-components of your working memory.
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-sm md:text-base">
                      <li>
                        <strong>The Phonological Loop:</strong> Handles verbal and auditory information (subvocally repeating letter combinations).
                      </li>
                      <li>
                        <strong>The Visuospatial Sketchpad:</strong> Handles visual imagery (mentally moving a "P" to the front of the string).
                      </li>
                    </ul>
                    <p>
                      Because the average adult working memory can only hold about four to seven chunks of information at a time, long or complex anagrams quickly overload our mental RAM. Strategy, therefore, is about reducing this cognitive load.
                    </p>
                  </div>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    2. Advanced Structural Strategies for Deconstruction
                  </h2>
                  <p>
                    Elite anagram solvers do not randomly guess. They use structural linguistics to systematically break down the jumble. If you want to train your brain to operate like an algorithmic solver, you must adopt these architectural frameworks.
                  </p>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      The Nucleus Approach: Vowel-Consonant Clustering
                    </h3>
                    <p>
                      Every English word relies on predictable structures. Instead of staring at the letters as a flat line, mentally divide them into nuclei (vowels) and frames (consonants).
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                      <li>
                        <strong>Isolate the Vowels:</strong> Count the vowels and look at their ratios. A high volume of vowels indicates potential diphthongs (like EA, OU, AI) or specific suffixes.
                      </li>
                      <li>
                        <strong>Anchor the High-Value Consonants:</strong> Look for low-frequency consonants like Z, Q, X, J, K, V, or W. Because these letters have highly restrictive pairing rules in English, they serve as natural structural anchors. For example, a Q almost always demands a U; a J rarely ends a word.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Morphological Segmenting
                    </h3>
                    <p>
                      One of the fastest ways to clear mental space is to look for common morphological units—prefixes and suffixes. By locking a few letters into a fixed position, you drastically decrease the number of remaining permutations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl my-2 border font-mono text-xs text-center bg-slate-100/40 dark:bg-slate-950/40 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-teal-500 mb-1">Total Letters</div>
                        <div>7 (Permutations = 5,040)</div>
                      </div>
                      <div>
                        <div className="font-bold text-teal-500 mb-1">Identify Suffix</div>
                        <div>"-ING" (Leaves 4 letters)</div>
                      </div>
                      <div>
                        <div className="font-bold text-teal-500 mb-1">Remaining Permutations</div>
                        <div>24</div>
                      </div>
                    </div>
                    <p>
                      By identifying a simple three-letter suffix, you reduce your brain’s processing requirements from over five thousand combinations down to just twenty-four.
                    </p>

                    <div className="overflow-x-auto w-full mt-4">
                      <table className={`min-w-full text-xs md:text-sm border-collapse border rounded-xl overflow-hidden ${
                        isDarkMode ? 'border-slate-800' : 'border-slate-200'
                      }`}>
                        <thead>
                          <tr className={isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}>
                            <th className={`p-2.5 border text-left font-black ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Common Prefixes</th>
                            <th className={`p-2.5 border text-left font-black ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Common Suffixes</th>
                            <th className={`p-2.5 border text-left font-black ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>High-Probability Bigrams</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={`p-2.5 border ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>RE-, UN-, DE-, IN-, DIS-, PRE-</td>
                            <td className={`p-2.5 border ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>-ING, -ED, -TION, -ABLE, -MENT, -ESS</td>
                            <td className={`p-2.5 border ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>CH, SH, TH, WH, PH, CK, ST, QU</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    3. Spatial and Environmental Manipulation
                  </h2>
                  <p>
                    Because our brains are inherently prone to cognitive fixation when looking at static text, changing the physical or visual environment of the puzzle is a highly effective tactical override.
                  </p>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Spatial Geometric Rearrangement
                    </h3>
                    <p>
                      If you are staring an anagram presented in a straight horizontal line, your brain will naturally read it left-to-right, reinforcing the incorrect pattern.
                    </p>
                    <p className="font-medium text-teal-500">
                      The Fix: Rewrite the letters in a circle or a chaotic vertical cluster.
                    </p>
                    <p>
                      By stripping away the horizontal timeline of the letters, you disrupt the visual word form area's ability to lock onto an incorrect sequence. A circular layout forces the eye to jump randomly across consonants and vowels, sparking novel neural connections and allowing the correct word to "pop" out via insight or <em>Aha!</em> moments.
                    </p>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Tactile Manipulation
                    </h3>
                    <p>
                      For high-level training, use physical tiles (like Scrabble pieces). Moving letters physically engages your motor cortex. This tactile feedback loop adds another layer of sensory input to your working memory, making it significantly easier to track spatial transformations than trying to do it purely behind your eyelids.
                    </p>
                  </div>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    4. Neurological Training: Building the Anagramming Brain
                  </h2>
                  <p>
                    Neuroplasticity proves that the brain can rewire itself to become more efficient at specific tasks. To build an optimized anagramming intellect, you must practice targeted cognitive drills.
                  </p>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Drills for Neural Agility
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                      <li>
                        <strong>The Suffix Strip:</strong> Take random seven-letter words and practice isolating their endings instantly. Train your eyes to instantly see O-U-G-H or T-I-O-N as single visual blocks rather than individual letters.
                      </li>
                      <li>
                        <strong>The Inversion Drill:</strong> Practice reading short sentences backward or spelling common words in reverse. This weakens the rigid orthographic constraint that forces you to process text only in forward sequences.
                      </li>
                      <li>
                        <strong>Bigram/Trigram Flashcards:</strong> Memorize the statistical frequency of letter pairings in your native language. In English, H is incredibly likely to follow T, S, C, or P. Train your brain to view these pairs as inseparable units.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-teal-500/35">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      The Role of Dopamine and Alpha Waves
                    </h3>
                    <p>
                      Neuroscientific studies on puzzle-solving demonstrate that the sudden revelation of an anagram solution—the <em>Aha!</em> moment—is accompanied by a burst of alpha wave activity in the right hemisphere of the brain, followed closely by a surge of dopamine.
                    </p>
                    <p>
                      To maximize alpha waves, you need a state of relaxed focus. Straining, stressing, or over-focusing actually activates the left hemisphere's logical, analytical circuits, which are poorly suited for the diffuse, creative pattern-matching required for anagrams. If you get stuck, look away for thirty seconds. Let your diffuse thinking process take over in the background.
                    </p>
                  </div>
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    5. Summary Strategy Checklist
                  </h2>
                  <p>
                    When faced with a stubborn jumble, execute this strategic checklist sequence:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm md:text-base">
                      <input type="checkbox" className="mt-1 accent-teal-500 rounded" readOnly checked />
                      <span><strong>Disrupt Visual Order:</strong> Immediately rewrite the letters in a circle or vertical stack.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm md:text-base">
                      <input type="checkbox" className="mt-1 accent-teal-500 rounded" readOnly checked />
                      <span><strong>Inventory the Assets:</strong> Count your vowels and isolate rare consonants (Z, X, Q).</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm md:text-base">
                      <input type="checkbox" className="mt-1 accent-teal-500 rounded" readOnly checked />
                      <span><strong>Hunt for Suffixes/Prefixes:</strong> Scan for chunks like -ED, -ING, -EST, or RE-.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm md:text-base">
                      <input type="checkbox" className="mt-1 accent-teal-500 rounded" readOnly checked />
                      <span><strong>Anchor and Pivot:</strong> Place a high-probability consonant cluster at the start or end, then pivot the remaining letters around it.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm md:text-base">
                      <input type="checkbox" className="mt-1 accent-teal-500 rounded" readOnly checked />
                      <span><strong>Step Back:</strong> If fixation occurs, look away to allow right-hemisphere diffuse processing to break the deadlock.</span>
                    </li>
                  </ul>
                </section>

              </div>
            )}

            <div className="flex justify-center mt-12">
              <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className={`flex items-center gap-2 ${isDarkMode ? 'text-teal-400 border-teal-400 hover:bg-teal-400/10' : 'text-teal-700 border-teal-700 hover:bg-teal-50 border'} font-bold px-6 py-3 rounded-2xl transition-colors`}>
                <ArrowLeft size={18} /> Back to Home
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className={`px-6 md:px-12 py-10 ${isDarkMode ? 'bg-black text-slate-400' : 'bg-slate-900 text-slate-400'} mt-20 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="UnscramblerHub" className="w-6 h-6 rounded object-contain bg-white p-0.5" referrerPolicy="no-referrer" />
              <h4 className="text-white font-bold">UnscramblerHub</h4>
            </a>
            <p className="text-xs">World's fastest word extraction tool.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="/unscrambler" onClick={(e) => { e.preventDefault(); navigateTo('unscrambler'); }} className="hover:text-teal-400 text-left block">Scrabble Unscrambler</a></li>
              <li><a href="/anagram-solver" onClick={(e) => { e.preventDefault(); navigateTo('anagram-solver'); }} className="hover:text-teal-400 text-left block">Anagram Solver</a></li>
              <li><a href="/words-az" onClick={(e) => { e.preventDefault(); navigateTo('words-az'); }} className="hover:text-teal-400 text-left block">A-Z Word Finder</a></li>
            </ul>
          </div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Company</h5><ul className="space-y-2 text-xs"><li><a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} className="hover:text-teal-400 block">About</a></li><li><a href="/blog" onClick={(e) => { e.preventDefault(); navigateTo('blog'); }} className="hover:text-teal-400 block">Blog</a></li><li><a href="/strategy" onClick={(e) => { e.preventDefault(); navigateTo('strategy'); }} className="hover:text-teal-400 text-left block">Strategy Guide</a></li><li><a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }} className="hover:text-teal-400 block">Contact</a></li></ul></div>
          <div><h5 className="text-white font-bold mb-4 font-mono uppercase tracking-widest text-[10px]">Privacy</h5><ul className="space-y-2 text-xs"><li><a href="/policy" onClick={(e) => { e.preventDefault(); navigateTo('policy'); }} className="hover:text-teal-400 block">Policy</a></li><li><a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('terms'); }} className="hover:text-teal-400 block">Terms</a></li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto w-full pt-12 mt-12 border-t border-slate-800/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-4">
             © 2024-2026 UnscramblerHub • All Rights Reserved
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-600 normal-case font-normal leading-relaxed max-w-5xl">
            <strong>Legal Disclaimer:</strong> UnscramblerHub.com is an independent word-game utility and educational resource. UnscramblerHub is not affiliated with, authorized, maintained, sponsored, or endorsed by Hasbro Inc. (owners of Scrabble®), Mattel Inc., The New York Times Company (owners of Wordle®), or any of their respective affiliates, subsidiaries, or licensors. All trademarks, logos, and copyrights relating to these games are the sole property of their respective owners. This tool is intended strictly for educational and informational purposes.
          </p>
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
