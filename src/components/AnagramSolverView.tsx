import { Zap, Loader2, Book, Share2, Copy, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { FAQ_ITEMS } from '../content.ts';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    }
  }
};

const wordItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14
    }
  }
};

interface AnagramSolverViewProps {
  isDarkMode: boolean;
  currentLanguage: string;
  currentLangObj: any;
  input: string;
  setInput: (val: string) => void;
  cleanInput: (val: string) => string;
  handleProcess: () => void;
  isProcessing: boolean;
  isDictLoading: boolean;
  totalFound: number;
  sortedLengths: number[];
  results: Record<number, string[]>;
  fetchDefinition: (word: string) => void;
  shareWord: (word: string) => void;
  sharedWord: string | null;
  copyToClipboard: (word: string) => void;
  copiedWord: string | null;
  navigateTo: (view: any, slug?: string, initialInput?: string) => void;
}

export function AnagramSolverView({
  isDarkMode,
  currentLanguage,
  currentLangObj,
  input,
  setInput,
  cleanInput,
  handleProcess,
  isProcessing,
  isDictLoading,
  totalFound,
  sortedLengths,
  results,
  fetchDefinition,
  shareWord,
  sharedWord,
  copyToClipboard,
  copiedWord,
  navigateTo,
}: AnagramSolverViewProps) {
  return (
    <div className="space-y-12">
      {/* Top Ad Slot */}
      <div id="top-ad-slot" className={`w-full min-h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl flex items-center justify-center text-xs font-mono`}>Advertisements</div>

      {/* Header section */}
      <section className="max-w-2xl mx-auto w-full text-center">
        <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
          {currentLanguage === 'ar' ? 'محلل الجناس الناقص' : 'Anagram Solver'}
        </h1>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>
          {currentLanguage === 'ar'
            ? 'البحث عن الجناس الناقص والكلمات المطابقة تماماً.'
            : 'Find words of the exact same length that match your letters perfectly.'}
        </p>

        {/* Large Input Field */}
        <div className="group">
          <input
            maxLength={15}
            value={input}
            onChange={(e) => setInput(cleanInput(e.target.value).toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            className={`w-full h-20 px-8 text-3xl font-mono border-2 ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-white focus:border-teal-500' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
            } rounded-3xl outline-none transition-all uppercase ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
            placeholder={currentLanguage === 'ar' ? 'أدخل الحروف هنا...' : 'ENTER LETTERS'}
          />
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing || isDictLoading}
            className="px-10 py-4 font-black rounded-2xl shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[240px] text-base uppercase tracking-wider bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              currentLanguage === 'ar' ? 'بحث الجناس' : 'Find Anagrams'
            )}
          </button>
        </div>
      </section>

      {/* Results Shelf */}
      <div id="unscrambler-results" className="scroll-mt-24 w-full">
        {isDictLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="animate-spin text-teal-500 mb-4" size={40} />
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentLanguage === 'ar'
                ? `جاري تحميل قاموس اللغة ${currentLangObj.nativeName}...`
                : `Loading ${currentLangObj.name} wordlist database...`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentLanguage === 'ar' ? 'يستغرق هذا ثانية واحدة فقط.' : 'This takes just a second.'}
            </p>
          </div>
        ) : totalFound > 0 ? (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`mb-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                {currentLanguage === 'ar' ? `تم العثور على ${totalFound} جناس` : `Found ${totalFound} anagrams`}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {sortedLengths.map((len) => (
                <div key={len} className="flex flex-col">
                  <div className={`flex justify-between items-center mb-5 pb-3 border-b-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {currentLanguage === 'ar' ? `جناس من ${len} أحرف` : `${len} Letter Anagrams`}
                    </h3>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-teal-400 bg-teal-900/40' : 'text-teal-600 bg-teal-50'} px-3 py-1 rounded-full`}>{results[len].length}</span>
                  </div>
                  <motion.div
                    key={`${len}-${results[len].join(',')}`}
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {results[len].map((word) => (
                      <motion.div
                        key={word}
                        variants={wordItemVariants}
                        className={`group relative flex justify-between items-center p-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50' : 'bg-white border-slate-200 hover:border-teal-300'} border rounded-2xl transition-all shadow-sm`}
                      >
                        <span className={`font-mono font-bold uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{word}</span>
                        <div className="flex gap-1">
                          <button onClick={() => fetchDefinition(word)} title="Define" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors cursor-pointer`}>
                            <Book size={14} />
                          </button>
                          <button onClick={() => shareWord(word)} title="Share" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors cursor-pointer`}>
                            {sharedWord === word ? <Check size={14} className="text-teal-500" /> : <Share2 size={14} />}
                          </button>
                          <button onClick={() => copyToClipboard(word)} title="Copy" className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-teal-400/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-600'} transition-colors cursor-pointer`}>
                            {copiedWord === word ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        ) : input.length > 0 && !isProcessing && (
          <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-3xl border-2 border-dashed mb-12`}>
            <p className="text-slate-400 font-medium">No anagrams found. Try different letters!</p>
          </div>
        )}
      </div>

      <div id="results-mid-ad" className={`w-full h-[250px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl mb-12 flex items-center justify-center text-xs`}>Middle Ad</div>

      {/* Educational Section (Anagram Solver Specific) */}
      <section className={`mt-12 pt-16 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto px-4`}>
        <div className="space-y-8">
          <div className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-3`}>
            <Zap size={28} />
            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {currentLanguage === 'ar' ? 'محلل الجناس الناقص الاحترافي' : 'Professional Anagram Solver Guide'}
            </h2>
          </div>

          <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {currentLanguage === 'ar' ? (
              'أهلاً بك في محلل الجناس الناقص الفوري. هذا المحرك مخصص للعثور على الكلمات التي تطابق تماماً طول وبنية الحروف التي تدخلها، حيث يجب استخدام كل حرف مرة واحدة بالضبط دون أي زيادة أو نقصان.'
            ) : (
              'Welcome to the absolute center of anagram permutation matching. In contrast to a jumble search, our Anagram Solver performs an exact character-to-character mapping. This ensures that every resulting match utilizes every single input letter exactly once.'
            )}
          </p>

          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
              {currentLanguage === 'ar' ? 'الفروق الهيكلية بين فك الحروف والجناس' : 'Structural Differences: Unscrambling vs. Anagrams'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              {currentLanguage === 'ar' ? (
                'لتسهيل فهم الخيارات، إليك جدولاً يوضح الفروق الجوهرية والتقنية بين وضعي التشغيل المتاحين في محركنا:'
              ) : (
                'Understanding when to use Anagram mode versus standard Unscramble mode is key to game mastery. Refer to this operational differences matrix:'
              )}
            </p>

            <div className="overflow-x-auto my-6 border rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-xs md:text-sm">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Metric Parameter</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Word Unscrambler Mode</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Anagram Solver Mode</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-200 ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-600'}`}>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Mathematical Relation</td>
                    <td className="px-4 py-3">Subset Mapping (Power Set)</td>
                    <td className="px-4 py-3">Strict Permutation Mapping (n!)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Resulting Word Lengths</td>
                    <td className="px-4 py-3">Varying (lengths 2 up to Input Length)</td>
                    <td className="px-4 py-3">Fixed (must exactly equal Input Length)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Best Used For</td>
                    <td className="px-4 py-3">Scrabble, Words with Friends, Boggle</td>
                    <td className="px-4 py-3">Daily Newspaper Jumbles, Cryptic Crosswords</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Blank Wildcard Capacity</td>
                    <td className="px-4 py-3">Supported (rotates blanks dynamically)</td>
                    <td className="px-4 py-3">Strict character matches only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-teal-950/40 border-teal-500/20 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-800'} p-6 rounded-2xl border leading-relaxed text-sm`}>
            <strong className="block text-base mb-2 font-bold">Linguistic Tip: Spotting Sub-Anagrams</strong>
            If you are having trouble solving a complex jumble or finding a perfect anagram, write the letters down in a circle rather than a horizontal line. This visual pattern bypasses our brain's natural reading habits and helps you discover prefix matches (like RE-, DE-, or CON-) much quicker. Or simply paste your tiles into our tool and let the client-side engine find all permutations instantly!
          </div>
        </div>
      </section>

      {/* Featured Strategic Guides (Internal Linking & Crawlability) */}
      <section className={`pt-12 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto px-4`}>
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Recommended Strategy Guides & Word Science
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Level up your board matches with master-class guides written by word-game veterans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => navigateTo('blog', 'linguistics-of-letter-blends')}
              className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500/30' : 'bg-[#fafafa] border-slate-200 hover:border-teal-400'
              } flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-500">Cognitive Linguistics</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  The Linguistics of Letter Blends
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Discover how graphotactics, phonetic syllable boundaries, and cognitive "chunking" govern how we decode complex scrambled letter arrays.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-500 mt-2 block">Read full guide &rarr;</span>
            </div>

            <div 
              onClick={() => navigateTo('blog', 'cognitive-benefits-of-word-games')}
              className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500/30' : 'bg-[#fafafa] border-slate-200 hover:border-teal-400'
              } flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-500">Cognitive Health</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Cognitive and Neurological Benefits of Word Games
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Explore how active anagram puzzle solving increases neuroplasticity, visual scanning speed, and builds cognitive reserve against memory decline.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-500 mt-2 block">Read full guide &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`mt-20 py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-y -mx-6 md:-mx-12 px-6 md:px-12`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Frequently Asked Questions</h2>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about Anagrams and word configurations.</p>
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
