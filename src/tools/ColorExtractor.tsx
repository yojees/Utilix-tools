import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, RefreshCw, AlertCircle, Palette } from 'lucide-react';

interface ExtractedColor {
  hex: string;
  rgb: string;
  count: number;
}

export const ColorExtractor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    extractColors(objectUrl);
  };

  const extractColors = (url: string) => {
    setIsProcessing(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not access canvas context');

        // Scale down image for fast analysis
        const sampleWidth = 100;
        const sampleHeight = Math.round((img.naturalHeight / img.naturalWidth) * 100) || 100;
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imageData.data;

        // Group pixels by quantizing RGB channels (step by 24 to bin similar shades)
        const binSize = 24;
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // skip transparent pixels

          const r = Math.round(data[i] / binSize) * binSize;
          const g = Math.round(data[i + 1] / binSize) * binSize;
          const b = Math.round(data[i + 2] / binSize) * binSize;

          const key = `${r},${g},${b}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = { r, g, b, count: 0 };
          }
          colorBuckets[key].count++;
        }

        const sorted = Object.values(colorBuckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
          .map((c) => {
            const clampedR = Math.min(255, c.r);
            const clampedG = Math.min(255, c.g);
            const clampedB = Math.min(255, c.b);
            return {
              hex: rgbToHex(clampedR, clampedG, clampedB).toUpperCase(),
              rgb: `rgb(${clampedR}, ${clampedG}, ${clampedB})`,
              count: c.count
            };
          });

        setColors(sorted);
        setIsProcessing(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error extracting colors from image.';
        setError(message);
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError('Failed to process image pixels.');
      setIsProcessing(false);
    };
  };

  const handleCopy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setColors([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="color-extractor-root" className="w-full max-w-4xl mx-auto space-y-6">
      {error && (
        <div id="extractor-error" className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {!file ? (
        <div
          id="dropzone-color-extractor"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-neutral-400 bg-neutral-900/60'
              : 'border-neutral-800 hover:border-neutral-600 bg-neutral-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 mb-4 shadow-sm">
            <Palette className="w-6 h-6 text-neutral-200" />
          </div>
          <p className="text-base font-medium text-neutral-200 text-center">
            Upload an image to extract its color palette
          </p>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Extracts dominant shades, HEX codes, and RGB values locally
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Fast canvas pixel analysis. Zero uploads.
          </div>
        </div>
      ) : (
        <div id="extractor-workspace" className="space-y-6">
          {/* Header bar */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Active Image: <span className="text-neutral-200 font-medium normal-case truncate max-w-xs inline-block align-bottom">{file.name}</span>
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Preview */}
            <div className="md:col-span-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-800/80 text-xs text-neutral-400 font-medium">
                Source Image
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-black/50 min-h-[260px]">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Analyzed preview"
                    className="max-h-[280px] max-w-full object-contain rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Extracted Colors Grid */}
            <div className="md:col-span-7 space-y-4">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Extracted Palette ({colors.length} Dominant Colors)
              </div>

              {isProcessing ? (
                <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex items-center justify-center text-xs text-neutral-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing pixel clusters...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colors.map((color) => {
                    const isCopied = copiedHex === color.hex;
                    return (
                      <div
                        key={color.hex}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg border border-neutral-700/60 shadow-inner"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <p className="text-xs font-mono font-semibold text-neutral-100">{color.hex}</p>
                            <p className="text-[11px] font-mono text-neutral-500">{color.rgb}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(color.hex)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            isCopied
                              ? 'border-emerald-800 bg-emerald-950/60 text-emerald-400'
                              : 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {isCopied ? 'Copied' : 'Copy HEX'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
