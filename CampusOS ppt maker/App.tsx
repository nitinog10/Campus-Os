
import React, { useState, useCallback, useRef } from 'react';
import { ThemeType, Presentation, Message, Slide } from './types';
import { THEME_CONFIGS } from './constants';
import { generatePresentationDraft, generateSlideImage } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import SlideRenderer from './components/SlideRenderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(ThemeType.MODERN);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsEditing(false);

    try {
      const draft = await generatePresentationDraft(text);
      setPresentation(draft);
      setCurrentSlideIndex(0);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've created a ${draft.slides.length}-slide professional presentation for "${draft.topic}". I'm now generating high-quality AI visuals and scripts for your presenter view. You can edit content on the fly!`,
        presentation: draft
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      setIsGeneratingImages(true);
      const updatedSlides = [...draft.slides];
      
      for (let i = 0; i < updatedSlides.length; i++) {
        try {
          const imageUrl = await generateSlideImage(updatedSlides[i].imagePrompt);
          updatedSlides[i] = { ...updatedSlides[i], imageUrl };
          setPresentation(prev => prev ? { ...prev, slides: [...updatedSlides] } : null);
        } catch (err) {
          console.error("Error generating image for slide", i, err);
        }
      }
      setIsGeneratingImages(false);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I encountered an error. Please try a different topic or try again later."
      }]);
      setIsLoading(false);
    }
  }, []);

  const handleUpdateSlide = (updatedSlide: Partial<Slide>) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updatedSlide };
    setPresentation({ ...presentation, slides: newSlides });
  };

  const nextSlide = () => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setIsEditing(false);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setIsEditing(false);
    }
  };

  const exportToPDF = async () => {
    if (!presentation || !exportContainerRef.current) return;
    setIsExporting(true);
    const pdf = new jsPDF('landscape', 'px', [1280, 720]);
    for (let i = 0; i < presentation.slides.length; i++) {
      const slideElement = document.getElementById(`export-slide-${i}`);
      if (!slideElement) continue;
      slideElement.classList.remove('hidden');
      const canvas = await html2canvas(slideElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
      slideElement.classList.add('hidden');
    }
    pdf.save(`${presentation.topic.replace(/\s+/g, '_')}_presentation.pdf`);
    setIsExporting(false);
  };

  const togglePresenterMode = () => {
    if (!isPresenting) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsPresenting(!isPresenting);
  };

  return (
    <div className={`flex h-screen w-full ${isPresenting ? 'bg-slate-950' : 'bg-slate-50'} overflow-hidden transition-colors duration-500`}>
      <div ref={exportContainerRef} className="fixed top-[-10000px] left-[-10000px] w-[1280px] h-[720px]">
        {presentation?.slides.map((slide, idx) => (
          <SlideRenderer key={`export-${slide.id}`} containerId={`export-slide-${idx}`} slide={slide} theme={themeConfig} isActive={false} isEditing={false} />
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!isPresenting && (
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <h1 className="font-bold text-slate-800 text-lg hidden sm:block">SlideCraft AI</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:block">Theme</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((type) => (
                    <button key={type} onClick={() => setCurrentTheme(type)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentTheme === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {THEME_CONFIGS[type].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {presentation && (
                <div className="flex gap-2">
                  <button onClick={togglePresenterMode} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                    Present
                  </button>
                  <button onClick={exportToPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50">
                    {isExporting ? 'Exporting...' : 'PDF'}
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        <main className={`flex-1 relative flex items-center justify-center ${isPresenting ? 'p-0' : 'p-4 md:p-8 lg:p-12'} overflow-hidden`}>
          {presentation ? (
            <div className={`w-full h-full flex ${isPresenting ? 'flex-row' : 'flex-col'} max-w-full max-h-full`}>
              <div className={`${isPresenting ? 'w-2/3 h-full p-8' : 'flex-1 relative group overflow-hidden rounded-xl shadow-2xl'}`}>
                <div 
                  className="flex w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                >
                  {presentation.slides.map((slide, idx) => (
                    <div key={slide.id} className="w-full h-full flex-shrink-0">
                      <SlideRenderer slide={slide} theme={themeConfig} isActive={true} isEditing={isEditing && currentSlideIndex === idx} onUpdate={handleUpdateSlide} />
                    </div>
                  ))}
                </div>
                
                {!isPresenting && (
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl shadow-lg transition-all ${isEditing ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                      {isEditing ? 'Save' : 'Edit'}
                    </button>
                  </div>
                )}

                <div className={`absolute inset-y-0 left-0 flex items-center p-4 z-30 transition-opacity ${isPresenting ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0 || isEditing} className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-slate-600 hover:text-indigo-600 disabled:opacity-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                  </button>
                </div>
                <div className={`absolute inset-y-0 right-0 flex items-center p-4 z-30 transition-opacity ${isPresenting ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1 || isEditing} className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-slate-600 hover:text-indigo-600 disabled:opacity-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </div>
              </div>

              {isPresenting && (
                <div className="w-1/3 h-full bg-slate-900 border-l border-slate-800 flex flex-col p-8 overflow-y-auto text-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest">Presenter Notes</h3>
                    <button onClick={togglePresenterMode} className="text-slate-500 hover:text-white">Close</button>
                  </div>
                  <div className="flex-1 text-xl leading-relaxed font-medium mb-12">
                    {presentation.slides[currentSlideIndex].speakerNotes}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-800">
                    <span className="text-sm text-slate-500">Slide {currentSlideIndex + 1} of {presentation.slides.length}</span>
                  </div>
                </div>
              )}

              {!isPresenting && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <div className="flex gap-2">
                    {presentation.slides.map((_, idx) => (
                      <button key={idx} onClick={() => !isEditing && setCurrentSlideIndex(idx)} disabled={isEditing} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlideIndex === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">{currentSlideIndex + 1} / {presentation.slides.length}</span>
                  {isGeneratingImages && <div className="ml-4 flex items-center text-xs text-indigo-600 font-medium animate-pulse">Generating Visuals...</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-slate-800 mb-3 font-title">AI Presentations</h2>
              <p className="text-slate-500 mb-8">Type a topic in the chat to generate slides with professional themes, AI visuals, and speaker notes.</p>
              <div className="grid grid-cols-2 gap-3">
                {['Future of Tech', 'Global Warming', 'Modern Art', 'Health Tips'].map(t => (
                  <button key={t} onClick={() => handleSendMessage(t)} className="p-3 text-xs bg-white border border-slate-200 rounded-xl hover:text-indigo-600 shadow-sm">{t}</button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {!isPresenting && (
        <div className="w-80 lg:w-96 hidden sm:block">
          <ChatWindow messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default App;
