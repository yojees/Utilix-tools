import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, Trash2, ArrowUp, ArrowDown, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface PdfFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export const PdfMerger: React.FC = () => {
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = async (newFiles: FileList | File[]) => {
    setError(null);
    const addedEntries: PdfFileEntry[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF documents are supported.');
        continue;
      }

      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        addedEntries.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          pageCount,
        });
      } catch {
        setError(`Could not read "${f.name}". It may be password-protected or corrupted.`);
      }
    }

    setFiles((prev) => [...prev, ...addedEntries]);
    setMergedPdfUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setMergedPdfUrl(null);
  };

  const moveDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setMergedPdfUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdfUrl(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const entry of files) {
        const bytes = await entry.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      setIsMerging(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while merging PDFs.';
      setError(message);
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = `merged-document-${Date.now()}.pdf`;
    a.click();
  };

  const totalPages = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);

  return (
    <div id="pdf-merger-root" className="w-full max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className="p-8 border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-2xl bg-neutral-950/40 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-300 mb-3">
          <Upload className="w-5 h-5 text-neutral-200" />
        </div>
        <p className="text-sm font-medium text-neutral-200">
          Upload PDFs to merge
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Select multiple files or drag them in here. Processed 100% locally.
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Files in Merge Order ({files.length} PDFs • {totalPages} Total Pages)
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 text-xs font-mono font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-200 truncate">{item.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {formatBytes(item.size)} • {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-opacity"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-opacity"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge & Download Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              Files are merged directly in your browser using WebAssembly.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!mergedPdfUrl ? (
                <button
                  id="btn-merge-pdfs"
                  onClick={mergePdfs}
                  disabled={files.length < 2 || isMerging}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isMerging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Merging Documents...
                    </>
                  ) : (
                    'Merge PDFs'
                  )}
                </button>
              ) : (
                <button
                  id="btn-download-merged-pdf"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-semibold text-sm hover:bg-emerald-300 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Merged PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
