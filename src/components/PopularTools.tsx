import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolIcon } from './ToolIcon';

interface PopularToolsProps {
  onSelectTool: (toolId: string) => void;
  onViewAllTools: () => void;
}

export const PopularTools: React.FC<PopularToolsProps> = ({ onSelectTool, onViewAllTools }) => {
  const popularTools = TOOLS.filter((t) => t.popular);

  return (
    <section id="popular-tools-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Popular tools
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Frequently used utilities ready to run right in your browser.
          </p>
        </div>

        <button
          onClick={onViewAllTools}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors group"
        >
          View all tools <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularTools.map((tool) => (
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
                {tool.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-950 border border-neutral-800 text-neutral-400">
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
              <span className="capitalize font-mono text-[11px]">{tool.category}</span>
              <span className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all text-[11px] font-medium">
                Open Tool <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
