import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  showReset: boolean;
  onReset: () => void;
}

export function Header({ showReset, onReset }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg leading-none">CAMPUSOS</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Generative AI for Everyone
            </p>
          </div>
        </div>

        {showReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        )}
      </div>
    </header>
  );
}
