import { useState } from 'react';
import { FileText, Palette, Code, ChevronDown, ChevronUp, Lightbulb, Copy, Check, ExternalLink, Sparkles, Maximize2, X } from 'lucide-react';
import type { GeneratedAsset } from '@/types/campusos';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssetCardProps {
  asset: GeneratedAsset;
  index: number;
}

export function AssetCard({ asset, index }: AssetCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(asset.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (asset.type === 'code' && asset.content.includes('<!DOCTYPE')) {
      const blob = new Blob([asset.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const Icon = asset.type === 'text' ? FileText : asset.type === 'design' ? Palette : Code;
  
  const typeColors = {
    text: { bg: 'bg-indigo-100', text: 'text-indigo-600', gradient: 'from-indigo-500 to-violet-500' },
    design: { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
    code: { bg: 'bg-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-cyan-500' }
  };
  
  const colors = typeColors[asset.type];

  // Fullscreen Modal
  if (isFullscreen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        />
        
        {/* Fullscreen Content */}
        <div className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                `bg-gradient-to-br ${colors.gradient}`
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg text-slate-800">{asset.subtype}</h2>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                    colors.bg, colors.text
                  )}>
                    {asset.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500">AI-generated content</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  copied 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              
              {asset.type === 'code' && asset.content.includes('<!DOCTYPE') && (
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </button>
              )}
              
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto p-6">
            {asset.type === 'code' ? (
              <div className="bg-slate-900 rounded-xl p-6 min-h-full">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{asset.content}</pre>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="whitespace-pre-wrap text-base text-slate-700 leading-relaxed">{asset.content}</div>
                
                {asset.type === 'design' && asset.metadata.colors && (
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200">
                    <span className="text-sm text-slate-500 font-medium">Color Palette:</span>
                    <div className="flex gap-2">
                      {(asset.metadata.colors as string[]).map((color, i) => (
                        <div 
                          key={i}
                          className="w-10 h-10 rounded-lg shadow-md border border-slate-200 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explanation in Fullscreen */}
          {asset.explanation && (
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-slate-200">
              <div className="flex items-start gap-3 max-w-4xl mx-auto">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">Why this was generated</p>
                  <p className="text-sm text-slate-600">{asset.explanation.rationale}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div 
      className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200 overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            `bg-gradient-to-br ${colors.gradient}`
          )}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-800 truncate">{asset.subtype}</h3>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex-shrink-0',
                colors.bg, colors.text
              )}>
                {asset.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
            title="View fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              showExplanation 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
            )}
            title="Why this was generated"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              copied 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
            )}
            title="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {asset.type === 'code' && asset.content.includes('<!DOCTYPE') && (
            <button
              onClick={handlePreview}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
              title="Preview in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Explanation Panel - Collapsible */}
      {showExplanation && (
        <div className="px-4 py-3 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 border-b border-slate-100">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">Why this was generated</p>
              <p className="text-xs text-slate-600 leading-relaxed">{asset.explanation.rationale}</p>
              
              {asset.explanation.decisions.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Key decisions</p>
                  <ul className="space-y-1">
                    {asset.explanation.decisions.slice(0, 3).map((decision, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span className="line-clamp-2">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content - Flexible height */}
      {isExpanded && (
        <div className="flex-1 p-4 overflow-hidden">
          {asset.type === 'code' ? (
            <div className="bg-slate-900 rounded-xl p-3 h-full max-h-64 overflow-auto scrollbar-thin">
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{asset.content}</pre>
            </div>
          ) : asset.type === 'design' ? (
            <div className="space-y-3 h-full">
              <div className="max-h-48 overflow-auto scrollbar-thin">
                <div className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{asset.content}</div>
              </div>
              {asset.metadata.colors && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Colors</span>
                  <div className="flex gap-1.5">
                    {(asset.metadata.colors as string[]).map((color, i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 rounded-md shadow-sm border border-slate-200 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-48 overflow-auto scrollbar-thin">
              <div className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{asset.content}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
