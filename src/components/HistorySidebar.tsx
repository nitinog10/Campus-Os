import React from 'react';
import { X, Plus, Clock, Calendar, Globe, Presentation, Trash2, Sparkles } from 'lucide-react';
import type { HistoryEntry } from '@/types/history';

interface HistorySidebarProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  activeEntryId: string | null;
  onClose: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  onNewChat: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  entries,
  activeEntryId,
  onClose,
  onSelectEntry,
  onDeleteEntry,
  onClearHistory,
  onNewChat,
}) => {
  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else if (date > new Date(today.setDate(today.getDate() - 7))) {
      dateKey = 'Previous 7 Days';
    } else {
      dateKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, HistoryEntry[]>);

  const dateOrder = ['Today', 'Yesterday', 'Previous 7 Days'];

  const getIntentIcon = (type: string) => {
    switch (type) {
      case 'event_promotion':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'website':
        return <Globe className="w-4 h-4 text-cyan-500" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-violet-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 sidebar-glass z-50 transform transition-all duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-800">History</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-sm !p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="btn-primary w-full justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Creation
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No history yet</p>
              <p className="text-xs text-slate-400 mt-1">Your creations will appear here</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedEntries)
                .sort(([a], [b]) => {
                  const aIdx = dateOrder.indexOf(a);
                  const bIdx = dateOrder.indexOf(b);
                  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                  if (aIdx !== -1) return -1;
                  if (bIdx !== -1) return 1;
                  return 0;
                })
                .map(([dateKey, dateEntries]) => (
                  <div key={dateKey}>
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                      {dateKey}
                    </h3>
                    <div className="space-y-1">
                      {dateEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            activeEntryId === entry.id
                              ? 'bg-indigo-50 border border-indigo-200/60 shadow-sm'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => onSelectEntry(entry)}
                        >
                          {/* Intent type icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeEntryId === entry.id ? 'bg-indigo-100' : 'bg-slate-100'
                          }`}>
                            {getIntentIcon(entry.intent.type)}
                          </div>
                          
                          {/* Entry title */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              activeEntryId === entry.id ? 'text-indigo-700' : 'text-slate-700'
                            }`}>
                              {entry.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </p>
                          </div>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEntry(entry.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-slate-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer - Clear All */}
        {entries.length > 0 && (
          <div className="p-4 border-t border-slate-200/60">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all history?')) {
                  onClearHistory();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default HistorySidebar;
