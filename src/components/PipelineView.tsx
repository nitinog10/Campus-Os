import { Check, Loader2, Circle, AlertCircle, Zap } from 'lucide-react';
import type { Pipeline, PipelineStep } from '@/types/campusos';
import { cn } from '@/lib/utils';

interface PipelineViewProps {
  pipeline: Pipeline | null;
  currentStep: string | null;
}

export function PipelineView({ pipeline, currentStep }: PipelineViewProps) {
  if (!pipeline) return null;

  const completedSteps = pipeline.steps.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / pipeline.steps.length) * 100;

  return (
    <div className="w-full max-w-md">
      {/* Header with progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Creation Pipeline
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {completedSteps}/{pipeline.steps.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2.5 stagger-children">
        {pipeline.steps.map((step, index) => (
          <PipelineStepCard 
            key={step.id} 
            step={step} 
            index={index}
            isActive={currentStep === step.id}
          />
        ))}
      </div>
    </div>
  );
}

interface PipelineStepCardProps {
  step: PipelineStep;
  index: number;
  isActive: boolean;
}

function PipelineStepCard({ step, index, isActive }: PipelineStepCardProps) {
  return (
    <div 
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-all duration-200',
        isActive && 'bg-indigo-50 border-indigo-200 shadow-sm',
        step.status === 'complete' && !isActive && 'bg-emerald-50/50 border-emerald-200/50',
        step.status === 'pending' && !isActive && 'bg-white border-slate-200/60',
        step.status === 'error' && 'bg-red-50 border-red-200'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <StepIcon status={step.status} isActive={isActive} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded',
            isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
          )}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className={cn(
            'font-medium text-sm truncate',
            isActive ? 'text-indigo-700' : step.status === 'complete' ? 'text-emerald-700' : 'text-slate-700'
          )}>
            {step.name}
          </h4>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {step.description}
        </p>
        
        <div className="mt-2.5">
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
            step.status === 'pending' && 'bg-slate-100 text-slate-500',
            step.status === 'processing' && 'bg-indigo-100 text-indigo-600',
            step.status === 'complete' && 'bg-emerald-100 text-emerald-600',
            step.status === 'error' && 'bg-red-100 text-red-600'
          )}>
            {step.type}
          </span>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ status, isActive }: { status: PipelineStep['status']; isActive: boolean }) {
  const baseClass = 'w-5 h-5';
  
  if (status === 'complete') {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
    );
  }
  
  if (status === 'processing' || isActive) {
    return (
      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
        <AlertCircle className="w-3.5 h-3.5 text-white" />
      </div>
    );
  }
  
  return (
    <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center">
      <Circle className="w-2 h-2 text-slate-300" fill="currentColor" />
    </div>
  );
}
