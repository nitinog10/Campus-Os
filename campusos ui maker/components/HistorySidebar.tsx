
import React from 'react';
import { GeneratedPage } from '../types';

interface HistorySidebarProps {
  history: GeneratedPage[];
  currentId: string | null;
  onSelect: (page: GeneratedPage) => void;
  onNew: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, currentId, onSelect, onNew }) => {
  return (
    <div className="w-64 border-r border-neutral-200 bg-[#fafafa] flex flex-col shrink-0 h-full">
      <div className="p-4">
        <button 
          onClick={onNew}
          className="w-full bg-black text-white text-sm font-medium h-9 rounded-md flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Generation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar">
        <p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 mt-4">History</p>
        {history.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-neutral-400">No pages generated yet</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all group ${
                currentId === item.id 
                  ? 'bg-white shadow-sm ring-1 ring-neutral-200 text-black' 
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <p className="text-xs font-medium truncate">{item.prompt}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </button>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold truncate">Guest Developer</p>
            <p className="text-[10px] text-neutral-500 truncate">Free Tier</p>
          </div>
        </div>
      </div>
    </div>
  );
};
