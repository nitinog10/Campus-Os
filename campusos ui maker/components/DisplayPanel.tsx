
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedPage, ViewMode } from '../types';

interface DisplayPanelProps {
  page: GeneratedPage | null;
  isGenerating: boolean;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

export const DisplayPanel: React.FC<DisplayPanelProps> = ({ page, isGenerating }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (page?.code && iframeRef.current) {
      // Force refresh of iframe with new content
      iframeRef.current.srcdoc = page.code;
    }
  }, [page, viewMode]);

  const handleCopyCode = () => {
    if (page?.code) {
      navigator.clipboard.writeText(page.code);
    }
  };

  const handleOpenNewTab = () => {
    if (page?.code) {
      const blob = new Blob([page.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current && page?.code) {
      iframeRef.current.srcdoc = page.code;
    }
  };

  if (!page && !isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
        <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 border border-neutral-100">
          <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">Start Generating</h2>
        <p className="text-sm text-neutral-500 max-w-sm mt-2">
          Enter a prompt below to generate a modern UI using Tailwind CSS.
        </p>
      </div>
    );
  }

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
      {/* Tab & Controls Header */}
      <div className="h-12 border-b border-neutral-200 flex items-center justify-between px-4 bg-white shrink-0">
        <div className="flex gap-1">
          <button 
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === ViewMode.PREVIEW ? 'bg-neutral-100 text-black shadow-inner' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Preview
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.CODE)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === ViewMode.CODE ? 'bg-neutral-100 text-black shadow-inner' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Code
          </button>
        </div>

        {viewMode === ViewMode.PREVIEW && (
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button 
              onClick={() => setDeviceSize('mobile')}
              className={`p-1.5 rounded-md transition-all ${deviceSize === 'mobile' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="Mobile view"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </button>
            <button 
              onClick={() => setDeviceSize('tablet')}
              className={`p-1.5 rounded-md transition-all ${deviceSize === 'tablet' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="Tablet view"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </button>
            <button 
              onClick={() => setDeviceSize('desktop')}
              className={`p-1.5 rounded-md transition-all ${deviceSize === 'desktop' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="Desktop view"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {page && (
            <>
              <button 
                onClick={refreshPreview}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                title="Refresh preview"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={handleOpenNewTab}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 transition-colors"
                title="Open in new tab"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open
              </button>
              <button 
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-auto p-4 flex justify-center scroll-smooth bg-[#f5f5f5]">
        {isGenerating && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              <div className="w-12 h-12 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">Generating Experience</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Designing your interface...</p>
          </div>
        )}

        {viewMode === ViewMode.PREVIEW ? (
          <div 
            className="transition-all duration-300 ease-in-out h-full overflow-hidden bg-white shadow-xl rounded-xl border border-neutral-200"
            style={{ 
              width: getDeviceWidth(),
              maxHeight: deviceSize === 'desktop' ? '100%' : '800px'
            }}
          >
            <iframe 
              ref={iframeRef}
              className="w-full h-full border-none"
              title="UI Preview"
              sandbox="allow-scripts"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
             <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
               </div>
               <span className="text-[10px] text-neutral-500 mono">index.html</span>
             </div>
             <div className="flex-1 p-4 overflow-auto mono text-[11px] leading-relaxed text-neutral-300">
               <pre><code className="block">{page?.code || '<!-- No code generated yet -->'}</code></pre>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
