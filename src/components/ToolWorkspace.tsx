import React, { useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ToolItem } from '../types';
import { TOOLS } from '../data/tools';
import { ToolIcon } from './ToolIcon';

const ImageCompressor = lazy(() => import('../tools/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const ImageResizer = lazy(() => import('../tools/ImageResizer').then(m => ({ default: m.ImageResizer })));
const QrGenerator = lazy(() => import('../tools/QrGenerator').then(m => ({ default: m.QrGenerator })));
const JsonFormatter = lazy(() => import('../tools/JsonFormatter').then(m => ({ default: m.JsonFormatter })));
const PasswordGenerator = lazy(() => import('../tools/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));
const ColorExtractor = lazy(() => import('../tools/ColorExtractor').then(m => ({ default: m.ColorExtractor })));
const Base64Tool = lazy(() => import('../tools/Base64Tool').then(m => ({ default: m.Base64Tool })));
const UuidGenerator = lazy(() => import('../tools/UuidGenerator').then(m => ({ default: m.UuidGenerator })));
const TimestampConverter = lazy(() => import('../tools/TimestampConverter').then(m => ({ default: m.TimestampConverter })));
const TextCounter = lazy(() => import('../tools/TextCounter').then(m => ({ default: m.TextCounter })));
const PdfMerger = lazy(() => import('../tools/PdfMerger').then(m => ({ default: m.PdfMerger })));
const PdfSplitter = lazy(() => import('../tools/PdfSplitter').then(m => ({ default: m.PdfSplitter })));
const PdfCompressor = lazy(() => import('../tools/PdfCompressor').then(m => ({ default: m.PdfCompressor })));

const ToolLoadingFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-400">
    <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
    <p className="text-xs font-mono text-neutral-500">Loading tool engine...</p>
  </div>
);

interface ToolWorkspaceProps {
  tool: ToolItem;
  onBackToTools: () => void;
  onSelectTool: (toolId: string) => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  onBackToTools,
  onSelectTool,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tool.id]);

  const relatedTools = TOOLS.filter((t) => tool.relatedToolIds.includes(t.id));

  const renderToolComponent = () => {
    return (
      <Suspense fallback={<ToolLoadingFallback />}>
        {(() => {
          switch (tool.id) {
            case 'image-compressor':
              return <ImageCompressor />;
            case 'image-resizer':
              return <ImageResizer />;
            case 'qr-generator':
              return <QrGenerator />;
            case 'json-formatter':
              return <JsonFormatter />;
            case 'password-generator':
              return <PasswordGenerator />;
            case 'color-extractor':
              return <ColorExtractor />;
            case 'base64-tool':
              return <Base64Tool />;
            case 'uuid-generator':
              return <UuidGenerator />;
            case 'timestamp-converter':
              return <TimestampConverter />;
            case 'text-counter':
              return <TextCounter />;
            case 'pdf-merger':
              return <PdfMerger />;
            case 'pdf-splitter':
              return <PdfSplitter />;
            case 'pdf-compressor':
              return <PdfCompressor />;
            default:
              return (
                <div className="p-10 md:p-14 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-4 max-w-xl mx-auto my-6">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300">
                    <ToolIcon name={tool.iconName} className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
                      <span>In Active Development</span>
                    </div>
                    <h3 className="text-base font-bold text-white font-mono">{tool.name}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                      {tool.description} This browser-local utility is currently being tuned for release.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onBackToTools}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-medium text-white transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Back to Tools Directory</span>
                    </button>
                  </div>
                </div>
              );
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div id="tool-workspace-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-tools"
            onClick={onBackToTools}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Tools
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono capitalize bg-neutral-900 border border-neutral-800 text-neutral-400">
              {tool.category}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Client Only
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200 shrink-0 shadow-sm mt-0.5">
            <ToolIcon name={tool.iconName} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 mt-1 max-w-2xl">
              {tool.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tool Functional Workspace */}
      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-xl">
        {renderToolComponent()}
      </div>

      {/* How it works */}
      {tool.howItWorks && tool.howItWorks.length > 0 && (
        <section className="pt-6 border-t border-neutral-900 space-y-5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.howItWorks.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-neutral-400">
                  0{idx + 1}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="pt-6 border-t border-neutral-900 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Related tools
            </h2>
            <button
              onClick={onBackToTools}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              All tools →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectTool(rel.id)}
                className="group p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 transition-all flex flex-col justify-between hover:bg-neutral-900/80 hover:border-neutral-700 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:border-neutral-600 transition-colors">
                      <ToolIcon name={rel.iconName} className="w-4 h-4" />
                    </div>
                    {rel.isComingSoon && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800/90 border border-neutral-700/60 text-neutral-400 font-mono">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {rel.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
                  <span className="capitalize font-mono">{rel.category}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
