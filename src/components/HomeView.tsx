import { Search, Zap, ChevronDown, RefreshCw, BookOpen, Bookmark, Award } from 'lucide-react';
import { FAQ_ITEMS } from '../content.ts';
import { WordplayGlossary } from './WordplayGlossary.tsx';

interface HomeViewProps {
  isDarkMode: boolean;
  currentLanguage: string;
  homeUnscrambleInput: string;
  setHomeUnscrambleInput: (val: string) => void;
  homeAnagramInput: string;
  setHomeAnagramInput: (val: string) => void;
  cleanInput: (val: string) => string;
  navigateTo: (view: any, slug?: string, initialInput?: string) => void;
}

export function HomeView({
  isDarkMode,
  currentLanguage,
  homeUnscrambleInput,
  setHomeUnscrambleInput,
  homeAnagramInput,
  setHomeAnagramInput,
  cleanInput,
  navigateTo,
}: HomeViewProps) {
  const handleUnscrambleLaunch = () => {
    const query = cleanInput(homeUnscrambleInput).toUpperCase();
    if (query.length > 0) {
      navigateTo('unscrambler', undefined, query);
    } else {
      navigateTo('unscrambler');
    }
  };

  const handleAnagramLaunch = () => {
    const query = cleanInput(homeAnagramInput).toUpperCase();
    if (query.length > 0) {
      navigateTo('anagram-solver', undefined, query);
    } else {
      navigateTo('anagram-solver');
    }
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Top Ad Slot */}
      <div id="top-ad-slot" className={`w-full min-h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl flex items-center justify-center text-xs font-mono`}>Advertisements</div>

      {/* Hero Welcome Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className={`text-5xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {currentLanguage === 'ar' ? 'مرحبًا بك في UnscramblerHub' : 'UnscramblerHub'}
        </h1>
        <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {currentLanguage === 'ar'
            ? 'الوجهة الأولى لتفكيك الكلمات، حل الألغاز، وحل الجناس الناقص بذكاء وسرعة فائقة.'
            : 'The premium word-game resource. Solve jumbled letters, find exact anagrams, and master your vocabulary instantly.'}
        </p>
      </section>

      {/* Bento Grid Tools Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unscrambler Card */}
        <div className={`flex flex-col p-8 rounded-3xl border-2 transition-all ${
          isDarkMode 
            ? 'bg-slate-900/60 border-slate-800/80 hover:border-teal-500/40 shadow-xl' 
            : 'bg-[#fafafa] border-slate-200 hover:border-[#e05300]/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center gap-3 mb-4 text-[#e05300]">
            <Search size={28} />
            <h2 className={`text-2xl font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {currentLanguage === 'ar' ? 'مفك تشفير الحروف' : 'Word Unscrambler'}
            </h2>
          </div>
          <p className={`text-sm md:text-base leading-relaxed mb-6 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentLanguage === 'ar'
              ? 'أدخل حروفك المبعثرة واعثر على كافة الكلمات الممكنة لـ Scrabble أو Words With Friends مع تطبيق خيارات التصفية المتقدمة.'
              : 'Enter scrambled letters to generate all playable words of any length. Perfect for Scrabble, Words With Friends, and crossword puzzles. Features length filters, prefixes, and suffixes.'}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              maxLength={15}
              value={homeUnscrambleInput}
              onChange={(e) => setHomeUnscrambleInput(cleanInput(e.target.value).toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleUnscrambleLaunch()}
              placeholder={currentLanguage === 'ar' ? 'أدخل حروفك...' : 'ENTER LETTERS'}
              className={`w-full h-14 px-5 rounded-2xl border-2 font-mono text-xl outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-850 text-white focus:border-teal-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-[#e05300]'
              }`}
            />
            <button
              onClick={handleUnscrambleLaunch}
              className="w-full h-14 font-black rounded-2xl text-white bg-[#e05300] hover:bg-[#c44700] transition-all tracking-wider uppercase text-sm shadow-md cursor-pointer"
            >
              {currentLanguage === 'ar' ? 'افتح أداة فك الحروف' : 'Launch Unscrambler'}
            </button>
          </div>
        </div>

        {/* Anagram Card */}
        <div className={`flex flex-col p-8 rounded-3xl border-2 transition-all ${
          isDarkMode 
            ? 'bg-slate-900/60 border-slate-800/80 hover:border-teal-500/40 shadow-xl' 
            : 'bg-[#fafafa] border-slate-200 hover:border-teal-600/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center gap-3 mb-4 text-teal-500">
            <Zap size={28} />
            <h2 className={`text-2xl font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {currentLanguage === 'ar' ? 'محلل الجناس الناقص' : 'Anagram Solver'}
            </h2>
          </div>
          <p className={`text-sm md:text-base leading-relaxed mb-6 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentLanguage === 'ar'
              ? 'ابحث عن الجناس الناقص المطابق تماماً في الطول والحروف. لا يسمح بإغفال أو إضافة أي حرف من المدخلات.'
              : 'Execute a strict character-to-character exact-length jumble solve. Perfect for anagram puzzles, daily newspaper jumbles, and cryptic crosswords where every letter must be used.'}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              maxLength={15}
              value={homeAnagramInput}
              onChange={(e) => setHomeAnagramInput(cleanInput(e.target.value).toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAnagramLaunch()}
              placeholder={currentLanguage === 'ar' ? 'أدخل حروف الجناس...' : 'ENTER ANAGRAM'}
              className={`w-full h-14 px-5 rounded-2xl border-2 font-mono text-xl outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-850 text-white focus:border-teal-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
              }`}
            />
            <button
              onClick={handleAnagramLaunch}
              className="w-full h-14 font-black rounded-2xl text-white bg-teal-600 hover:bg-teal-700 transition-all tracking-wider uppercase text-sm shadow-md cursor-pointer"
            >
              {currentLanguage === 'ar' ? 'افتح محلل الجناس' : 'Launch Anagram Solver'}
            </button>
          </div>
        </div>
      </section>

      {/* Feature Selling Points */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-100'} text-center space-y-2`}>
          <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500"><RefreshCw size={24} /></div>
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Instant Solves</h3>
          <p className="text-xs text-slate-500">370,000+ words compiled and searched locally in sub-milliseconds.</p>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-100'} text-center space-y-2`}>
          <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500"><BookOpen size={24} /></div>
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Official Dictionary</h3>
          <p className="text-xs text-slate-500">Fully compliant with international Scrabble and crossword word lists.</p>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-100'} text-center space-y-2`}>
          <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500"><Bookmark size={24} /></div>
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Detailed Definitions</h3>
          <p className="text-xs text-slate-500">Click any resolved candidate to inspect its grammatical meaning instantly.</p>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-100'} text-center space-y-2`}>
          <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500"><Award size={24} /></div>
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Scrabble Scoring</h3>
          <p className="text-xs text-slate-500">Points mapped and calculated exactly according to official game guidelines.</p>
        </div>
      </section>

      {/* High-Value Educational Content Section (AdSense Compliance) */}
      <section className={`pt-16 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto px-4`}>
        <div className="space-y-12">
          {/* Section 1: Ultimate Guide Header */}
          <div className="space-y-4">
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Mastering the Art of Word Unscrambling: More Than Just a Solver
            </h2>
            <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Welcome to the Ultimate Word Unscrambler Guide on UnscramblerHub.com. 
              Whether you are trying to secure a win in Scrabble, break through a stubborn level in Words With Friends, 
              solve crossword clues, or find perfect anagrams, you are engaging in a highly enriching brain practice. 
              Our suite of professional word tools is built to serve as a high-value educational reference, helping you 
              transform chaotic letter tiles into high-scoring masterpieces.
            </p>
          </div>

          {/* Section 2: Cognitive benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                The Cognitive Science Behind Anagrams and Letter Jumbles
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Normal reading relies on orthographic processing—identifying words as visual whole shapes. 
                Scrambling letters disrupts this shortcut, forcing your brain into active visual scanning and phonological reconstruction. 
                Practicing jumble resolution regularly builds spatial memory, logic retention, and rapid lexical recall. It keeps the mind young and active.
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>Key Cognitive Exercises:</h4>
              <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-slate-500">
                <li>Enhances visual pattern identification</li>
                <li>Builds phonological awareness & segmenting</li>
                <li>Exercises working memory and spatial manipulation</li>
                <li>Enriches general dictionary vocabulary</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Professional Tips */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Pro Strategies for Manual Word Unscrambling
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Stuck with a pile of letters? You can master manual solving in seconds using professional heuristics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-teal-500">Heuristic 1</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>Isolate Affixes (Prefixes & Suffixes)</h4>
                <p className="text-xs text-slate-500">
                  Slide endings like -ING, -ED, -TION, -ER or prefixes like RE-, UN-, DIS-, DE- to the sides. This immediately reduces the remaining core characters.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-teal-500">Heuristic 2</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>Cluster Consonants</h4>
                <p className="text-xs text-slate-500">
                  Group letters that naturally stick together (e.g., CH, SH, TH, ST, STR, PH). Treating them as a single character tile makes candidate words stand out.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-teal-500">Heuristic 3</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>The Vowel-Anchor Strategy</h4>
                <p className="text-xs text-slate-500">
                  Place your vowels (A, E, I, O, U) as steady center anchors, then slot consonants around them to form syllables.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-teal-500">Heuristic 4</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>Go Circular</h4>
                <p className="text-xs text-slate-500">
                  Write the jumbled letters in a circle. Eliminating the linear "start" and "end" removes visual habit bias, allowing your eyes to spot new combinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wordplay Glossary and Dictionary Terms */}
      <WordplayGlossary isDarkMode={isDarkMode} />

      {/* Featured Strategic Guides (Internal Linking & Crawlability) */}
      <section className={`pt-16 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto px-4`}>
        <div className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Featured Strategic Guides & Linguistic Insights
            </h2>
            <p className={`text-sm md:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Expand your vocabulary, master tile probability, and learn the science behind elite wordplay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="/blog/evolution-of-competitive-scrabble"
              onClick={(e) => { e.preventDefault(); navigateTo('blog', 'evolution-of-competitive-scrabble'); }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/30 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-lg'
              } flex flex-col justify-between h-full block`}
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Mind Sports History</span>
                <h3 className={`font-black text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} leading-snug`}>
                  The Evolution of Competitive Scrabble
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                  From Alfred Butts' Great Depression prototype to computer-optimized professional championships, trace the history of the world's favorite word sport.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-500 mt-4 inline-flex items-center gap-1">Read Article &rarr;</span>
            </a>

            <a 
              href="/blog/linguistics-of-letter-blends"
              onClick={(e) => { e.preventDefault(); navigateTo('blog', 'linguistics-of-letter-blends'); }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/30 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-lg'
              } flex flex-col justify-between h-full block`}
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Cognitive Linguistics</span>
                <h3 className={`font-black text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} leading-snug`}>
                  The Linguistics of Letter Blends
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                  Discover how graphotactics, phonetic syllable boundaries, and cognitive 'chunking' govern why our brains struggle with specific scrambled letter clusters.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-500 mt-4 inline-flex items-center gap-1">Read Article &rarr;</span>
            </a>

            <a 
              href="/blog/mathematics-of-rack-balance"
              onClick={(e) => { e.preventDefault(); navigateTo('blog', 'mathematics-of-rack-balance'); }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/30 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-lg'
              } flex flex-col justify-between h-full block`}
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Advanced Strategy</span>
                <h3 className={`font-black text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} leading-snug`}>
                  The Mathematics of Rack Balance
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                  Learn how probability models, rack leaves, vowel-to-consonant ratios, and duplicate-letter penalties can double your average Scrabble or tournament scores.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-500 mt-4 inline-flex items-center gap-1">Read Article &rarr;</span>
            </a>
          </div>
          
          <div className="flex justify-center pt-2">
            <a 
              href="/blog"
              onClick={(e) => { e.preventDefault(); navigateTo('blog'); }}
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all inline-block ${
                isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-teal-400' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-teal-700'
              }`}
            >
              Browse All Strategic Articles &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`mt-20 py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-y -mx-6 md:-mx-12 px-6 md:px-12`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Frequently Asked Questions</h2>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about UnscramblerHub.</p>
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
    </div>
  );
}
