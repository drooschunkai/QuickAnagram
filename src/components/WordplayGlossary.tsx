import { BookOpen, Sparkles, HelpCircle, AlignLeft, ArrowRightLeft, Languages, Landmark, Shuffle, RotateCw } from 'lucide-react';

interface GlossaryTerm {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  icon: any;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    word: 'Anagram',
    pronunciation: '/ˈæn.ə.ɡræm/',
    partOfSpeech: 'noun',
    definition: 'A word, phrase, or name formed by rearranging the letters of another. The hallmark of orthographic flexibility and letter unscrambling.',
    example: 'ELBOW becomes BELOW; SILENT becomes LISTEN.',
    icon: Shuffle,
  },
  {
    word: 'Palindrome',
    pronunciation: '/ˈpæl.ɪn.droʊm/',
    partOfSpeech: 'noun',
    definition: 'A word, phrase, number, or other sequence of characters that reads the exact same backward as it does forward.',
    example: 'RACECAR, REFER, MADAM, and DEIFIED.',
    icon: ArrowRightLeft,
  },
  {
    word: 'Spoonerism',
    pronunciation: '/ˈspuː.nə.rɪ.zəm/',
    partOfSpeech: 'noun',
    definition: 'A verbal mistake or wordplay in which corresponding consonant or vowel sounds are switched between two words in a phrase.',
    example: '“Tease my ears” instead of “ease my tears”, or “a blushing crow” instead of “a crushing blow”.',
    icon: HelpCircle,
  },
  {
    word: 'Portmanteau',
    pronunciation: '/pɔːrtˈmæn.toʊ/',
    partOfSpeech: 'noun',
    definition: 'A linguistic blend of words where parts of multiple distinct words are combined to form a single, fully integrated new term.',
    example: 'SMOG (smoke + fog); BRUNCH (breakfast + lunch); MOTEL (motor + hotel).',
    icon: Languages,
  },
  {
    word: 'Pangram',
    pronunciation: '/ˈpæn.ɡræm/',
    partOfSpeech: 'noun',
    definition: 'A complete sentence or phrase that utilizes every single letter of the alphabet at least once.',
    example: '“The quick brown fox jumps over the lazy dog” (uses all 26 letters).',
    icon: AlignLeft,
  },
  {
    word: 'Semordnilap',
    pronunciation: '/ˌsɛm.ɔːrdˈnɪ.læp/',
    partOfSpeech: 'noun',
    definition: 'A word that spells a completely different, valid word when read backwards in reverse order. (Itself a reverse spelling of palindromes).',
    example: 'STRESSED becomes DESSERTS; RATS becomes STAR; REWIND becomes DRAWER.',
    icon: RotateCw,
  },
  {
    word: 'Onomatopoeia',
    pronunciation: '/ˌɒn.əˌmæt.əˈpiː.ə/',
    partOfSpeech: 'noun',
    definition: 'The formation of a word from a sound associated with what is named, bringing phonetic imagery directly into text.',
    example: 'SIZZLE, BUZZ, GURGLE, and HISS.',
    icon: Sparkles,
  },
  {
    word: 'Ambigram',
    pronunciation: '/ˈæm.bɪ.ɡræm/',
    partOfSpeech: 'noun',
    definition: 'A typographical art form or word representation that can be read in multiple directions, orientations, or mirroring axes.',
    example: 'The word “SWIMS” remains identical when rotated 180 degrees.',
    icon: Landmark,
  },
  {
    word: 'Heteronym',
    pronunciation: '/ˈhɛt.ər.ə.nɪm/',
    partOfSpeech: 'noun',
    definition: 'Two or more words that share the exact same spelling but differ in both pronunciation and semantic meaning.',
    example: 'TEAR (a drop of water from the eye) vs. TEAR (to rip paper apart).',
    icon: BookOpen,
  }
];

interface WordplayGlossaryProps {
  isDarkMode: boolean;
}

export function WordplayGlossary({ isDarkMode }: WordplayGlossaryProps) {
  return (
    <section className={`rounded-3xl border p-6 md:p-8 transition-all ${
      isDarkMode 
        ? 'bg-slate-900/40 border-slate-800' 
        : 'bg-[#fcfcfc] border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-700/10">
        <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-[#e05300]'}`} />
        <div>
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Wordplay Glossary & Dictionary Terms
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Master the underlying structures of linguistics and word gaming
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GLOSSARY_TERMS.map((term, idx) => {
          const IconComponent = term.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                isDarkMode 
                  ? 'bg-slate-950/40 border-slate-850 hover:border-slate-750' 
                  : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-1 ${
                  isDarkMode ? 'bg-slate-900 text-teal-400' : 'bg-slate-50 text-[#e05300]'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className={`font-black text-sm md:text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {term.word}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 italic">
                      {term.pronunciation}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isDarkMode ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-[#e05300]'
                    }`}>
                      {term.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {term.definition}
                  </p>
                  <div className={`text-[11px] p-2 rounded-lg border leading-relaxed ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-850 text-teal-300/90' 
                      : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}>
                    <strong className="font-bold">Example:</strong> {term.example}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
