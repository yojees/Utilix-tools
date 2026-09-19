import React, { useState } from 'react';
import { Copy, Check, Trash2, FileText, Clock } from 'lucide-react';

const SAMPLE_TEXT = `UTILIX is a modern browser-based utility platform designed for students, developers, creators, and everyday users.

All computations and file operations are conducted strictly within your local browser sandbox. No telemetry, no unnecessary cloud processing, and zero privacy compromise.

With a minimal, high-contrast dark aesthetic, UTILIX focuses on raw utility, speed, and simplicity.`;

export const TextCounter: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  // Live statistical metrics
  const totalCharacters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;

  // Reading time (avg 200 words per minute)
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  // Speaking time (avg 130 words per minute)
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div id="text-counter-root" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Metric Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Characters</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{totalCharacters.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">No Spaces</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{charactersNoSpaces.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Words</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{words.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Lines</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{lines.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Paragraphs</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{paragraphs.toLocaleString()}</p>
        </div>
      </div>

      {/* Editor Box */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5" />
              Read time: ~{words > 0 ? `${readingTimeMinutes} min` : '0 min'}
            </span>
            <span className="hidden sm:inline-block text-neutral-500">•</span>
            <span className="hidden sm:inline-block">
              Speech time: ~{words > 0 ? `${speakingTimeMinutes} min` : '0 min'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Sample Text
            </button>
            <button
              id="btn-copy-text-counter"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          id="text-counter-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here..."
          className="w-full h-80 p-5 bg-neutral-950/90 text-neutral-100 text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 border-0"
        />
      </div>
    </div>
  );
};
