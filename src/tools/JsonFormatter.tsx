import React, { useState } from 'react';
import { Copy, Check, Trash2, AlertCircle, CheckCircle2, Braces, Minimize2 } from 'lucide-react';

const SAMPLE_JSON = `{
  "app": "UTILIX",
  "version": "1.0.0",
  "platform": "web",
  "privacy": "client-side-only",
  "tools": [
    {
      "id": "json-formatter",
      "category": "developer",
      "enabled": true
    },
    {
      "id": "image-compressor",
      "category": "images",
      "enabled": true
    }
  ],
  "settings": {
    "theme": "dark",
    "offlineReady": true
  }
}`;

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
    line?: number;
    column?: number;
  }>({ status: 'idle' });
  const [copied, setCopied] = useState<boolean>(false);

  const getLineAndColumn = (json: string, pos: number) => {
    const lines = json.substring(0, pos).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  };

  const handleFormat = (spaces: number = indentSize) => {
    if (!inputJson.trim()) {
      setOutputJson('');
      setValidationState({ status: 'idle' });
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutputJson(formatted);
      setValidationState({ status: 'valid', message: 'Valid JSON payload' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format';
      // Attempt to extract position
      const match = message.match(/position (\d+)/i);
      let line: number | undefined;
      let col: number | undefined;
      if (match && match[1]) {
        const pos = parseInt(match[1], 10);
        const coords = getLineAndColumn(inputJson, pos);
        line = coords.line;
        col = coords.column;
      }
      setValidationState({
        status: 'invalid',
        message,
        line,
        column: col
      });
    }
  };

  const handleMinify = () => {
    if (!inputJson.trim()) return;
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setValidationState({ status: 'valid', message: 'Successfully minified' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format';
      setValidationState({ status: 'invalid', message });
    }
  };

  const handleValidate = () => {
    if (!inputJson.trim()) {
      setValidationState({ status: 'idle' });
      return;
    }
    try {
      JSON.parse(inputJson);
      setValidationState({ status: 'valid', message: 'JSON is 100% valid' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format';
      setValidationState({ status: 'invalid', message });
    }
  };

  const handleCopy = async () => {
    const textToCopy = outputJson || inputJson;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    setValidationState({ status: 'idle' });
  };

  return (
    <div id="json-formatter-root" className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-format-json"
            onClick={() => handleFormat(indentSize)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-sm"
          >
            <Braces className="w-3.5 h-3.5" />
            Format
          </button>
          <button
            id="btn-minify-json"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 font-medium text-xs hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify
          </button>
          <button
            id="btn-validate-json"
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 font-medium text-xs hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Validate
          </button>
          <button
            id="btn-sample-json"
            onClick={() => {
              setInputJson(SAMPLE_JSON);
              setOutputJson('');
              setValidationState({ status: 'idle' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 text-neutral-400 font-medium text-xs hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            Load Sample
          </button>

          {/* Indent selector */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-neutral-800">
            <span className="text-[11px] text-neutral-500 mr-1">Indent:</span>
            {[2, 4].map((sp) => (
              <button
                key={sp}
                onClick={() => {
                  setIndentSize(sp);
                  handleFormat(sp);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  indentSize === sp
                    ? 'border-neutral-500 bg-neutral-800 text-white'
                    : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {sp}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInputJson(SAMPLE_JSON);
              handleFormat();
            }}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Sample
          </button>
          <button
            id="btn-copy-formatted-json"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 font-medium text-xs hover:bg-neutral-800 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Output'}
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-neutral-800 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Validation status notification */}
      {validationState.status === 'valid' && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{validationState.message}</span>
        </div>
      )}

      {validationState.status === 'invalid' && (
        <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Syntax Error</p>
            <p className="text-red-300 mt-0.5">{validationState.message}</p>
            {validationState.line && (
              <p className="text-red-400/80 text-[11px] mt-1">
                Line: {validationState.line}, Column: {validationState.column}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two panels layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Panel: Input Editor */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">Input JSON</span>
            <span className="font-mono text-[11px] text-neutral-500">
              {inputJson.length} chars
            </span>
          </div>
          <textarea
            id="json-input-editor"
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste your raw JSON string here..."
            className="w-full h-80 md:h-[440px] p-4 bg-neutral-950/90 text-neutral-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 border-0"
            spellCheck={false}
          />
        </div>

        {/* Right Panel: Formatted Output */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">Formatted Output</span>
            <span className="font-mono text-[11px] text-neutral-500">
              {outputJson ? `${outputJson.length} chars` : 'Ready'}
            </span>
          </div>
          <textarea
            id="json-output-editor"
            value={outputJson}
            readOnly
            placeholder="Formatted or minified output will appear here..."
            className="w-full h-80 md:h-[440px] p-4 bg-neutral-950/90 text-neutral-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 border-0 selection:bg-neutral-800"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
