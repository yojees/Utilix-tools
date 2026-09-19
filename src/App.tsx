import React, { useState, useEffect } from 'react';
import { TOOLS } from './data/tools';
import { ToolCategory } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PopularTools } from './components/PopularTools';
import { ToolsDirectory } from './components/ToolsDirectory';
import { CategoriesSection } from './components/CategoriesSection';
import { PrivacySection } from './components/PrivacySection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ToolWorkspace } from './components/ToolWorkspace';
import { NotFoundPage } from './components/NotFoundPage';

export type AppRoute =
  | { type: 'home'; section?: string }
  | { type: 'tool'; toolId: string }
  | { type: '404'; path: string };

// Exact routing structure matching UTILIX specifications
const TOOL_PATH_MAP: Record<string, string> = {
  'image-compressor': 'image-compressor',
  'image-resizer': 'image-resizer',
  'image-converter': 'image-converter',
  'image-cropper': 'image-cropper',
  'pdf-compressor': 'pdf-compressor',
  'pdf-merger': 'pdf-merger',
  'pdf-splitter': 'pdf-splitter',
  'pdf-to-image': 'pdf-to-image',
  'pdf-to-images': 'pdf-to-image', // Plural alias support
  'images-to-pdf': 'images-to-pdf',
  'json-formatter': 'json-formatter',
  'password-generator': 'password-generator',
  'qr-generator': 'qr-generator',
  'color-extractor': 'color-extractor',
  'base64': 'base64-tool',
  'base64-tool': 'base64-tool',
  'uuid-generator': 'uuid-generator',
  'timestamp-converter': 'timestamp-converter',
  'text-counter': 'text-counter',
};

const SECTION_PATH_MAP: Record<string, string> = {
  'tools': 'tools-directory',
  'tools-directory': 'tools-directory',
  'categories': 'categories-section',
  'categories-section': 'categories-section',
  'about': 'about-section',
  'about-section': 'about-section',
  'contact': 'contact-section',
  'contact-section': 'contact-section',
  'privacy': 'privacy-section',
  'privacy-section': 'privacy-section',
};

/**
 * Pure route resolver based strictly on window.location.pathname.
 * Guaranteed: Root "/" ALWAYS resolves to { type: 'home' }.
 * Never automatically opens or redirects to any tool from "/".
 */
export const resolveCurrentRoute = (): AppRoute => {
  // Strip leading and trailing slashes from pathname
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();

  // Root domain: "/" or "" or "index.html" is ALWAYS strictly home
  if (!rawPath || rawPath === 'index.html') {
    // Clear any stale legacy hash from prior testing if present
    if (window.location.hash.includes('pdf-to-image') || window.location.hash.startsWith('#tool/')) {
      try {
        window.history.replaceState({}, '', '/');
      } catch {
        // Safe fallback
      }
    }
    return { type: 'home' };
  }

  // Section routes on homepage: /tools, /about, /contact, /categories, /privacy
  if (SECTION_PATH_MAP[rawPath]) {
    return { type: 'home', section: SECTION_PATH_MAP[rawPath] };
  }

  // Tool routes: /image-compressor, /pdf-to-image, /base64, etc.
  if (TOOL_PATH_MAP[rawPath]) {
    const canonicalToolId = TOOL_PATH_MAP[rawPath];
    const exists = TOOLS.some((t) => t.id === canonicalToolId);
    if (exists) {
      return { type: 'tool', toolId: canonicalToolId };
    }
  }

  // Unknown route: render 404 Not Found (NEVER redirect to a tool)
  return { type: '404', path: rawPath };
};

export default function App() {
  // Initial state MUST be home when on the root route
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    return resolveCurrentRoute();
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle browser Back and Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = resolveCurrentRoute();
      setCurrentRoute(route);

      if (route.type === 'home') {
        if (route.section) {
          setTimeout(() => {
            const el = document.getElementById(route.section!);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // On first load, if opened with a section like /about or /tools, scroll to it
  useEffect(() => {
    if (currentRoute.type === 'home' && currentRoute.section) {
      setTimeout(() => {
        const el = document.getElementById(currentRoute.section!);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Update dynamic document title based on active view
  useEffect(() => {
    if (currentRoute.type === 'tool') {
      const tool = TOOLS.find((t) => t.id === currentRoute.toolId);
      if (tool) {
        document.title = `${tool.name} — UTILIX`;
        return;
      }
    } else if (currentRoute.type === '404') {
      document.title = 'Page Not Found — UTILIX';
      return;
    }
    document.title = 'UTILIX — Simple Online Tools';
  }, [currentRoute]);

  // Global key listener for '/' search command palette
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !isSearchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isSearchOpen]);

  // Navigate directly to root homepage
  const handleNavigateHome = () => {
    setCurrentRoute({ type: 'home' });
    window.history.pushState({ type: 'home' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to an individual tool
  const handleSelectTool = (toolId: string) => {
    const urlSlug = toolId === 'base64-tool' ? 'base64' : toolId;
    setCurrentRoute({ type: 'tool', toolId });
    window.history.pushState({ type: 'tool', toolId }, '', `/${urlSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to tools directory on homepage
  const handleBackToTools = () => {
    setCurrentRoute({ type: 'home', section: 'tools-directory' });
    window.history.pushState({ type: 'home', section: 'tools-directory' }, '', '/tools');
    setTimeout(() => {
      document.getElementById('tools-directory')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Navigate to a homepage section
  const handleScrollToSection = (sectionId: string) => {
    const routeSlug = sectionId.replace('-section', '').replace('-directory', '');
    setCurrentRoute({ type: 'home', section: sectionId });
    window.history.pushState({ type: 'home', section: sectionId }, '', `/${routeSlug}`);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const activeTool =
    currentRoute.type === 'tool'
      ? TOOLS.find((t) => t.id === currentRoute.toolId)
      : null;

  return (
    <div id="utilix-app-root" className="min-h-screen flex flex-col bg-[#090a0c] text-[#f1f3f5]">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateHome={handleNavigateHome}
        onScrollToSection={handleScrollToSection}
        activeToolId={currentRoute.type === 'tool' ? currentRoute.toolId : null}
      />

      {/* Main View: Tool Workspace, 404 Page, or UTILIX Homepage */}
      <main className="flex-1">
        {currentRoute.type === '404' ? (
          <NotFoundPage
            onNavigateHome={handleNavigateHome}
            onExploreTools={() => handleScrollToSection('tools-directory')}
          />
        ) : activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            onBackToTools={handleBackToTools}
            onSelectTool={handleSelectTool}
          />
        ) : (
          <div className="space-y-4">
            {/* Hero Section */}
            <Hero
              onExploreTools={() => handleScrollToSection('tools-directory')}
              onViewCategories={() => handleScrollToSection('categories-section')}
            />

            {/* Popular Tools Showcase */}
            <PopularTools
              onSelectTool={handleSelectTool}
              onViewAllTools={() => handleScrollToSection('tools-directory')}
            />

            {/* Complete Tools Directory */}
            <ToolsDirectory
              onSelectTool={handleSelectTool}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Categorized Tools Overview */}
            <CategoriesSection onSelectTool={handleSelectTool} />

            {/* Client-Side Privacy Architecture */}
            <PrivacySection />

            {/* About UTILIX */}
            <AboutSection />

            {/* Dedicated Contact Us Section */}
            <ContactSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onNavigateHome={handleNavigateHome}
      />

      {/* Quick Search Palette */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
}
