import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, Check, Lock, Unlock } from 'lucide-react';

interface Preset {
  name: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
];

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(1080);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [activePreset, setActivePreset] = useState<string>('custom');
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      setActivePreset('custom');
      generateResizedPreview(img.naturalWidth, img.naturalHeight, outputFormat, objectUrl);
    };
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    setActivePreset('custom');
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    setActivePreset('custom');
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.name);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
  };

  const generateResizedPreview = async (
    width: number,
    height: number,
    format: 'image/png' | 'image/jpeg' | 'image/webp',
    srcUrl?: string
  ) => {
    const url = srcUrl || previewUrl;
    if (!url || width <= 0 || height <= 0) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for resizing'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context unavailable');

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          if (resizedUrl) URL.revokeObjectURL(resizedUrl);
          const newUrl = URL.createObjectURL(blob);
          setResizedUrl(newUrl);
          setIsProcessing(false);
        },
        format,
        0.92
      );
    } catch {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (previewUrl && targetWidth > 0 && targetHeight > 0) {
      const timer = setTimeout(() => {
        generateResizedPreview(targetWidth, targetHeight, outputFormat);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetWidth, targetHeight, outputFormat]);

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const downloadLink = document.createElement('a');
    downloadLink.href = resizedUrl;
    downloadLink.download = `${baseName}-${targetWidth}x${targetHeight}.${ext}`;
    downloadLink.click();
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setFile(null);
    setPreviewUrl(null);
    setResizedUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="image-resizer-root" className="w-full max-w-4xl mx-auto space-y-6">
      {error && (
        <div id="resizer-error" className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {!file ? (
        <div
          id="dropzone-resizer"
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
            <Upload className="w-6 h-6 text-neutral-200" />
          </div>
          <p className="text-base font-medium text-neutral-200 text-center">
            Upload an image to resize
          </p>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Presets for Instagram, YouTube, LinkedIn, or fully custom dimensions
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Client-side canvas rendering. Zero uploads.
          </div>
        </div>
      ) : (
        <div id="resizer-workspace" className="space-y-6">
          {/* Controls Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
              <div>
                <p className="text-sm font-semibold text-neutral-200 truncate max-w-xs sm:max-w-md">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Original: {origWidth} × {origHeight} px
                </p>
              </div>
              <button
                id="btn-resizer-reset"
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Preset Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      activePreset === p.name
                        ? 'border-neutral-300 bg-neutral-800 text-white shadow-sm'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {p.name} ({p.width}×{p.height})
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setActivePreset('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activePreset === 'custom'
                      ? 'border-neutral-300 bg-neutral-800 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Dimension Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="target-width" className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Width (px)
                </label>
                <input
                  id="target-width"
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label htmlFor="target-height" className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Height (px)
                </label>
                <input
                  id="target-height"
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn-lock-aspect-ratio"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors w-full justify-center ${
                    lockAspectRatio
                      ? 'border-neutral-700 bg-neutral-800/80 text-neutral-200'
                      : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {lockAspectRatio ? 'Ratio Locked' : 'Ratio Free'}
                </button>
              </div>
            </div>

            {/* Output Format */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Output Format:</span>
                <div className="inline-flex rounded-lg border border-neutral-800 p-0.5 bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/png')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      outputFormat === 'image/png' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/jpeg')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      outputFormat === 'image/jpeg' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    JPG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/webp')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      outputFormat === 'image/webp' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    WebP
                  </button>
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                Target: <strong className="text-white font-mono">{targetWidth} × {targetHeight} px</strong>
              </div>
            </div>
          </div>

          {/* Preview Canvas Display */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-neutral-300">Live Preview</span>
              <span className="font-mono">{targetWidth} × {targetHeight} px</span>
            </div>
            <div className="p-6 flex items-center justify-center bg-black/50 min-h-[300px] max-h-[440px] overflow-hidden relative">
              {resizedUrl ? (
                <img
                  src={resizedUrl}
                  alt="Resized preview"
                  className="max-h-[380px] max-w-full object-contain rounded-lg border border-neutral-800"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                  Updating preview...
                </div>
              )}
            </div>
          </div>

          {/* Download Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
            <div className="text-xs text-neutral-400">
              Resizing to <span className="text-white font-medium">{targetWidth} × {targetHeight} px</span> ({outputFormat.split('/')[1].toUpperCase()})
            </div>
            <button
              id="btn-download-resized"
              onClick={handleDownload}
              disabled={!resizedUrl || isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Resized Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
