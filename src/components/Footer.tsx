import React from 'react';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection, onNavigateHome }) => {
  return (
    <footer className="border-t border-neutral-900 bg-[#090a0c] text-neutral-400 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="space-y-1">
            <button
              onClick={onNavigateHome}
              className="text-lg font-bold text-white font-mono tracking-tight hover:text-neutral-200 transition-colors"
            >
              UTILIX
            </button>
            <p className="text-xs text-neutral-500">
              Simple tools. Zero hassle.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <button
              onClick={() => onScrollToSection('tools-directory')}
              className="hover:text-white transition-colors"
            >
              Tools
            </button>
            <button
              onClick={() => onScrollToSection('categories-section')}
              className="hover:text-white transition-colors"
            >
              Categories
            </button>
            <button
              onClick={() => onScrollToSection('about-section')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => onScrollToSection('contact-section')}
              className="hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => onScrollToSection('privacy-section')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
          <p>© 2026 UTILIX</p>
          <p className="text-neutral-500">Fast, simple browser-based tools</p>
        </div>
      </div>
    </footer>
  );
};
