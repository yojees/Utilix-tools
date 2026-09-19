import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFArray,
  decodePDFRawStream
} from 'pdf-lib';

export type CompressionPreset = 'low' | 'balanced' | 'high';

export interface CompressionProgress {
  phase: 'analyzing' | 'images' | 'streams' | 'finalizing';
  percentage: number;
  message: string;
}

export interface CompressionResult {
  success: boolean;
  reduced: boolean;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  percentageSaved: number;
  pageCount: number;
  imagesOptimized: number;
  outputBuffer: ArrayBuffer;
  warning?: string;
  errorMessage?: string;
}

interface PresetSettings {
  maxDimension: number;
  jpegQuality: number;
  stripMetadata: boolean;
}

const PRESET_CONFIGS: Record<CompressionPreset, PresetSettings> = {
  low: {
    maxDimension: 2048,
    jpegQuality: 0.82,
    stripMetadata: false,
  },
  balanced: {
    maxDimension: 1400,
    jpegQuality: 0.65,
    stripMetadata: true,
  },
  high: {
    maxDimension: 950,
    jpegQuality: 0.45,
    stripMetadata: true,
  },
};

/**
 * Helper to yield control to browser UI event loop to avoid freezing
 */
const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Compress an HTML Image element onto an offscreen canvas
 */
async function compressImageElement(
  img: CanvasImageSource & { width: number; height: number; naturalWidth?: number; naturalHeight?: number },
  maxDimension: number,
  quality: number,
  allowDownscale: boolean
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth <= 0 || targetHeight <= 0) {
    return null;
  }

  if (allowDownscale && (targetWidth > maxDimension || targetHeight > maxDimension)) {
    const scale = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
    targetWidth = Math.max(1, Math.round(targetWidth * scale));
    targetHeight = Math.max(1, Math.round(targetHeight * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;

  // Fill with white background in case of transparent background when converting to JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) return null;

  const arrayBuffer = await blob.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Main compression engine for PDF files
 */
export async function compressPdf(
  inputBuffer: ArrayBuffer,
  preset: CompressionPreset = 'balanced',
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const originalSize = inputBuffer.byteLength;
  if (originalSize === 0) {
    throw new Error('The selected file is empty (0 bytes).');
  }

  const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS.balanced;

  onProgress?.({
    phase: 'analyzing',
    percentage: 10,
    message: 'Analyzing PDF structure and page catalog...',
  });
  await yieldToMain();

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(inputBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypt')) {
      throw new Error('This PDF is password-protected and cannot be compressed.');
    }
    throw new Error('The PDF file is corrupted and could not be read.');
  }

  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('The selected PDF contains no readable pages.');
  }

  onProgress?.({
    phase: 'analyzing',
    percentage: 25,
    message: `Discovered ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}. Scanning embedded assets...`,
  });
  await yieldToMain();

  // Find all indirect image XObjects
  const imageRefs: Array<{ ref: unknown; stream: PDFRawStream }> = [];
  try {
    for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
      if (obj instanceof PDFRawStream) {
        const dict = obj.dict;
        const subtype = dict.get(PDFName.of('Subtype'));
        if (subtype?.toString() === '/Image') {
          imageRefs.push({ ref, stream: obj });
        }
      }
    }
  } catch {
    // Continue if enumeration faces partial parsing errors
  }

  let imagesOptimized = 0;
  const totalImages = imageRefs.length;

  if (totalImages > 0 && typeof document !== 'undefined') {
    onProgress?.({
      phase: 'images',
      percentage: 35,
      message: `Found ${totalImages} embedded image ${totalImages === 1 ? 'asset' : 'assets'}. Optimizing...`,
    });
    await yieldToMain();

    for (let i = 0; i < totalImages; i++) {
      const { ref, stream } = imageRefs[i];
      const dict = stream.dict;

      // Check filters
      const filterObj = dict.get(PDFName.of('Filter'));
      let filterName = '';
      if (filterObj instanceof PDFName) {
        filterName = filterObj.asString();
      } else if (filterObj instanceof PDFArray) {
        filterName = filterObj.asArray().map((f) => f.toString()).join(' ');
      }

      const hasSmask = dict.has(PDFName.of('SMask'));
      const originalBytes = stream.getContents();
      const origLength = originalBytes.length;

      // Only attempt compression if image is larger than 12 KB
      if (origLength > 12 * 1024) {
        try {
          // Scenario A: DCTDecode (standard JPEG)
          if (filterName.includes('DCTDecode') || filterName.includes('DCT')) {
            const blob = new Blob([new Uint8Array(originalBytes) as unknown as BlobPart], {
              type: 'image/jpeg',
            });
            const url = URL.createObjectURL(blob);

            const img = new Image();
            const loadPromise = new Promise<boolean>((resolve) => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            });
            img.src = url;

            const loaded = await loadPromise;
            URL.revokeObjectURL(url);

            if (loaded) {
              // If image has SMask, preserve dimensions to avoid alpha misalignments
              const allowDownscale = !hasSmask;
              const compressed = await compressImageElement(
                img,
                config.maxDimension,
                config.jpegQuality,
                allowDownscale
              );

              if (compressed && compressed.bytes.length < origLength * 0.92) {
                // Meaningful reduction
                dict.set(PDFName.of('Width'), PDFNumber.of(compressed.width));
                dict.set(PDFName.of('Height'), PDFNumber.of(compressed.height));
                const updatedStream = PDFRawStream.of(dict, compressed.bytes);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pdfDoc.context.assign(ref as any, updatedStream);
                imagesOptimized++;
              }
            }
          } else if (
            (filterName.includes('FlateDecode') || !filterName) &&
            origLength > 60 * 1024
          ) {
            // Scenario B: Uncompressed / Flate raw RGB bitmap
            const colorSpaceObj = dict.get(PDFName.of('ColorSpace'));
            const csString = colorSpaceObj ? colorSpaceObj.toString() : '';
            const bpcObj = dict.get(PDFName.of('BitsPerComponent'));
            const bpc = bpcObj instanceof PDFNumber ? bpcObj.asNumber() : 8;
            const wObj = dict.get(PDFName.of('Width'));
            const hObj = dict.get(PDFName.of('Height'));
            const width = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
            const height = hObj instanceof PDFNumber ? hObj.asNumber() : 0;

            if (bpc === 8 && csString.includes('DeviceRGB') && width > 0 && height > 0) {
              try {
                const decoded = decodePDFRawStream(stream);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const decodedBytes = typeof (decoded as any).getBytes === 'function'
                  ? (decoded as any).getBytes()
                  : null;

                if (decodedBytes && decodedBytes.length === width * height * 3) {
                  const canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d', { alpha: false });
                  if (ctx) {
                    const imgData = ctx.createImageData(width, height);
                    for (
                      let p = 0, q = 0;
                      p < decodedBytes.length && q < imgData.data.length;
                      p += 3, q += 4
                    ) {
                      imgData.data[q] = decodedBytes[p];
                      imgData.data[q + 1] = decodedBytes[p + 1];
                      imgData.data[q + 2] = decodedBytes[p + 2];
                      imgData.data[q + 3] = 255;
                    }
                    ctx.putImageData(imgData, 0, 0);

                    const compressed = await compressImageElement(
                      canvas as unknown as HTMLImageElement,
                      config.maxDimension,
                      config.jpegQuality,
                      !hasSmask
                    );

                    if (compressed && compressed.bytes.length < origLength * 0.85) {
                      dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                      dict.delete(PDFName.of('DecodeParms'));
                      dict.set(PDFName.of('Width'), PDFNumber.of(compressed.width));
                      dict.set(PDFName.of('Height'), PDFNumber.of(compressed.height));
                      const updatedStream = PDFRawStream.of(dict, compressed.bytes);
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      pdfDoc.context.assign(ref as any, updatedStream);
                      imagesOptimized++;
                    }
                  }
                }
              } catch {
                // Ignore decoding issues on complex predictive filters
              }
            }
          }
        } catch {
          // If any single image fails, skip and keep original untouched
        }
      }

      // Progress reporting
      const pct = Math.round(35 + ((i + 1) / totalImages) * 45);
      onProgress?.({
        phase: 'images',
        percentage: pct,
        message: `Processed image asset ${i + 1} of ${totalImages}...`,
      });
      await yieldToMain();
    }
  }

  // Strip bloated metadata in balanced & high modes
  if (config.stripMetadata) {
    onProgress?.({
      phase: 'streams',
      percentage: 82,
      message: 'Removing bloated XMP tags & auxiliary metadata...',
    });
    await yieldToMain();

    try {
      const catalog = pdfDoc.catalog;
      catalog.delete(PDFName.of('Metadata'));
      catalog.delete(PDFName.of('PieceInfo'));
      catalog.delete(PDFName.of('Thumb'));
    } catch {
      // Continue if catalog properties are locked
    }
  }

  onProgress?.({
    phase: 'finalizing',
    percentage: 90,
    message: 'Repacking PDF into compressed object streams...',
  });
  await yieldToMain();

  // Save with useObjectStreams to compress PDF indirect objects into Deflate streams
  let outputBytes: Uint8Array;
  try {
    outputBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 40,
    });
  } catch {
    // Fallback save without object streams if file had custom structural quirks
    outputBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });
  }

  const compressedSize = outputBytes.byteLength;
  const isReduced = compressedSize < originalSize;
  const percentageSaved = isReduced
    ? Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
    : 0;
  const ratio = originalSize > 0 ? Number((compressedSize / originalSize).toFixed(3)) : 1;

  onProgress?.({
    phase: 'finalizing',
    percentage: 100,
    message: isReduced
      ? 'Compression complete'
      : 'Document analyzed: already optimized for size',
  });

  return {
    success: true,
    reduced: isReduced,
    originalSize,
    compressedSize,
    ratio,
    percentageSaved,
    pageCount,
    imagesOptimized,
    outputBuffer: outputBytes.buffer as ArrayBuffer,
  };
}
