import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, Check, ArrowRight } from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File is too large. Please select an image under 25MB.');
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  const compressImage = useCallback(async () => {
    if (!file || !previewUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for compression'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // If output is JPEG, fill background with white (since PNG transparency would turn black)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const targetQuality = outputFormat === 'image/png' ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Compression failed. Please try again.');
            setIsProcessing(false);
            return;
          }
          setCompressedBlob(blob);
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
          setIsProcessing(false);
        },
        outputFormat,
        targetQuality
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong while processing the image.';
      setError(message);
      setIsProcessing(false);
    }
  }, [file, previewUrl, quality, outputFormat]);

  useEffect(() => {
    if (file && previewUrl) {
      const timer = setTimeout(() => {
        compressImage();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [file, previewUrl, quality, outputFormat, compressImage]);

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const ext = outputFormat === 'image/webp' ? 'webp' : outputFormat === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const downloadLink = document.createElement('a');
    downloadLink.href = compressedUrl || '';
    downloadLink.download = `${baseName}-compressed.${ext}`;
    downloadLink.click();
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const percentReduction =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0;

  return (
    <div id="image-compressor-root" className="w-full max-w-4xl mx-auto space-y-6">
      {error && (
        <div id="compressor-error" className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {!file ? (
        <div
          id="dropzone-compressor"
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
            Click to upload or drag & drop an image
          </p>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Supports JPG, JPEG, PNG, and WebP (up to 25MB)
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Processed locally in your browser. Zero uploads.
          </div>
        </div>
      ) : (
        <div id="compressor-workspace" className="space-y-6">
          {/* Controls bar */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
              <div>
                <p className="text-sm font-semibold text-neutral-200 truncate max-w-xs sm:max-w-md">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Original size: {formatBytes(file.size)}</p>
              </div>
              <button
                id="btn-compressor-reset"
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
            </div>

            {/* Quality Slider & Presets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="quality-slider" className="text-sm font-medium text-neutral-300">
                  Compression Quality: <span className="text-white font-semibold">{quality}%</span>
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setQuality(85)}
                    className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                      quality === 85
                        ? 'border-neutral-400 bg-neutral-800 text-white font-medium'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-300'
                    }`}
                  >
                    High (85%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality(70)}
                    className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                      quality === 70
                        ? 'border-neutral-400 bg-neutral-800 text-white font-medium'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-300'
                    }`}
                  >
                    Balanced (70%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality(45)}
                    className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                      quality === 45
                        ? 'border-neutral-400 bg-neutral-800 text-white font-medium'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-300'
                    }`}
                  >
                    Max (45%)
                  </button>
                </div>
              </div>

              <input
                id="quality-slider"
                type="range"
                min="10"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-200"
              />
            </div>

            {/* Output format picker */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Output Format:</span>
                <div className="inline-flex rounded-lg border border-neutral-800 p-0.5 bg-neutral-950">
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
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/png')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      outputFormat === 'image/png' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    PNG
                  </button>
                </div>
              </div>

              {/* Status & Stats pill */}
              <div className="flex items-center gap-3">
                {isProcessing ? (
                  <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compressing...
                  </span>
                ) : compressedBlob ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-medium">
                      Result: <strong className="text-white">{formatBytes(compressedBlob.size)}</strong>
                    </span>
                    {percentReduction > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
                        -{percentReduction}%
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Comparison Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-neutral-300">Original Image</span>
                <span>{formatBytes(file.size)}</span>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-black/40 min-h-[260px] max-h-[380px] overflow-hidden">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original preview"
                    className="max-h-[320px] max-w-full object-contain rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-neutral-300">Compressed Preview</span>
                <span>{compressedBlob ? formatBytes(compressedBlob.size) : 'Processing...'}</span>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-black/40 min-h-[260px] max-h-[380px] overflow-hidden relative">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed result"
                    className="max-h-[320px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-neutral-500 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                    Generating preview...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Download bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span>{file.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-neutral-200 font-medium">
                {compressedBlob ? formatBytes(compressedBlob.size) : '...'} ({percentReduction}% saved)
              </span>
            </div>
            <button
              id="btn-download-compressed"
              onClick={handleDownload}
              disabled={!compressedBlob || isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Compressed Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
