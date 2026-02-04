
import React from 'react';
import { Slide, ThemeConfig } from '../types';

interface SlideRendererProps {
  slide: Slide;
  theme: ThemeConfig;
  isActive: boolean;
  isEditing: boolean;
  onUpdate?: (updatedSlide: Partial<Slide>) => void;
  containerId?: string;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ 
  slide, 
  theme, 
  isActive, 
  isEditing, 
  onUpdate,
  containerId 
}) => {
  const isHiddenForExport = containerId && !isActive;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate?.({ title: e.target.value });
  };

  const handleContentChange = (index: number, value: string) => {
    const newContent = [...slide.content];
    newContent[index] = value;
    onUpdate?.({ content: newContent });
  };

  const renderContent = () => (
    <div className="flex flex-col justify-center h-full p-8 md:p-12 lg:p-16 overflow-y-auto transition-opacity duration-700">
      {isEditing ? (
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Slide Title</label>
            <input
              type="text"
              value={slide.title}
              onChange={handleTitleChange}
              className={`w-full text-3xl font-bold bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-2 ${theme.fontClass} ${theme.text}`}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Points</label>
            {slide.content.map((point, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${theme.accent}`}></span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleContentChange(idx, e.target.value)}
                  className={`flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-300 outline-none text-lg ${theme.text}`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-8 ${theme.fontClass} ${theme.text}`}>
            {slide.title}
          </h2>
          <ul className={`space-y-4 text-lg md:text-xl lg:text-2xl ${theme.text} opacity-90`}>
            {slide.content.map((point, idx) => (
              <li key={idx} className="flex items-start">
                <span className={`inline-block w-2 h-2 mt-3 mr-4 rounded-full ${theme.accent}`}></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const renderImage = () => (
    <div className="relative w-full h-full overflow-hidden bg-slate-200">
      {slide.imageUrl ? (
        <img 
          src={slide.imageUrl} 
          alt={slide.title} 
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-slate-300 rounded-full mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Generating AI Visual...</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      id={containerId}
      className={`w-full h-full grid ${slide.layout === 'center' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} ${theme.bg} overflow-hidden ${isHiddenForExport ? 'hidden' : ''}`}
    >
      {slide.layout === 'left' && (
        <>
          {renderContent()}
          {renderImage()}
        </>
      )}
      {slide.layout === 'right' && (
        <>
          <div className="order-2 md:order-1">{renderImage()}</div>
          <div className="order-1 md:order-2">{renderContent()}</div>
        </>
      )}
      {slide.layout === 'center' && (
        <div className="relative h-full">
          <div className="absolute inset-0 z-0">
             {renderImage()}
             <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
            {isEditing ? (
              <div className="max-w-2xl w-full space-y-8 bg-black/40 p-8 rounded-2xl backdrop-blur-sm">
                <input
                  type="text"
                  value={slide.title}
                  onChange={handleTitleChange}
                  className={`w-full text-5xl font-bold bg-transparent border-b-2 border-white/50 focus:border-white outline-none text-center pb-2 ${theme.fontClass} text-white`}
                />
                <div className="space-y-4">
                   {slide.content.map((point, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={point}
                      onChange={(e) => handleContentChange(idx, e.target.value)}
                      className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-center text-xl text-white/90"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h2 className={`text-4xl md:text-7xl font-bold mb-8 ${theme.fontClass} text-white drop-shadow-lg`}>
                  {slide.title}
                </h2>
                <ul className="space-y-4 text-xl md:text-2xl text-white/90 drop-shadow-md">
                  {slide.content.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideRenderer;
