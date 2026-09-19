import React, { useState } from 'react';
import { Search, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onScrollToSection: (sectionId: string) => void;
  activeToolId: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onNavigateHome,
  onScrollToSection,
  activeToolId,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(sectionId);
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    onNavigateHome();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#090a0c]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <button
            id="nav-brand-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold text-sm tracking-wider font-mono shadow-sm group-hover:bg-neutral-200 transition-colors">
              UX
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white font-mono">
                UTILIX
              </span>
              <span className="hidden sm:inline-block text-[11px] text-neutral-500 ml-2 font-normal">
                Zero hassle
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-400">
            <button
              onClick={() => handleNavClick('tools-directory')}
              className="hover:text-white transition-colors"
            >
              Tools
            </button>
            <button
              onClick={() => handleNavClick('categories-section')}
              className="hover:text-white transition-colors"
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('about-section')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact-section')}
              className="hover:text-white transition-colors"
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Right side: Search, Badge, Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="nav-search-button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-medium transition-all group shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-200" />
            <span className="hidden sm:inline">Search Tools</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-950 border border-neutral-800 text-neutral-500">
              /
            </kbd>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-800/80 bg-neutral-900/40 text-[11px] text-neutral-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Browser Only</span>
          </div>

          {/* Mobile hamburger button */}
          <button
            id="btn-mobile-nav-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800/80 bg-[#090a0c]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <button
            onClick={() => handleNavClick('tools-directory')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Tools
          </button>
          <button
            onClick={() => handleNavClick('categories-section')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('about-section')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact-section')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
};
