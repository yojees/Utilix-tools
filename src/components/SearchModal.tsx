import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolItem } from '../types';
import { ToolIcon } from './ToolIcon';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        // Triggered via App listener
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0f1013] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800/80">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools by name, keyword, or category..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-500 hover:text-neutral-300 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-0.5 text-xs font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-900/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:border-neutral-700 transition-colors shrink-0">
                    <ToolIcon name={tool.iconName} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                        {tool.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {tool.category}
                      </span>
                      {tool.isComingSoon && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 border border-amber-800/80 text-amber-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-colors shrink-0 ml-2" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-neutral-300">No tools found</p>
              <p className="text-xs text-neutral-500 mt-1">
                We couldn&apos;t find any tool matching &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
