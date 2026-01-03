
import React, { useState, useRef } from 'react';
import { NewsItem } from '../types';
import { generateSpeech, decodeAudioData } from '../services/geminiService';

interface BriefingDetailsProps {
  item: NewsItem;
  onClose: () => void;
}

const BriefingDetails: React.FC<BriefingDetailsProps> = ({ item, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioData = await generateSpeech(item.content);
      const buffer = await decodeAudioData(audioData, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio playback error", err);
      alert("Failed to generate audio briefing.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
        
        {/* Header/Banner */}
        <div className="relative h-64 md:h-80 shrink-0">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="absolute bottom-8 left-8 right-8">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-widest mb-4 inline-block">
              {item.category}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {item.title}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Report */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={handlePlayAudio}
                  disabled={isGeneratingAudio}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${
                    isPlaying 
                      ? 'bg-red-100 text-red-600 border-2 border-red-600' 
                      : 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95'
                  }`}
                >
                  {isGeneratingAudio ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  )}
                  {isGeneratingAudio ? 'Synthesizing...' : isPlaying ? 'Stop Audio' : 'Listen to Report'}
                </button>
                <div className="text-sm text-slate-400 font-medium">
                  {item.timestamp} • English News from Poland
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                {item.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-slate-700 text-lg leading-relaxed mb-6 font-light">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Column: Sources */}
            <div className="w-full md:w-64 shrink-0">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Original Sources</h4>
              <div className="space-y-3">
                {item.sources.length > 0 ? item.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all group"
                  >
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-red-700">{source.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{source.uri}</div>
                  </a>
                )) : (
                  <div className="text-sm text-slate-400 italic">Grounding details aggregated from multiple Polish news outlets.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefingDetails;
