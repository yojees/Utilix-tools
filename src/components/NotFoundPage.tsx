import React from 'react';
import { ArrowLeft, Home, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onExploreTools: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onExploreTools,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 mb-2">
        <Compass className="w-8 h-8 text-neutral-300" />
      </div>

      <div className="space-y-2">
        <span className="inline-block text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
          ERROR 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
          Page not found
        </h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          The page or tool you&apos;re looking for doesn&apos;t exist, was renamed, or has been moved.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="btn-404-back-home"
          type="button"
          onClick={onNavigateHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Back to UTILIX</span>
        </button>

        <button
          id="btn-404-explore-tools"
          type="button"
          onClick={onExploreTools}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 font-medium text-xs hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <Compass className="w-4 h-4 text-neutral-400" />
          <span>Explore All Tools</span>
        </button>
      </div>
    </div>
  );
};
