import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeType, Presentation, Message, Slide } from '@/types/presentation';
import { THEME_CONFIGS } from '@/constants/presentation';
import { generatePresentationDraft, generateSlideImage } from '@/services/geminiService';
import ChatWindow from '@/components/presentation/ChatWindow';
import SlideRenderer from '@/components/presentation/SlideRenderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const STORAGE_KEY_MESSAGES = 'campusos_presentation_messages';
const STORAGE_KEY_PRESENTATIONS = 'campusos_presentation_history';

interface SavedPresentation {
  id: string;
  topic: string;
  createdAt: string;
  presentation: Presentation;
}

const PresentationMaker: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(ThemeType.MODERN);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Load saved data on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const savedHistory = localStorage.getItem(STORAGE_KEY_PRESENTATIONS);
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }
    
    if (savedHistory) {
      try {
        setSavedPresentations(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading presentation history:', e);
      }
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }
  }, [messages]);

  // Save presentation to history when created
  const saveToHistory = useCallback((pres: Presentation) => {
    const newSaved: SavedPresentation = {
      id: Date.now().toString(),
      topic: pres.topic,
      createdAt: new Date().toISOString(),
      presentation: pres
    };
    
    setSavedPresentations(prev => {
      const updated = [newSaved, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem(STORAGE_KEY_PRESENTATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadFromHistory = (saved: SavedPresentation) => {
    setPresentation(saved.presentation);
    setCurrentSlideIndex(0);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setMessages([]);
    setSavedPresentations([]);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_PRESENTATIONS);
  };

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
      
      // Save to history after images are generated
      saveToHistory({ ...draft, slides: updatedSlides });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I encountered an error. Please try a different topic or try again later."
      }]);
      setIsLoading(false);
    }
  }, [saveToHistory]);

  const handleUpdateSlide = (updatedSlide: Partial<Slide>) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updatedSlide };
    setPresentation({ ...presentation, slides: newSlides });
  };

  const nextSlide = useCallback(() => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setIsEditing(false);
    }
  }, [presentation, currentSlideIndex]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setIsEditing(false);
    }
  }, [currentSlideIndex]);

  const togglePresenterMode = useCallback(() => {
    if (!isPresenting) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsPresenting(!isPresenting);
  }, [isPresenting]);

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return; // Don't navigate when editing
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ': // Space
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isPresenting) {
            e.preventDefault();
            togglePresenterMode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isEditing, isPresenting, togglePresenterMode]);

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

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${isPresenting ? 'bg-slate-950' : ''}`}>
      {/* Premium Background */}
      {!isPresenting && (
        <>
          <div className="mesh-gradient-bg" />
          <div className="noise-overlay" />
        </>
      )}
      
      <div ref={exportContainerRef} className="fixed top-[-10000px] left-[-10000px] w-[1280px] h-[720px]">
        {presentation?.slides.map((slide, idx) => (
          <SlideRenderer key={`export-${slide.id}`} containerId={`export-slide-${idx}`} slide={slide} theme={themeConfig} isActive={false} isEditing={false} />
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {!isPresenting && (
          <header className="header-glass h-16 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="btn-ghost p-2.5 rounded-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-30" />
                  <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
                    </svg>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display font-bold text-foreground">SlideCraft</h1>
                  <p className="text-[11px] text-muted-foreground">AI Presentations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* History Button */}
              <button 
                onClick={() => setShowHistory(true)} 
                className="btn-ghost btn-sm"
                title="View History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="hidden md:inline">History</span>
              </button>

              {/* Theme Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:block">Theme</span>
                <div className="flex card-base p-1 gap-0.5">
                  {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((type) => (
                    <button 
                      key={type} 
                      onClick={() => setCurrentTheme(type)} 
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        currentTheme === type 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {THEME_CONFIGS[type].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {presentation && (
                <div className="flex gap-2">
                  <button onClick={togglePresenterMode} className="btn-primary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                    Present
                  </button>
                  <button onClick={exportToPDF} disabled={isExporting} className="btn-secondary btn-sm">
                    {isExporting ? (
                      <>
                        <span className="spinner w-3 h-3" />
                        Exporting
                      </>
                    ) : 'PDF'}
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        <main className={`flex-1 relative flex items-center justify-center ${isPresenting ? 'p-0' : 'p-6 md:p-10 lg:p-12'} overflow-hidden`}>
          {presentation ? (
            <div className={`w-full h-full flex ${isPresenting ? 'flex-row' : 'flex-col'} max-w-full max-h-full`}>
              <div className={`${isPresenting ? 'w-2/3 h-full p-8' : 'flex-1 relative group overflow-hidden rounded-2xl'}`} style={{ boxShadow: !isPresenting ? 'var(--shadow-xl)' : 'none' }}>
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
                    <button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className={`btn-sm ${isEditing ? 'btn-primary' : 'btn-secondary bg-card/90 backdrop-blur-sm'}`}
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </button>
                  </div>
                )}

                <div className={`absolute inset-y-0 left-0 flex items-center p-4 z-30 transition-opacity ${isPresenting ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0 || isEditing} className="p-3 rounded-full bg-card/90 backdrop-blur-sm shadow-lg text-muted-foreground hover:text-primary disabled:opacity-0 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                  </button>
                </div>
                <div className={`absolute inset-y-0 right-0 flex items-center p-4 z-30 transition-opacity ${isPresenting ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1 || isEditing} className="p-3 rounded-full bg-card/90 backdrop-blur-sm shadow-lg text-muted-foreground hover:text-primary disabled:opacity-0 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </div>
              </div>

              {isPresenting && (
                <div className="w-1/3 h-full bg-slate-900 border-l border-slate-800 flex flex-col p-8 overflow-y-auto text-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest">Presenter Notes</h3>
                    <button 
                      onClick={togglePresenterMode} 
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      Exit
                    </button>
                  </div>
                  <div className="flex-1 text-xl leading-relaxed font-medium mb-12">
                    {presentation.slides[currentSlideIndex].speakerNotes}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Slide {currentSlideIndex + 1} of {presentation.slides.length}</span>
                    <div className="flex gap-2">
                      <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        ← Prev
                      </button>
                      <button onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isPresenting && (
                <div className="mt-8 flex justify-center items-center gap-6">
                  <div className="flex gap-1.5">
                    {presentation.slides.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => !isEditing && setCurrentSlideIndex(idx)} 
                        disabled={isEditing} 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSlideIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground/40'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{currentSlideIndex + 1} / {presentation.slides.length}</span>
                  {isGeneratingImages && (
                    <div className="ml-4 flex items-center gap-2 badge-primary">
                      <span className="spinner w-3 h-3" />
                      Generating Visuals...
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center max-w-lg animate-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
                </svg>
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">AI Presentations</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Type a topic in the chat to generate beautiful slides with professional themes, AI visuals, and speaker notes.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Future of Tech', 'Global Warming', 'Modern Art', 'Health Tips'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => handleSendMessage(t)} 
                    className="card-hover p-4 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {!isPresenting && (
        <div className="w-80 lg:w-96 hidden sm:flex flex-col border-l border-border/50 bg-card/50 backdrop-blur-xl">
          <ChatWindow messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card-elevated w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Presentation History</h2>
                  <p className="text-sm text-muted-foreground">{savedPresentations.length} saved presentation{savedPresentations.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="btn-ghost p-2.5 rounded-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh] scrollbar-thin">
              {savedPresentations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-muted-foreground/50">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  </div>
                  <h3 className="text-foreground font-medium mb-1">No saved presentations</h3>
                  <p className="text-sm text-muted-foreground">Generated presentations will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPresentations.map((saved) => (
                    <div 
                      key={saved.id} 
                      className="flex items-center justify-between p-4 card-hover group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{saved.topic}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(saved.createdAt).toLocaleDateString()} at {new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2">•</span>
                          {saved.presentation.slides.length} slides
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            loadFromHistory(saved);
                            setShowHistory(false);
                          }}
                          className="btn-primary btn-sm"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            {savedPresentations.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-border/50 bg-secondary/30">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all saved presentations?')) {
                      clearHistory();
                    }
                  }}
                  className="btn-ghost btn-sm text-destructive hover:bg-destructive/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Clear All
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationMaker;
