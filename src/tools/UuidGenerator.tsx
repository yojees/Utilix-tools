import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Download, Fingerprint } from 'lucide-react';

export const UuidGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(1);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [noHyphens, setNoHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>(() => [crypto.randomUUID()]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const generateUuids = (qty = count) => {
    const list: string[] = [];
    for (let i = 0; i < qty; i++) {
      let id: string = crypto.randomUUID();
      if (noHyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  };

  const handleCopySingle = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="uuid-generator-root" className="w-full max-w-2xl mx-auto space-y-6">
      {/* Primary Generator Display */}
      {uuids.length === 1 ? (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Generated UUID v4
            </span>
            <span className="text-xs text-neutral-500 font-mono">RFC 4122 Compliant</span>
          </div>

          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="w-full font-mono text-base md:text-lg text-neutral-100 select-all truncate">
              {uuids[0]}
            </span>
            <button
              id="btn-copy-single-uuid"
              onClick={() => handleCopySingle(uuids[0], 0)}
              className="shrink-0 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors"
              title="Copy UUID"
            >
              {copiedIndex === 0 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              id="btn-refresh-uuid"
              onClick={() => generateUuids(1)}
              className="shrink-0 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors"
              title="Generate new"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Generated UUIDs ({uuids.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? 'Copied All' : 'Copy All'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
                title="Download as .txt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {uuids.map((id, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/70 font-mono text-xs text-neutral-200 hover:border-neutral-700 transition-colors group"
              >
                <span className="select-all truncate mr-2">{id}</span>
                <button
                  onClick={() => handleCopySingle(id, index)}
                  className="opacity-60 group-hover:opacity-100 p-1 hover:text-white transition-opacity"
                  title="Copy"
                >
                  {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Options */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-5">
        {/* Quantity selector */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Generate Quantity
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 5, 10, 25, 50].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => {
                  setCount(qty);
                  generateUuids(qty);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  count === qty
                    ? 'border-neutral-400 bg-neutral-800 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {qty} {qty === 1 ? 'UUID' : 'UUIDs'}
              </button>
            ))}
          </div>
        </div>

        {/* Formatting Toggles */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-neutral-800/80">
          <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => {
                setUppercase(e.target.checked);
                setUuids((prev) =>
                  prev.map((id) => (e.target.checked ? id.toUpperCase() : id.toLowerCase()))
                );
              }}
              className="w-4 h-4 rounded border-neutral-700 accent-neutral-200"
            />
            Uppercase
          </label>

          <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={noHyphens}
              onChange={(e) => {
                setNoHyphens(e.target.checked);
                setUuids((prev) =>
                  prev.map((id) => (e.target.checked ? id.replace(/-/g, '') : id))
                );
              }}
              className="w-4 h-4 rounded border-neutral-700 accent-neutral-200"
            />
            Remove Hyphens
          </label>
        </div>

        {/* Big Generate Button */}
        <button
          id="btn-generate-uuids-action"
          onClick={() => generateUuids(count)}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Generate New {count > 1 ? `${count} UUIDs` : 'UUID'}
        </button>
      </div>
    </div>
  );
};
