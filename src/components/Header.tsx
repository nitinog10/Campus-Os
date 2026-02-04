import { RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  showReset: boolean;
  onReset: () => void;
}

export function Header({ showReset, onReset }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="page-container h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none text-white">
              CampusOS
            </h1>
            <p className="text-[11px] text-white/60 font-medium tracking-wide">
              AI Creation Studio
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all group"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-300" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
