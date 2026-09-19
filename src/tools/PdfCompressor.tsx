import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  FileArchive,
  ArrowRight,
  Info
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import {
  compressPdf,
  CompressionPreset,
  CompressionProgress,
  CompressionResult
} from '../utils/pdfCompressor';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface PdfInfo {
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  arrayBuffer: ArrayBuffer;
}

export const PdfCompressor: React.FC = () => {
  const [selectedPdf, setSelectedPdf] = useState<PdfInfo | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>('balanced');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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

  const cleanPreviousSession = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setResult(null);
    setProgress(null);
    setError(null);
  };

  const handleFileSelection = async (file: File) => {
    cleanPreviousSession();

    // Validate type
    const isPdfType =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfType) {
      setError('Please select a PDF file.');
      return;
    }

    // Validate empty file
    if (file.size === 0) {
      setError('The selected file is empty (0 bytes).');
      return;
    }

    // Validate max size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('The selected file exceeds the 50 MB limit. Please select a smaller PDF.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      // Read initial page count to display before compression
      let pageCount: number | undefined;
      try {
        const initialDoc = await PDFDocument.load(buffer, {
          ignoreEncryption: true,
          throwOnInvalidObject: false,
        });
        pageCount = initialDoc.getPageCount();
      } catch {
        // Page count might fail if PDF is strictly encrypted; compress step will handle
      }

      setSelectedPdf({
        file,
        name: file.name,
        size: file.size,
        pageCount,
        arrayBuffer: buffer,
      });
    } catch {
      setError("The selected file doesn't appear to be a valid PDF.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!selectedPdf) return;

    setIsCompressing(true);
    setError(null);
    setProgress({
      phase: 'analyzing',
      percentage: 5,
      message: 'Initializing compression engine...',
    });

    try {
      const compressionResult = await compressPdf(
        selectedPdf.arrayBuffer,
        preset,
        (p) => setProgress(p)
      );

      setResult(compressionResult);

      // Create blob download url
      const bufferToDownload = compressionResult.reduced
        ? compressionResult.outputBuffer
        : selectedPdf.arrayBuffer;

      const blob = new Blob([bufferToDownload], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Something went wrong while processing this PDF. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    cleanPreviousSession();
    setSelectedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCompressedDownloadName = (): string => {
    if (!selectedPdf) return 'document-compressed.pdf';
    const originalName = selectedPdf.name;
    const dotIndex = originalName.lastIndexOf('.');
    if (dotIndex > 0) {
      return `${originalName.substring(0, dotIndex)}-compressed.pdf`;
    }
    return `${originalName}-compressed.pdf`;
  };

  return (
    <div id="pdf-compressor-workspace" className="w-full max-w-3xl mx-auto space-y-8">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="pdf-upload-input"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
          }
        }}
      />

      {/* Error notification banner */}
      {error && (
        <div
          id="pdf-error-banner"
          className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-100">Notice</p>
            <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:text-red-200 underline font-medium ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: Upload Area (shown when no PDF selected or replacing) */}
      {!selectedPdf && (
        <div className="space-y-3">
          <div
            id="pdf-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-white bg-neutral-800/60 shadow-xl scale-[1.005]'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 hover:bg-neutral-900/70'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:scale-105 group-hover:border-neutral-700 transition-all shadow-inner">
              <Upload className="w-6 h-6 text-neutral-300 group-hover:text-white transition-colors" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white tracking-tight">
                Drop your PDF here
              </p>
              <p className="text-xs text-neutral-400">
                or <span className="text-white underline underline-offset-4 font-medium">choose a PDF</span> from your computer
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950/60 border border-neutral-800/80 text-[11px] font-mono text-neutral-400">
              <span>PDF documents only</span>
              <span className="w-1 h-1 rounded-full bg-neutral-700" />
              <span>Max 50 MB</span>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400/90 shrink-0" />
            <p>
              <strong className="text-neutral-300 font-medium">Processed in your browser</strong>
              {' — '}Your PDF is processed locally whenever supported. UTILIX does not require an account for this tool.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Before Compression - File overview card */}
      {selectedPdf && !result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Selected File Card */}
          <div
            id="pdf-selected-card"
            className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                <FileText className="w-5 h-5 text-neutral-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate" title={selectedPdf.name}>
                  {selectedPdf.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                  <span>{formatBytes(selectedPdf.size)}</span>
                  {selectedPdf.pageCount !== undefined && (
                    <>
                      <span className="text-neutral-600">•</span>
                      <span>
                        {selectedPdf.pageCount} {selectedPdf.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                id="btn-replace-pdf"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors disabled:opacity-50"
              >
                Replace PDF
              </button>
              <button
                id="btn-remove-pdf"
                onClick={handleReset}
                disabled={isCompressing}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-red-300 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Compression Settings Card */}
          <div
            id="pdf-compression-settings"
            className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Compression Level
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Low */}
              <button
                type="button"
                id="preset-low"
                disabled={isCompressing}
                onClick={() => setPreset('low')}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  preset === 'low'
                    ? 'bg-neutral-800/80 border-white/40 ring-1 ring-white/20'
                    : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">Low Compression</p>
                    {preset === 'low' && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-300 mt-0.5">Better quality</p>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Prioritizes maximum visual fidelity. Cleans up internal structures while preserving high-resolution graphics.
                  </p>
                </div>
              </button>

              {/* Option 2: Balanced (Default) */}
              <button
                type="button"
                id="preset-balanced"
                disabled={isCompressing}
                onClick={() => setPreset('balanced')}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  preset === 'balanced'
                    ? 'bg-neutral-800/80 border-white/40 ring-1 ring-white/20'
                    : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">Balanced</p>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-200 font-mono">
                        Default
                      </span>
                    </div>
                    {preset === 'balanced' && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-300 mt-0.5">Recommended</p>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Good compromise. Intelligently optimizes photographic streams and removes redundant metadata.
                  </p>
                </div>
              </button>

              {/* Option 3: High */}
              <button
                type="button"
                id="preset-high"
                disabled={isCompressing}
                onClick={() => setPreset('high')}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  preset === 'high'
                    ? 'bg-neutral-800/80 border-white/40 ring-1 ring-white/20'
                    : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">High Compression</p>
                    {preset === 'high' && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-300 mt-0.5">Smaller file</p>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Prioritizes smallest file size. Aggressively downsamples large bitmaps for email and web sharing.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Compress action button / progress bar */}
          <div className="space-y-3 pt-2">
            {!isCompressing ? (
              <button
                id="btn-compress-pdf"
                onClick={handleCompress}
                className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FileArchive className="w-4 h-4" />
                Compress PDF
              </button>
            ) : (
              <div
                id="compress-progress-container"
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-white text-sm font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-300" />
                  <span>Compressing PDF…</span>
                </div>

                {progress && (
                  <div className="space-y-2 max-w-md mx-auto">
                    <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
                      <div
                        className="bg-white h-1.5 transition-all duration-300 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">
                      {progress.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Result View */}
      {result && (
        <div id="pdf-result-card" className="space-y-6 animate-in fade-in">
          {result.reduced ? (
            /* SUCCESS REDUCTION RESULT */
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compression complete
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">
                    Your PDF is ready for download
                  </h3>
                  <p className="text-xs text-neutral-400">
                    File was optimized directly in your browser without uploading to any remote server.
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-neutral-400 hover:text-white underline font-medium shrink-0 pt-1"
                >
                  Compress another PDF
                </button>
              </div>

              {/* Stats Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    Original size
                  </p>
                  <p className="text-base sm:text-lg font-bold text-neutral-300 font-mono">
                    {formatBytes(result.originalSize)}
                  </p>
                </div>

                <div className="space-y-0.5 border-x border-neutral-800 px-3">
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    Compressed size
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white font-mono">
                    {formatBytes(result.compressedSize)}
                  </p>
                </div>

                <div className="space-y-0.5 pl-2">
                  <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                    Reduced
                  </p>
                  <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                    -{result.percentageSaved}%
                  </p>
                </div>
              </div>

              {/* Download Button */}
              {downloadUrl && (
                <a
                  id="btn-download-compressed-pdf"
                  href={downloadUrl}
                  download={getCompressedDownloadName()}
                  className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed PDF
                </a>
              )}
            </div>
          ) : (
            /* CANNOT BE REDUCED FURTHER RESULT */
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold">
                    <Info className="w-3.5 h-3.5 text-neutral-400" />
                    Document Analyzed
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">
                    This PDF could not be reduced further.
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-lg">
                    The PDF may already be optimized or contain content that cannot be reduced significantly without degrading vector text clarity.
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-neutral-400 hover:text-white underline font-medium shrink-0 pt-1"
                >
                  Try another PDF
                </button>
              </div>

              {/* Stats Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    Original size
                  </p>
                  <p className="text-base sm:text-lg font-bold text-neutral-300 font-mono">
                    {formatBytes(result.originalSize)}
                  </p>
                </div>

                <div className="space-y-0.5 border-l border-neutral-800 pl-4">
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="text-base sm:text-lg font-bold text-neutral-300">
                    Already Optimized
                  </p>
                </div>
              </div>

              {/* Provide Original PDF for download */}
              {downloadUrl && (
                <div className="space-y-2">
                  <a
                    id="btn-download-original-pdf"
                    href={downloadUrl}
                    download={selectedPdf?.name || 'document.pdf'}
                    className="w-full py-3.5 px-6 rounded-xl border border-neutral-700 bg-neutral-800 text-white font-bold text-sm hover:bg-neutral-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Original PDF
                  </a>
                  <p className="text-[11px] text-center text-neutral-500">
                    Your original document remains safe and unaltered.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Action to try another file */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Compress another PDF document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
