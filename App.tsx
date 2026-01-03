
import React, { useState, useEffect, useCallback } from 'react';
import { Category, NewsItem, BriefingState } from './types';
import { fetchNewsByCategory } from './services/geminiService';
import NewsCard from './components/NewsCard';
import BriefingDetails from './components/BriefingDetails';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.GENERAL);
  const [briefing, setBriefing] = useState<BriefingState>({
    items: [],
    isLoading: true,
    error: null,
  });
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const loadNews = useCallback(async (category: Category) => {
    setBriefing(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchNewsByCategory(category);
      setBriefing({
        items: data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setBriefing({
        items: [],
        isLoading: false,
        error: "Unable to retrieve the daily briefing. Please try again later.",
      });
    }
  }, []);

  useEffect(() => {
    loadNews(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                PolNews<span className="text-red-600">Daily</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>

            <div className="flex items-center text-sm font-medium text-slate-400">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Today's Poland Briefing</h2>
          <p className="text-slate-500 text-lg">Detailed automated updates across {activeCategory.toLowerCase()} in English.</p>
        </div>

        {/* Loading / Error / Grid */}
        {briefing.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-sm border border-slate-100">
                <div className="bg-slate-200 h-48 w-full rounded-t-2xl mb-6"></div>
                <div className="px-6 space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : briefing.error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{briefing.error}</h3>
            <button 
              onClick={() => loadNews(activeCategory)}
              className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {briefing.items.map(item => (
              <NewsCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedNews}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal Overlay */}
      {selectedNews && (
        <BriefingDetails 
          item={selectedNews} 
          onClose={() => setSelectedNews(null)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-4">
            PolNews Daily is powered by Gemini AI with search grounding for real-time Polish news coverage.
          </p>
          <div className="flex justify-center gap-6">
             <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ethics</span>
             <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Methodology</span>
             <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Feedback</span>
          </div>
        </div>
      </footer>

      {/* Mobile Category Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full px-2 py-2 flex gap-1 shadow-2xl z-40 border border-white/10">
        {[Category.GENERAL, Category.POLITICS, Category.ECONOMY].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
