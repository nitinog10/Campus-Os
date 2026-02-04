import type { GeneratedAsset } from '@/types/campusos';
import { AssetCard } from './AssetCard';
import { Layers, Sparkles } from 'lucide-react';

interface CreationCanvasProps {
  assets: GeneratedAsset[];
}

export function CreationCanvas({ assets }: CreationCanvasProps) {
  if (assets.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Generated Assets</h2>
            <p className="text-sm text-slate-500">
              {assets.length} asset{assets.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>
        
        <div className="badge-primary">
          <Sparkles className="w-3 h-3" />
          Ready
        </div>
      </div>

      {/* 2-Column Grid Layout - Notion/Linear style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {assets.map((asset, index) => (
          <AssetCard key={asset.id} asset={asset} index={index} />
        ))}
      </div>
    </div>
  );
}
