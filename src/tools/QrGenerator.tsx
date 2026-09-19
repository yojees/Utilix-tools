import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';

export const QrGenerator: React.FC = () => {
  const [text, setText] = useState<string>('https://utilix.app');
  const [size, setSize] = useState<number>(300);
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#000000');
  const [includeMargin, setIncludeMargin] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQr();
  }, [text, size, fgColor, bgColor, includeMargin]);

  const generateQr = async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      setError(null);
      return;
    }

    try {
      setError(null);
      const options: QRCode.QRCodeToDataURLOptions = {
        width: size,
        margin: includeMargin ? 2 : 0,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      };

      const url = await QRCode.toDataURL(text, options);
      setQrDataUrl(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(message);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `utilix-qr-${Date.now()}.png`;
    link.click();
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const u8arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8arr[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const blob = dataUrlToBlob(qrDataUrl);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy text
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const setSample = (sampleText: string) => {
    setText(sampleText);
  };

  return (
    <div id="qr-generator-root" className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Input & Controls */}
        <div className="md:col-span-7 space-y-5">
          {/* Input text field */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="qr-input-text" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                QR Code Content
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSample('https://github.com')}
                  className="text-[11px] px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => setSample('WIFI:S:MyNetwork;T:WPA;P:SecretPassword123;;')}
                  className="text-[11px] px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Wi-Fi
                </button>
              </div>
            </div>

            <textarea
              id="qr-input-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, phone number, or credentials..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-400 resize-none font-mono"
            />
          </div>

          {/* Customization Options */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-5">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Appearance & Colors
            </div>

            {/* Size selection */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Output Resolution</span>
                <span className="text-white font-mono">{size} × {size} px</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[180, 256, 384, 512].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      size === s
                        ? 'border-neutral-300 bg-neutral-800 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Foreground Color</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-neutral-200 uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Background Color</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-neutral-200 uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Themes */}
            <div>
              <span className="block text-xs text-neutral-400 mb-2 font-medium">Color Presets</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setFgColor('#ffffff'); setBgColor('#000000'); }}
                  className="px-2.5 py-1 rounded-md text-xs border border-neutral-800 hover:border-neutral-600 bg-black text-white"
                >
                  Dark Contrast
                </button>
                <button
                  type="button"
                  onClick={() => { setFgColor('#000000'); setBgColor('#ffffff'); }}
                  className="px-2.5 py-1 rounded-md text-xs border border-neutral-800 hover:border-neutral-600 bg-white text-black"
                >
                  Light Classic
                </button>
                <button
                  type="button"
                  onClick={() => { setFgColor('#0ea5e9'); setBgColor('#030712'); }}
                  className="px-2.5 py-1 rounded-md text-xs border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-sky-400"
                >
                  Sky Blue
                </button>
                <button
                  type="button"
                  onClick={() => { setFgColor('#10b981'); setBgColor('#022c22'); }}
                  className="px-2.5 py-1 rounded-md text-xs border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-emerald-400"
                >
                  Emerald
                </button>
              </div>
            </div>

            {/* Margin toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
              <span className="text-xs text-neutral-300">Quiet Zone Margin</span>
              <button
                type="button"
                onClick={() => setIncludeMargin(!includeMargin)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  includeMargin ? 'bg-neutral-200' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-neutral-950 transition-transform absolute top-1 ${
                    includeMargin ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Live Preview & Action */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm flex-1 flex flex-col items-center justify-center min-h-[340px]">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 self-start">
              Live Preview
            </div>

            {error ? (
              <div className="text-xs text-red-400 text-center p-4">
                {error}
              </div>
            ) : qrDataUrl ? (
              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/80 flex items-center justify-center shadow-lg">
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="max-w-[220px] max-h-[220px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="text-xs text-neutral-500 text-center">
                Enter text or URL to generate QR code
              </div>
            )}

            {text && (
              <p className="text-[11px] text-neutral-500 mt-4 text-center truncate max-w-[260px] font-mono">
                {text}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              id="btn-download-qr"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
            <button
              id="btn-copy-qr"
              onClick={handleCopy}
              disabled={!qrDataUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 font-medium text-sm hover:bg-neutral-800/60 hover:text-white transition-colors disabled:opacity-40"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
