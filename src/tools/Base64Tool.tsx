import React, { useState } from 'react';
import { Copy, Check, Trash2, ArrowRightLeft, AlertCircle, Binary } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('Hello from UTILIX! Simple tools. Zero hassle.');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Unicode safe Base64 encoder
  const utf8ToBase64 = (str: string): string => {
    return window.btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  };

  // Unicode safe Base64 decoder
  const base64ToUtf8 = (str: string): string => {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(str.trim()), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  };

  const handleConvert = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = utf8ToBase64(input);
        setOutput(encoded);
      } else {
        const decoded = base64ToUtf8(input);
        setOutput(decoded);
      }
    } catch {
      setError(
        mode === 'decode'
          ? 'Invalid Base64 string. Please verify the input characters and padding.'
          : 'Failed to encode input into Base64.'
      );
    }
  };

  // Run on mount or mode switch
  React.useEffect(() => {
    handleConvert();
  }, [mode, input]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleSwap = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInput(output);
    setOutput('');
    setError(null);
  };

  return (
    <div id="base64-tool-root" className="w-full max-w-4xl mx-auto space-y-5">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm">
        <div className="inline-flex rounded-xl border border-neutral-800 p-1 bg-neutral-950">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'encode' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Encode to Base64
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'decode' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Decode from Base64
          </button>
        </div>

        <div className="flex items-center gap-2">
          {output && (
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Input/Output
            </button>
          )}
          <button
            onClick={handleClear}
            className="p-1.5 rounded-xl border border-neutral-800 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input area */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">
            {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
          </span>
          <span className="font-mono text-[11px] text-neutral-500">{input.length} characters</span>
        </div>
        <textarea
          id="base64-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
          className="w-full h-36 p-4 bg-neutral-950/90 text-neutral-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 border-0"
          spellCheck={false}
        />
      </div>

      {/* Output area */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">
            {mode === 'encode' ? 'Base64 Encoded Result' : 'Plain Text Decoded Result'}
          </span>
          <span className="font-mono text-[11px] text-neutral-500">{output.length} characters</span>
        </div>
        <textarea
          id="base64-output"
          value={output}
          readOnly
          placeholder="Result will appear here..."
          className="w-full h-36 p-4 bg-neutral-950/90 text-neutral-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 border-0 selection:bg-neutral-800"
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
        <p className="text-xs text-neutral-400">
          Full UTF-8 Unicode supported. Zero data sent to servers.
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-copy-base64"
            onClick={handleCopy}
            disabled={!output}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Output'}
          </button>
        </div>
      </div>
    </div>
  );
};
