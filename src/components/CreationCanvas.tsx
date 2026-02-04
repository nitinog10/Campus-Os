import type { GeneratedAsset } from '@/types/campusos';
import { AssetCard } from './AssetCard';

interface CreationCanvasProps {
  assets: GeneratedAsset[];
}

export function CreationCanvas({ assets }: CreationCanvasProps) {
  if (assets.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold">Generated Assets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {assets.length} asset{assets.length !== 1 ? 's' : ''} created
        </p>
      </div>

      <div className="grid gap-6">
        {assets.map((asset, index) => (
          <AssetCard key={asset.id} asset={asset} index={index} />
        ))}
      </div>
    </div>
  );
}
