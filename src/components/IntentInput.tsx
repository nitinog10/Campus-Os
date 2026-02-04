import { Sparkles } from 'lucide-react';

interface IntentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const PLACEHOLDERS = [
  "I need to promote our college's annual tech fest happening next month...",
  "Create a landing page for my student startup that helps with exam prep...",
  "I have to make a presentation about climate change for my environmental science class...",
];

export function IntentInput({ value, onChange, onSubmit, isProcessing }: IntentInputProps) {
  const placeholder = PLACEHOLDERS[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="intent-input pr-4"
          disabled={isProcessing}
          rows={6}
        />
        
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            ⌘ + Enter to create
          </span>
          
          <button
            onClick={onSubmit}
            disabled={isProcessing || !value.trim()}
            className="btn-gradient flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <IntentChip label="Event Promotion" onClick={() => onChange("I need to promote our college hackathon happening next weekend. It's open to all students, has exciting prizes, and we want maximum participation.")} />
        <IntentChip label="Landing Page" onClick={() => onChange("Create a simple landing page for our study group. We help students with programming assignments and conduct weekend coding sessions.")} />
        <IntentChip label="Presentation" onClick={() => onChange("I need a presentation on artificial intelligence for my computer science class. It should cover basics, applications, and future scope.")} />
      </div>
    </div>
  );
}

function IntentChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground"
    >
      {label}
    </button>
  );
}
