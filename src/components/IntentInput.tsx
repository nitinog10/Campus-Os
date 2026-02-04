import { Sparkles, Calendar, Globe, Presentation } from 'lucide-react';

interface IntentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const PLACEHOLDERS = [
  "Describe what you want to create... An event poster? A landing page? A presentation?",
  "I need to promote our college's annual tech fest happening next month...",
  "Create a landing page for my student startup that helps with exam prep...",
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
      <div className="relative p-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/20">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[180px] px-6 py-5 text-base bg-transparent border-0 rounded-xl resize-none focus:outline-none focus:ring-0 placeholder:text-white/40 text-white"
          disabled={isProcessing}
          rows={6}
        />
        
        <div className="px-5 pb-4 flex items-center justify-between">
          <span className="text-xs text-white/50 font-medium">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">⌘</kbd>
            <span className="mx-1">+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">Enter</kbd>
            <span className="ml-2">to create</span>
          </span>
          
          <button
            onClick={onSubmit}
            disabled={isProcessing || !value.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <IntentChip 
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Event Promotion" 
          onClick={() => onChange("I need to promote our college hackathon happening next weekend. It's open to all students, has exciting prizes, and we want maximum participation.")} 
        />
        <IntentChip 
          icon={<Globe className="w-3.5 h-3.5" />}
          label="Landing Page" 
          onClick={() => onChange("Create a simple landing page for our study group. We help students with programming assignments and conduct weekend coding sessions.")} 
        />
        <IntentChip 
          icon={<Presentation className="w-3.5 h-3.5" />}
          label="Presentation" 
          onClick={() => onChange("I need a presentation on artificial intelligence for my computer science class. It should cover basics, applications, and future scope.")} 
        />
      </div>
    </div>
  );
}

function IntentChip({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:text-white"
    >
      {icon}
      {label}
    </button>
  );
}
