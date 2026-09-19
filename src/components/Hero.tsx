import React from 'react';
import { ArrowDown, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreTools: () => void;
  onViewCategories: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreTools, onViewCategories }) => {
  return (
    <section id="hero-section" className="py-16 md:py-24 text-center px-4 relative">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Privacy / Feature pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>100% Client-Side</span>
          <span className="text-neutral-600">•</span>
          <span>Zero Server Uploads</span>
        </div>

        {/* Brand & Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-mono">
            UTILIX
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-neutral-300">
            Simple tools. Zero hassle.
          </p>
        </div>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Fast, privacy-friendly utilities for files, images, PDFs, developers, and everyday tasks.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="hero-btn-explore-tools"
            onClick={onExploreTools}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Explore Tools
          </button>
          <button
            id="hero-btn-view-categories"
            onClick={onViewCategories}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 font-semibold text-sm hover:bg-neutral-800 hover:text-white transition-colors"
          >
            View Categories
          </button>
        </div>

        {/* Subtle line */}
        <div className="pt-6">
          <p className="text-xs text-neutral-500 font-mono tracking-wide">
            Useful utilities. Built for the web.
          </p>
        </div>
      </div>
    </section>
  );
};
