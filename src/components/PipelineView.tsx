import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import type { Pipeline, PipelineStep } from '@/types/campusos';
import { cn } from '@/lib/utils';

interface PipelineViewProps {
  pipeline: Pipeline | null;
  currentStep: string | null;
}

export function PipelineView({ pipeline, currentStep }: PipelineViewProps) {
  if (!pipeline) return null;

  return (
    <div className="w-full max-w-md">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Creation Pipeline
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {pipeline.steps.filter(s => s.status === 'complete').length} of {pipeline.steps.length} complete
        </p>
      </div>
      
      <div className="space-y-3 stagger-children">
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
        'pipeline-step',
        isActive && 'pipeline-step-active',
        step.status === 'complete' && 'pipeline-step-complete'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <StepIcon status={step.status} isActive={isActive} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className="font-medium text-sm truncate">{step.name}</h4>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {step.description}
        </p>
        
        <div className="mt-2">
          <span className={cn(
            'status-badge',
            step.status === 'pending' && 'status-badge-pending',
            step.status === 'processing' && 'status-badge-processing',
            step.status === 'complete' && 'status-badge-complete',
            step.status === 'error' && 'bg-destructive/10 text-destructive'
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
    return <Check className={cn(baseClass, 'text-success')} />;
  }
  
  if (status === 'processing' || isActive) {
    return <Loader2 className={cn(baseClass, 'text-primary animate-spin')} />;
  }
  
  if (status === 'error') {
    return <AlertCircle className={cn(baseClass, 'text-destructive')} />;
  }
  
  return <Circle className={cn(baseClass, 'text-muted-foreground/40')} />;
}
