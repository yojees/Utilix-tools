import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, FileText, Check, AlertCircle, RefreshCw, Scissors } from 'lucide-react';

export const PdfSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRangeStr, setPageRangeStr] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedPdfUrl, setExtractedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const count = pdfDoc.getPageCount();

      setFile(selectedFile);
      setPageCount(count);
      setPageRangeStr(count > 1 ? `1-${Math.min(count, 3)}` : '1');
      setExtractedPdfUrl(null);
    } catch {
      setError('Could not read PDF. It might be password-protected or encrypted.');
    }
  };

  const parsePageIndices = (rangeStr: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(maxPages, Math.max(start, end));
          for (let i = from; i <= to; i++) {
            indices.add(i - 1); // 0-indexed
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const extractPages = async () => {
    if (!file) return;

    const indices = parsePageIndices(pageRangeStr, pageCount);
    if (indices.length === 0) {
      setError(`Please specify valid pages between 1 and ${pageCount}.`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setExtractedPdfUrl(url);
      setIsProcessing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to extract pages from PDF.';
      setError(message);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!extractedPdfUrl || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = extractedPdfUrl;
    a.download = `${baseName}-extracted-pages.pdf`;
    a.click();
  };

  const handleReset = () => {
    if (extractedPdfUrl) URL.revokeObjectURL(extractedPdfUrl);
    setFile(null);
    setPageCount(0);
    setExtractedPdfUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="pdf-splitter-root" className="w-full max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          className="p-12 border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-2xl bg-neutral-950/40 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-300 mb-4 shadow-sm">
            <Scissors className="w-6 h-6 text-neutral-200" />
          </div>
          <p className="text-base font-medium text-neutral-200">
            Upload a PDF document to split or extract pages
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Extract single pages or custom ranges without uploading to a server.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-neutral-400" />
              <div>
                <p className="text-sm font-semibold text-neutral-200 truncate max-w-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Total document pages: <span className="text-white font-mono font-bold">{pageCount}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Choose Another File
            </button>
          </div>

          {/* Range Selection Form */}
          <div className="space-y-3">
            <label htmlFor="page-range-input" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Pages to Extract
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                id="page-range-input"
                type="text"
                value={pageRangeStr}
                onChange={(e) => setPageRangeStr(e.target.value)}
                placeholder="e.g. 1-3, 5, 8"
                className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-100 focus:outline-none focus:border-neutral-400"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageRangeStr(`1`)}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-400 hover:text-white"
                >
                  Page 1
                </button>
                {pageCount > 1 && (
                  <button
                    type="button"
                    onClick={() => setPageRangeStr(`1-${pageCount}`)}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-400 hover:text-white"
                  >
                    All Pages
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Format: individual numbers (e.g. <strong>1, 3, 5</strong>) or ranges (e.g. <strong>2-4</strong>).
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400">
              Selected pages will be bundled into a new standalone PDF file.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!extractedPdfUrl ? (
                <button
                  id="btn-split-pdf"
                  onClick={extractPages}
                  disabled={isProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 shadow-sm"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Extracting Pages...
                    </>
                  ) : (
                    'Extract Pages'
                  )}
                </button>
              ) : (
                <button
                  id="btn-download-split-pdf"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-semibold text-sm hover:bg-emerald-300 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Extracted PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
