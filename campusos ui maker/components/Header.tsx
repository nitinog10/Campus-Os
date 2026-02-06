
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-tight">SparkUI</span>
      </div>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://vercel.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-neutral-500 hover:text-black transition-colors"
        >
          Documentation
        </a>
        <div className="h-4 w-px bg-neutral-200" />
        <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-all">
          Deploy
        </button>
      </div>
    </header>
  );
};
