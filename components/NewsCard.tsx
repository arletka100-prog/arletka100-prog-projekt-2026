
import React from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 flex flex-col"
      onClick={() => onClick(item)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 rounded-full uppercase tracking-wider shadow-sm">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-xs text-slate-400 mb-2 font-medium">
          Poland • {item.timestamp}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {item.summary}
        </p>
        
        <div className="mt-auto flex items-center text-red-600 text-sm font-semibold">
          Read Full Report
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
