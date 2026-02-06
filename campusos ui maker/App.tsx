
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HistorySidebar } from './components/HistorySidebar';
import { DisplayPanel } from './components/DisplayPanel';
import { GeneratedPage, GenerationState } from './types';
import { generateWebPage } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<GeneratedPage[]>([]);
  const [currentPage, setCurrentPage] = useState<GeneratedPage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || genState.isGenerating) return;

    setGenState({ isGenerating: true, error: null });

    try {
      const result = await generateWebPage(prompt);
      
      const newPage: GeneratedPage = {
        id: crypto.randomUUID(),
        prompt: prompt,
        code: result.code,
        description: result.description,
        timestamp: Date.now()
      };

      setHistory(prev => [newPage, ...prev]);
      setCurrentPage(newPage);
      setPrompt('');
    } catch (err: any) {
      setGenState(prev => ({ ...prev, error: err.message || 'Something went wrong' }));
    } finally {
      setGenState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const selectHistoryItem = (page: GeneratedPage) => {
    setCurrentPage(page);
  };

  const startNew = () => {
    setCurrentPage(null);
    setPrompt('');
  };

  return (
    <div className="flex h-screen w-full bg-[#fafafa]">
      <HistorySidebar 
        history={history} 
        currentId={currentPage?.id || null} 
        onSelect={selectHistoryItem}
        onNew={startNew}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Display Viewport */}
          <DisplayPanel 
            page={currentPage} 
            isGenerating={genState.isGenerating} 
          />

          {/* Bottom Prompt Bar */}
          <div className="p-4 bg-white border-t border-neutral-200">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleGenerate} className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask SparkUI to build something (e.g., 'A modern SaaS dashboard with dark mode and data charts')..."
                  className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all resize-none h-14 no-scrollbar"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate(e as any);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || genState.isGenerating}
                  className="absolute right-2.5 bottom-2.5 w-9 h-9 flex items-center justify-center rounded-lg bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                >
                  {genState.isGenerating ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </form>
              
              {genState.error && (
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                  <span className="bg-red-50 text-red-600 text-[11px] px-3 py-1 rounded-full border border-red-100 font-medium">
                    {genState.error}
                  </span>
                </div>
              )}
              
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-neutral-400">
                  Tip: Be specific about layout, colors, and components. Press <kbd className="font-sans border border-neutral-200 rounded px-1 py-0.5">Enter</kbd> to generate.
                </p>
                <div className="flex gap-3">
                  <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Gemini 3 Pro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
