import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolIcon } from './ToolIcon';

interface CategoriesSectionProps {
  onSelectTool: (toolId: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectTool }) => {
  const categories = [
    {
      id: 'images',
      title: 'Images',
      desc: 'Compress, resize, and inspect palettes with local canvas processing.',
      tools: TOOLS.filter((t) => t.category === 'images'),
    },
    {
      id: 'pdf',
      title: 'PDF',
      desc: 'Merge, slice, and manipulate documents offline using client-side WebAssembly.',
      tools: TOOLS.filter((t) => t.category === 'pdf'),
    },
    {
      id: 'developer',
      title: 'Developer',
      desc: 'Clean, encode, generate, and calculate data without touching remote APIs.',
      tools: TOOLS.filter((t) => t.category === 'developer'),
    },
    {
      id: 'utilities',
      title: 'Utilities',
      desc: 'Day-to-day tools built for speed, confidentiality, and zero friction.',
      tools: TOOLS.filter((t) => t.category === 'utilities'),
    },
  ];

  return (
    <section id="categories-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-900">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Categories
        </h2>
        <p className="text-sm text-neutral-400">
          Tools thoughtfully grouped by domain and workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                <h3 className="text-lg font-bold text-white font-mono">{cat.title}</h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {cat.tools.length} {cat.tools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed">
                {cat.desc}
              </p>

              <div className="space-y-2">
                {cat.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 hover:border-neutral-700 hover:bg-neutral-950 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ToolIcon name={tool.iconName} className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" />
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-white truncate">
                        {tool.name}
                      </span>
                      {tool.isComingSoon && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950/60 border border-amber-800/80 text-amber-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
