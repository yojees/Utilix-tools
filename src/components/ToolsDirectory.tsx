import React, { useState } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { TOOLS, CATEGORIES_LIST } from '../data/tools';
import { ToolCategory, ToolItem } from '../types';
import { ToolIcon } from './ToolIcon';

interface ToolsDirectoryProps {
  onSelectTool: (toolId: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const filteredTools = TOOLS.filter((tool) => {
    // Category match
    const categoryMatches =
      selectedCategory === 'all' || tool.category === selectedCategory;

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const searchMatches =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q);

    return categoryMatches && searchMatches;
  });

  return (
    <section id="tools-directory" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-900">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Tools
        </h2>
        <p className="text-sm text-neutral-400">
          Everything you need, in one place.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="space-y-4 max-w-3xl mx-auto mb-10">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="tools-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ToolCategory)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group p-5 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-200 group-hover:border-neutral-600 transition-colors shadow-sm">
                    <ToolIcon name={tool.iconName} className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.isComingSoon ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/60 border border-amber-800/80 text-amber-400">
                        Coming Soon
                      </span>
                    ) : tool.badge ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {tool.badge}
                      </span>
                    ) : null}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
                <span className="capitalize font-mono text-[11px]">{tool.category}</span>
                <span className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all text-[11px] font-medium">
                  {tool.isComingSoon ? 'Details' : 'Open'} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-neutral-200">No tools found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            No tools matched your search or category filter. Try clearing the search or exploring other categories.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onSelectCategory('all');
            }}
            className="mt-4 px-4 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
