import type { ParsedIntent } from '@/types/campusos';
import { Target, Users, MessageSquare, LayoutList, CheckCircle2 } from 'lucide-react';

interface IntentSummaryProps {
  intent: ParsedIntent;
}

export function IntentSummary({ intent }: IntentSummaryProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-in">
      <div className="card-elevated rounded-2xl p-6 overflow-hidden relative">
        {/* Success indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400" />
        
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Target className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-primary">
                <CheckCircle2 className="w-3 h-3" />
                {intent.type.replace('_', ' ')}
              </span>
              <span className="badge-secondary capitalize">
                {intent.tone}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-3">{intent.title}</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{intent.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Audience</p>
              <p className="text-sm font-semibold text-slate-700">{intent.audience}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Tone</p>
              <p className="text-sm font-semibold text-slate-700 capitalize">{intent.tone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <LayoutList className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Elements</p>
              <p className="text-sm font-semibold text-slate-700">{intent.elements.length} items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
