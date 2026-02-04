import { useState } from 'react';
import { FileText, Palette, Code, ChevronDown, ChevronUp, Lightbulb, Copy, Check, ExternalLink } from 'lucide-react';
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

  return (
    <div 
      className="asset-card animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            asset.type === 'text' && 'bg-primary/10 text-primary',
            asset.type === 'design' && 'bg-accent/10 text-accent',
            asset.type === 'code' && 'bg-success/10 text-success'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{asset.subtype}</h3>
            <p className="text-xs text-muted-foreground capitalize">{asset.type} asset</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showExplanation ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-muted-foreground'
            )}
            title="Why this was generated"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
          
          {asset.type === 'code' && asset.content.includes('<!DOCTYPE') && (
            <button
              onClick={handlePreview}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
              title="Preview in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Explanation Panel */}
      {showExplanation && (
        <div className="p-4 bg-secondary/30 border-b border-border/50">
          <div className="explain-panel">
            <p className="explain-panel-title">Why this was generated</p>
            <p className="mb-3">{asset.explanation.rationale}</p>
            
            {asset.explanation.decisions.length > 0 && (
              <>
                <p className="explain-panel-title mt-4">Key decisions</p>
                <ul className="list-disc list-inside space-y-1">
                  {asset.explanation.decisions.map((decision, i) => (
                    <li key={i}>{decision}</li>
                  ))}
                </ul>
              </>
            )}
            
            {asset.explanation.alternatives && asset.explanation.alternatives.length > 0 && (
              <>
                <p className="explain-panel-title mt-4">Alternatives considered</p>
                <ul className="list-disc list-inside space-y-1 opacity-70">
                  {asset.explanation.alternatives.map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {asset.type === 'code' ? (
            <div className="code-preview max-h-96 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">{asset.content}</pre>
            </div>
          ) : asset.type === 'design' ? (
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{asset.content}</div>
              </div>
              {asset.metadata.colors && (
                <div className="flex gap-2 mt-4">
                  {(asset.metadata.colors as string[]).map((color, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-lg shadow-sm border border-border/50"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{asset.content}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
