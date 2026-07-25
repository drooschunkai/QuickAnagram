import { Search, Sliders, ChevronDown, ChevronUp, Loader2, Book, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ_ITEMS } from '../content.ts';

interface UnscramblerViewProps {
  isDarkMode: boolean;
  currentLanguage: string;
  currentLangObj: any;
  input: string;
  setInput: (val: string) => void;
  cleanInput: (val: string) => string;
  filterStartsWith: string;
  setFilterStartsWith: (val: string) => void;
  filterEndsWith: string;
  setFilterEndsWith: (val: string) => void;
  filterContains: string;
  setFilterContains: (val: string) => void;
  filterWordLength: string;
  setFilterWordLength: (val: string) => void;
  isOptionsExpanded: boolean;
  setIsOptionsExpanded: (val: boolean) => void;
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

export function UnscramblerView({
  isDarkMode,
  currentLanguage,
  currentLangObj,
  input,
  setInput,
  cleanInput,
  filterStartsWith,
  setFilterStartsWith,
  filterEndsWith,
  setFilterEndsWith,
  filterContains,
  setFilterContains,
  filterWordLength,
  setFilterWordLength,
  isOptionsExpanded,
  setIsOptionsExpanded,
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
}: UnscramblerViewProps) {
  return (
    <div className="space-y-12">
      {/* Top Ad Slot */}
      <div id="top-ad-slot" className={`w-full min-h-[90px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl flex items-center justify-center text-xs font-mono`}>Advertisements</div>

      {/* Header section */}
      <section className="max-w-2xl mx-auto w-full text-center">
        <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
          {currentLanguage === 'ar' ? 'البحث عن كلمات من حروفك' : 'Word Unscrambler'}
        </h1>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg mb-10`}>
          {currentLanguage === 'ar'
            ? 'أدخل أي مجموعة من الحروف واكتشف جميع الكلمات الممكنة التي يمكنك تشكيلها' 
            : 'Enter any combination of letters and discover all possible words you can make'}
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

        {/* Advanced Filters */}
        <div className="mt-8 text-left" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
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
            <span>{currentLanguage === 'ar' ? 'خيارات متقدمة' : 'Options'}</span>
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
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        {currentLanguage === 'ar' ? 'يبدأ بـ' : 'Starts with'}
                      </label>
                      <input
                        type="text"
                        value={filterStartsWith}
                        onChange={(e) => setFilterStartsWith(cleanInput(e.target.value).toUpperCase())}
                        placeholder={currentLanguage === 'ar' ? 'مثال: أ' : 'e.g., a'}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                        className={`h-11 px-4 rounded-xl border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                        } outline-none text-sm transition-all ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Ends with */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        {currentLanguage === 'ar' ? 'ينتهي بـ' : 'Ends with'}
                      </label>
                      <input
                        type="text"
                        value={filterEndsWith}
                        onChange={(e) => setFilterEndsWith(cleanInput(e.target.value).toUpperCase())}
                        placeholder={currentLanguage === 'ar' ? 'مثال: س' : 'e.g., s'}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                        className={`h-11 px-4 rounded-xl border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                        } outline-none text-sm transition-all ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Contains */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        {currentLanguage === 'ar' ? 'يحتوي على' : 'Contains'}
                      </label>
                      <input
                        type="text"
                        value={filterContains}
                        onChange={(e) => setFilterContains(cleanInput(e.target.value).toUpperCase())}
                        placeholder={currentLanguage === 'ar' ? 'مثال: ين' : 'e.g., ing'}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                        className={`h-11 px-4 rounded-xl border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                        } outline-none text-sm transition-all ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Word length */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>
                        {currentLanguage === 'ar' ? 'طول الكلمة' : 'Word length'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={filterWordLength}
                        onChange={(e) => setFilterWordLength(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={currentLanguage === 'ar' ? 'مثال: 5' : 'e.g., 5'}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                        className={`h-11 px-4 rounded-xl border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                        } outline-none text-sm transition-all ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                  </div>

                  {/* Reset Filters */}
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

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing || isDictLoading}
            className="px-10 py-4 font-black rounded-2xl shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[240px] text-base uppercase tracking-wider bg-[#e05300] hover:bg-[#c44700] text-white cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              currentLanguage === 'ar' ? 'فك تشفير الحروف' : 'Unscramble It'
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
                {currentLanguage === 'ar' ? `تم العثور على ${totalFound} كلمة` : `Found ${totalFound} words`}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {sortedLengths.map((len) => (
                <div key={len} className="flex flex-col">
                  <div className={`flex justify-between items-center mb-5 pb-3 border-b-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {currentLanguage === 'ar' ? `كلمات من ${len} أحرف` : `${len} Letter Words`}
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
            <p className="text-slate-400 font-medium">No words found. Try different letters!</p>
          </div>
        )}
      </div>

      <div id="results-mid-ad" className={`w-full h-[250px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-xl mb-12 flex items-center justify-center text-xs`}>Middle Ad</div>

      {/* Educational Section (Unscrambler-specific) */}
      <section className={`mt-12 pt-16 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} max-w-4xl mx-auto px-4`}>
        <div className="space-y-8">
          <div className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-3`}>
            <Search size={28} />
            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {currentLanguage === 'ar' ? 'دليل فك تشفير الحروف الشامل والاحترافي' : 'Ultimate Word Unscrambler & Mastery Guide'}
            </h2>
          </div>

          <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {currentLanguage === 'ar' ? (
              'أهلاً بك في دليل فك تشفير الحروف الشامل والاحترافي. سواء كنت تحاول حل لغز مستعصٍ، أو تحسين مفرداتك اللغوية، فإن محركنا المتقدم يساعدك على رؤية الكلمات المخفية خلف الحروف المبعثرة بشكل فوري. يمثل فك الحروف ممارسة ذهنية غنية تنشط الفص الجبهي وتدعم خلايا الذاكرة وسرعة البديهة.'
            ) : (
              'Welcome to the Ultimate Word Unscrambler Guide: Mastering the Art of Word Unscrambling. Whether you are trying to break a stalemate in Scrabble, staring blankly at today\'s Wordle, or trying to untangle a messy jumble of letters, you are engaging in one of the oldest and most beneficial mental exercises in human history. At UnscramblerHub.com, our tool is engineered to instantly resolve tiles into highly valid, playable words while serving as a powerful vocabulary-building instrument.'
            )}
          </p>

          {/* Integrated Cognitive Science */}
          <div className="space-y-3">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {currentLanguage === 'ar' ? 'العلم المعرفي وراء فك الحروف والجناس الناقص' : 'The Cognitive Science Behind Anagrams'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentLanguage === 'ar' ? (
                'عند قراءة الكلمات بشكل اعتيادي، يعالج الدماغ الكلمات كأشكال كاملة مألوفة. الحروف المبعثرة تكسر هذا النمط المعتاد مما يجبر عقلك على إعادة ترتيبها يدوياً. هذا التمرين يقوي مرونة الدماغ والتعرف على الأنماط البصرية.'
              ) : (
                'To master word games, understanding the mental hurdles of scrambled letters is key. When you read normally, your brain processes words as complete shapes (orthographic processing). Scrambled letters disrupt this, causing cognitive friction. Physical or spatial rearrangement is a proven technique to bypass this mental bottleneck.'
              )}
            </p>
          </div>

          {/* Integrated Anatomy of Anagrams */}
          <div className="space-y-3">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {currentLanguage === 'ar' ? 'تشريح الجناس: دور الحروف الساكنة والمتحركة' : 'The Anatomy of an Anagram: How Letters Shuffle'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentLanguage === 'ar' ? (
                'يكمن السر في فك تشفير الحروف في فهم العلاقة بين الحروف الساكنة والمتحركة. الحروف المتحركة تمثل "الغراء" الذي يربط المقاطع ببعضها، بينما تمنح الحروف الساكنة الكلمة هيكلها وهويتها الصوتية.'
              ) : (
                'English word structures rely heavily on the relationship between vowels and consonants. Vowels act as the glue holding syllables together, while consonants provide the physical shape and skeleton. Grouping your tiles into vowel anchors and consonant clusters makes it much easier to spot candidate words.'
              )}
            </p>
          </div>

          {/* Integrated Pro Tips */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {currentLanguage === 'ar' ? 'نصائح استراتيجية لفك تشفير الحروف يدوياً' : 'Pro Tips: How to Unscramble Words Manually'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentLanguage === 'ar' ? (
                'قبل اللجوء إلى المحلل الرقمي التلقائي، جرب الطرق التالية لتنشيط ذهنك وحل الحروف يدوياً بشكل أسرع:'
              ) : (
                'Before triggering the digital solver, stretch your mental muscles! You can solve even the toughest word jumbles manually using these strategic shortcuts:'
              )}
            </p>
            <ul className="list-disc pl-6 space-y-3 text-sm md:text-base text-slate-500">
              <li>
                <strong>{currentLanguage === 'ar' ? 'البحث عن البادئات الشائعة:' : 'Hunt for Common Prefixes:'}</strong> {currentLanguage === 'ar' ? 'عزل البادئات مثل (UN-, RE-, DIS-, DE-) يقلل فوراً من تعقيد الحروف المتبقية.' : 'Isolate common word beginnings like UN-, RE-, DIS-, DE-, or IN- to instantly reduce complexity.'}
              </li>
              <li>
                <strong>{currentLanguage === 'ar' ? 'تحديد اللواحق المعتادة:' : 'Isolate Frequent Suffixes:'}</strong> {currentLanguage === 'ar' ? 'سحب المقاطع مثل (-ING, -ED, -TION, -S) يسهل الوصول لجذور الكلمة وحصر الخيارات.' : 'Pull endings like -ING, -ED, -TION, -S, -ER, or -LY to the right to narrow down your core options.'}
              </li>
              <li>
                <strong>{currentLanguage === 'ar' ? 'تجميع تراكيب الحروف الساكنة المتناغمة:' : 'Circle Consonant Blends:'}</strong> {currentLanguage === 'ar' ? 'ربط الحروف التي تمتزج صوتياً مثل (CH, SH, TH, ST) كحزم واحدة يسهل التوقع بصرياً.' : 'Group letters like CH, SH, TH, ST, BR, or STR. Treating them as a single unit drastically reduces cognitive load.'}
              </li>
              <li>
                <strong>{currentLanguage === 'ar' ? 'إعادة ترتيب الحروف دائرياً:' : 'Change Your Spatial Perspective:'}</strong> {currentLanguage === 'ar' ? 'كتابة الحروف بشكل دائري تلغي الحواف والترتيب الأفقي التقليدي مما يساعد العين على التقاط أنماط جديدة.' : 'Arrange letters in a circle rather than a linear line. This circular orientation eliminates "edges" and forces your eyes to see new patterns.'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
              {currentLanguage === 'ar' ? 'كيف يعمل محرك فك تشفير الحروف؟' : 'How the Unscrambler Engine Operates'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              {currentLanguage === 'ar' ? (
                'يقوم المحرك بتحويل الكلمة المدخلة إلى تمثيل رقمي يعتمد على تكرار كل حرف. ثم يقارن هذا التمثيل بآلاف الكلمات المخزنة في القاموس للتأكد من أن الكلمة المستهدفة هي جزء حقيقي من حروفك.'
              ) : (
                'Our high-performance word-finding system uses a modular local search workflow to prune over 370,000 dictionary words instantly. Here is a technical breakdown of how we analyze your jumbled letters:'
              )}
            </p>

            <div className="overflow-x-auto my-6 border rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-xs md:text-sm">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Step Phase</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Algorithmic Name</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Processing Description</th>
                    <th className="px-4 py-3 text-left font-bold tracking-wider">Device Latency</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-200 ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-600'}`}>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Phase 1</td>
                    <td className="px-4 py-3 font-semibold">Histogram Mapping</td>
                    <td className="px-4 py-3">Generates a local key-value character frequency map of the user\'s rack letters.</td>
                    <td className="px-4 py-3 font-mono text-xs">~0.01 ms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Phase 2</td>
                    <td className="px-4 py-3 font-semibold">Length Boundary Pruning</td>
                    <td className="px-4 py-3">Instantly discards all dictionary candidates longer than the user\'s letter rack.</td>
                    <td className="px-4 py-3 font-mono text-xs">~0.10 ms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Phase 3</td>
                    <td className="px-4 py-3 font-semibold">Multi-Character Subset Check</td>
                    <td className="px-4 py-3">Performs subset checks, ensuring each letter count does not exceed the target histogram.</td>
                    <td className="px-4 py-3 font-mono text-xs">~0.25 ms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-teal-500">Phase 4</td>
                    <td className="px-4 py-3 font-semibold">RegEx Pattern Interception</td>
                    <td className="px-4 py-3">Applies advanced options filters (Starts with, Ends with, contains, specific lengths).</td>
                    <td className="px-4 py-3 font-mono text-xs">~0.04 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
              {currentLanguage === 'ar' ? 'توزيع نقاط الحروف الرسمي (Scrabble)' : 'Official Scrabble Letter Tile Point Distribution'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              {currentLanguage === 'ar' ? (
                'لتحقيق أقصى عدد من النقاط، من المهم فهم قيمة كل حرف. إليك جدول يوضح قيم النقاط الرسمية للحروف الإنجليزية الشائعة في اللعبة:'
              ) : (
                'To secure massive scores during competitive matches, it is crucial to recognize the individual point weights of the tiles you unscramble. High-value letters like Q, Z, J, and X should be positioned carefully on premium board multipliers:'
              )}
            </p>

            <div className="overflow-x-auto my-6 border rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-xs md:text-sm text-center">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 font-bold tracking-wider">Point Value</th>
                    <th className="px-4 py-3 font-bold tracking-wider">English Tiles / Characters</th>
                    <th className="px-4 py-3 font-bold tracking-wider">Strategic Priority</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-200 ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-600'}`}>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">1 Point</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">A, E, I, O, U, L, N, S, T, R</td>
                    <td className="px-4 py-3 text-xs">High frequency stems. Use to build prefixes/suffixes.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">2 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">D, G</td>
                    <td className="px-4 py-3 text-xs">Versatile endings. Great for past-tense formations.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">3 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">B, C, M, P</td>
                    <td className="px-4 py-3 text-xs">Consonant dumps. Look for double-letter squares.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">4 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">F, H, V, W, Y</td>
                    <td className="px-4 py-3 text-xs">High leverage. Combine with vowels for quick 15+ pt turns.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">5 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">K</td>
                    <td className="px-4 py-3 text-xs">Niche tile. Essential for short high-scoring words.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">8 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">J, X</td>
                    <td className="px-4 py-3 text-xs">Premium targets. Always aim to place on DW or TL squares.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-teal-500">10 Points</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-widest">Q, Z</td>
                    <td className="px-4 py-3 text-xs">Maximum weight. Look for short words (e.g., QI, ZA) immediately.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-teal-950/40 border-teal-500/20 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-800'} p-6 rounded-2xl border leading-relaxed text-sm`}>
            <strong className="block text-base mb-2 font-bold">Pro-Level Strategy: Scoring the Elusive "Bingo"</strong>
            In both Scrabble and Words with Friends, utilizing all 7 tiles in a single turn grants a massive 50-point bonus (referred to as a "Bingo"). Our unscrambler tool organizes results by length, allowing you to instantly scan for 7-letter words and plan your rack combinations. To maximize point totals, prioritize keeping common suffixes like "ING" or "ED" on your rack to transition into multiple bingo options during your next turns.
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
            <a 
              href="/blog/mathematics-of-rack-balance"
              onClick={(e) => { e.preventDefault(); navigateTo('blog', 'mathematics-of-rack-balance'); }}
              className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500/30' : 'bg-[#fafafa] border-slate-200 hover:border-teal-400'
              } flex flex-col justify-between block`}
            >
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-500">Advanced Strategy</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  The Mathematics of Rack Balance
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Vowel-to-consonant ratios, duplicate tile penalties, and the exact probability curves behind pulling high-scoring combos.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-500 mt-2 block">Read full guide &rarr;</span>
            </a>

            <a 
              href="/blog/etymological-roots-word-games"
              onClick={(e) => { e.preventDefault(); navigateTo('blog', 'etymological-roots-word-games'); }}
              className={`p-5 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500/30' : 'bg-[#fafafa] border-slate-200 hover:border-teal-400'
              } flex flex-col justify-between block`}
            >
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-500">Etymology</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Etymological Roots in Competitive Word Games
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Why Greco-Latin stems and historical sound shifts hold the key to reconstructing unknown tiles on premium boards.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-500 mt-2 block">Read full guide &rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`mt-20 py-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-y -mx-6 md:-mx-12 px-6 md:px-12`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Frequently Asked Questions</h2>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about UnscramblerHub and word unscrambling.</p>
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
