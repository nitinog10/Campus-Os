import type { ParsedIntent } from '@/types/campusos';
import { Target, Users, MessageSquare, LayoutList } from 'lucide-react';

interface IntentSummaryProps {
  intent: ParsedIntent;
}

export function IntentSummary({ intent }: IntentSummaryProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {intent.type.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {intent.tone}
              </span>
            </div>
            
            <h2 className="text-lg font-display font-semibold mt-3">{intent.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{intent.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Audience</p>
              <p className="text-sm font-medium">{intent.audience}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tone</p>
              <p className="text-sm font-medium capitalize">{intent.tone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LayoutList className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Elements</p>
              <p className="text-sm font-medium">{intent.elements.length} items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
