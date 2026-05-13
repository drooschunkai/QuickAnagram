import { ArrowLeft, Search, Zap, Book, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { BlogPost } from '../blogData.ts';
import { motion } from 'framer-motion';

interface BlogLayoutProps {
  post: BlogPost;
  onBack: () => void;
  onNavigateToTool: (mode: 'unscramble' | 'anagram') => void;
  isDarkMode: boolean;
}

export const BlogLayout = ({ post, onBack, onNavigateToTool, isDarkMode }: BlogLayoutProps) => {
  const contentParagraphs = post.content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <article className="max-w-4xl mx-auto w-full py-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-teal-600 font-bold mb-8 transition-colors hover:text-teal-500 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Blog
        </button>
        
        <div className="flex items-center gap-3 text-teal-600 font-black uppercase text-[10px] tracking-widest mb-4">
          <span className={`px-2 py-1 rounded bg-teal-500/10`}>{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-slate-400">{post.date}</span>
        </div>

        <h1 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {post.title}
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium">
          {post.excerpt}
        </p>
      </header>

      {/* Top Article Ad */}
      <div className={`w-full h-24 mb-12 border border-dashed flex items-center justify-center rounded-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-300'} font-mono text-[10px] uppercase tracking-widest`}>
        Google AdSense: Horizontal Banner Ad
      </div>

      <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert text-slate-300' : 'text-slate-700'} leading-relaxed`}>
        {contentParagraphs.map((para, idx) => {
          // Detect headings
          if (para.startsWith('## ')) {
            return (
              <h2 key={idx} className={`text-3xl font-bold mt-12 mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {para.replace('## ', '')}
              </h2>
            );
          }
          if (para.startsWith('### ')) {
            return (
              <h3 key={idx} className={`text-xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {para.replace('### ', '')}
              </h3>
            );
          }

          // Detect Lists
          if (para.includes('1. ') || para.includes('* ')) {
            const lines = para.split('\n');
            return (
              <ul key={idx} className="space-y-3 my-6 list-disc pl-6 marker:text-teal-500">
                {lines.map((line, lIdx) => (
                  <li key={lIdx} className="pl-2">
                    {line.replace(/^[0-9]\. |^\* /, '')}
                  </li>
                ))}
              </ul>
            );
          }

          // Normal Paragraph with Ad Placement logic
          const pElement = (
            <p key={idx} className="mb-6 leading-loose last:mb-0">
              {para}
            </p>
          );

          // Inject Ad every 3-4 paragraphs or special CTA
          return (
            <div key={idx}>
              {pElement}
              
              {idx === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className={`my-12 p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-teal-900/30' : 'bg-gradient-to-br from-teal-50 to-white border-teal-100'} shadow-xl shadow-teal-500/5 flex flex-col md:flex-row items-center gap-8`}
                >
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-600'} text-white`}>
                    <Zap size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Stuck on a tough board?</h4>
                    <p className="text-slate-500 text-sm mb-0">Use our lightning-fast Word Unscrambler to find your next winning move in seconds.</p>
                  </div>
                  <button 
                    onClick={() => onNavigateToTool('unscramble')}
                    className="px-8 py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 whitespace-nowrap active:scale-95"
                  >
                    Open Solver
                  </button>
                </motion.div>
              )}

              {idx === 5 && (
                <div className={`w-full h-[250px] my-12 border border-dashed flex items-center justify-center rounded-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-300'} font-mono text-[10px] uppercase tracking-widest`}>
                  Google AdSense: In-Article Adaptive Ad
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className={`mt-20 pt-12 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`p-8 rounded-3xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} flex flex-col md:flex-row justify-between items-center gap-8`}>
          <div>
            <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Was this article helpful?</h4>
            <p className="text-slate-500 text-sm">Share it with your word-game obsessed friends!</p>
          </div>
          <div className="flex gap-4">
            <button className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-teal-400' : 'bg-white text-teal-600 shadow-sm'} flex items-center gap-2 font-bold hover:scale-105 transition-all`}>
              <Share2 size={18} /> Share
            </button>
            <button 
               onClick={onBack}
               className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400 shadow-sm'} flex items-center gap-2 font-bold hover:text-teal-500 transition-all`}
            >
              <ArrowLeft size={18} /> Back to List
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
};
