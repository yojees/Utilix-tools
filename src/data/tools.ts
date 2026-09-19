import { ToolItem } from '../types';

export const TOOLS: ToolItem[] = [
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size while maintaining visual quality.',
    category: 'images',
    iconName: 'ImageDown',
    popular: true,
    badge: 'Browser Local',
    howItWorks: [
      'Upload any JPG, PNG, or WebP image via drag & drop or file selection.',
      'Adjust the compression quality slider or select a quick compression preset.',
      'Instantly compare original vs compressed size and download the optimized file.'
    ],
    relatedToolIds: ['image-resizer', 'color-extractor', 'base64-tool']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to custom dimensions or social media presets.',
    category: 'images',
    iconName: 'Maximize2',
    popular: true,
    badge: 'Browser Local',
    howItWorks: [
      'Choose an image file from your device.',
      'Select a popular social preset (Instagram, YouTube, LinkedIn) or enter custom dimensions.',
      'Optionally lock aspect ratio and pick an output format (PNG, JPEG, WebP) before downloading.'
    ],
    relatedToolIds: ['image-compressor', 'color-extractor', 'qr-generator']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images seamlessly between PNG, JPG, WebP, AVIF, and GIF.',
    category: 'images',
    iconName: 'RefreshCw',
    popular: false,
    isComingSoon: true,
    badge: 'Coming Soon',
    howItWorks: [
      'Select any image file from your device.',
      'Choose your desired target format: PNG, JPEG, WebP, or AVIF.',
      'Convert in the browser with custom compression and download.'
    ],
    relatedToolIds: ['image-compressor', 'image-resizer', 'image-cropper']
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop and frame images to standard aspect ratios or freeform crops.',
    category: 'images',
    iconName: 'Crop',
    popular: false,
    isComingSoon: true,
    badge: 'Coming Soon',
    howItWorks: [
      'Upload an image to open the visual cropping canvas.',
      'Select a preset ratio (1:1, 16:9, 4:3, 9:16) or adjust crop handles freely.',
      'Export the cropped area directly to PNG or JPG.'
    ],
    relatedToolIds: ['image-resizer', 'image-compressor', 'image-converter']
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Create customizable QR codes from any text or URL.',
    category: 'utilities',
    iconName: 'QrCode',
    popular: true,
    badge: 'Instant',
    howItWorks: [
      'Type or paste any URL, text, contact info, or Wi-Fi string.',
      'Customize QR resolution, foreground color, and background color.',
      'Preview real-time changes and export a crisp high-res PNG image.'
    ],
    relatedToolIds: ['uuid-generator', 'text-counter', 'base64-tool']
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON with syntax diagnostics.',
    category: 'developer',
    iconName: 'Braces',
    popular: true,
    badge: 'Real-time',
    howItWorks: [
      'Paste raw or unformatted JSON payload into the input editor.',
      'Click Format (2 or 4 spaces) to beautify or Minify to compact your JSON payload.',
      'Automatic parsing highlights syntax errors with precise character diagnostics.'
    ],
    relatedToolIds: ['base64-tool', 'timestamp-converter', 'uuid-generator']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate cryptographically strong, randomized passwords.',
    category: 'utilities',
    iconName: 'KeyRound',
    popular: true,
    badge: 'Client Only',
    howItWorks: [
      'Set your desired character length using the interactive slider.',
      'Toggle uppercase letters, lowercase letters, numbers, and custom special symbols.',
      'Inspect real-time entropy strength and copy securely with zero cloud transmission.'
    ],
    relatedToolIds: ['uuid-generator', 'qr-generator', 'base64-tool']
  },
  {
    id: 'color-extractor',
    name: 'Color Extractor',
    description: 'Extract dominant color palettes and hex codes from any image.',
    category: 'images',
    iconName: 'Palette',
    popular: true,
    badge: 'Browser Local',
    howItWorks: [
      'Drop or browse any photo, logo, or graphic into the workspace.',
      'Client-side canvas pixel sampling calculates the dominant color clusters.',
      'Click any palette swatch to copy its clean HEX or RGB code to your clipboard.'
    ],
    relatedToolIds: ['image-compressor', 'image-resizer', 'qr-generator']
  },
  {
    id: 'base64-tool',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode strings or files to and from Base64.',
    category: 'developer',
    iconName: 'Binary',
    popular: false,
    badge: 'Local',
    howItWorks: [
      'Choose whether to encode standard text or decode Base64 data.',
      'Type or paste your data, or upload a small file to convert to a Data URI.',
      'Validate, convert in real-time, and copy clean output in one click.'
    ],
    relatedToolIds: ['json-formatter', 'uuid-generator', 'timestamp-converter']
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate cryptographically random UUID v4 identifiers.',
    category: 'developer',
    iconName: 'Fingerprint',
    popular: false,
    badge: 'Crypto Safe',
    howItWorks: [
      'Use the browser standard Web Cryptography API to generate random v4 UUIDs.',
      'Generate a single unique identifier or batch generate multiple IDs at once.',
      'Easily copy individually or copy all generated UUIDs formatted as a list.'
    ],
    relatedToolIds: ['password-generator', 'json-formatter', 'base64-tool']
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix epoch timestamps to human-readable dates and UTC.',
    category: 'developer',
    iconName: 'Clock',
    popular: false,
    badge: 'Live Epoch',
    howItWorks: [
      'View the real-time Unix epoch clock ticking in both seconds and milliseconds.',
      'Input any Unix epoch number to convert to UTC, ISO 8601, and local timezone formats.',
      'Or pick any calendar date and time to calculate its exact Unix timestamp.'
    ],
    relatedToolIds: ['json-formatter', 'uuid-generator', 'text-counter']
  },
  {
    id: 'text-counter',
    name: 'Text Counter',
    description: 'Count characters, words, sentences, lines, and reading time.',
    category: 'utilities',
    iconName: 'FileText',
    popular: false,
    badge: 'Live Counter',
    howItWorks: [
      'Type or paste your document, code snippet, essay, or copy into the editor.',
      'Statistics update instantly without sending any characters across the network.',
      'Inspect character count with/without spaces, words, paragraphs, and estimated read time.'
    ],
    relatedToolIds: ['json-formatter', 'password-generator', 'qr-generator']
  },
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Combine multiple PDF documents into a single organized file.',
    category: 'pdf',
    iconName: 'Files',
    popular: false,
    badge: '100% Private',
    howItWorks: [
      'Upload two or more PDF files directly from your computer.',
      'Drag or click to reorder documents in the desired merge sequence.',
      'The browser merges document pages directly using pdf-lib without uploading to a server.'
    ],
    relatedToolIds: ['pdf-splitter', 'image-compressor', 'image-resizer']
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    description: 'Extract specific pages or page ranges from any PDF document.',
    category: 'pdf',
    iconName: 'Scissors',
    popular: false,
    badge: '100% Private',
    howItWorks: [
      'Select your PDF document to inspect total page count and metadata.',
      'Define the page range you want to extract (e.g., 1-5, or 2,4,7).',
      'Generate and download your freshly sliced PDF completely offline.'
    ],
    relatedToolIds: ['pdf-compressor', 'pdf-merger', 'pdf-to-image']
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Reduce PDF file size while keeping the document as usable and readable as possible.',
    category: 'pdf',
    iconName: 'FileArchive',
    popular: true,
    badge: 'Browser Local',
    howItWorks: [
      'Select or drop your PDF document into the browser (up to 50 MB).',
      'Choose a compression preset: Low (best quality), Balanced (recommended), or High (smallest file).',
      'The browser analyzes images and object streams locally, optimizes them in-memory, and provides an instant download.'
    ],
    relatedToolIds: ['pdf-merger', 'pdf-splitter', 'pdf-to-image', 'images-to-pdf']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF → Image',
    description: 'Extract and convert PDF pages into high-resolution JPG or PNG images.',
    category: 'pdf',
    iconName: 'FileImage',
    popular: false,
    isComingSoon: true,
    badge: 'Coming Soon',
    howItWorks: [
      'Upload any multi-page PDF document to convert pages.',
      'Select target image format (PNG, JPEG, or WebP) and DPI quality.',
      'Export pages individually or download all rendered pages in a single ZIP.'
    ],
    relatedToolIds: ['pdf-compressor', 'pdf-merger', 'images-to-pdf']
  },
  {
    id: 'images-to-pdf',
    name: 'Images → PDF',
    description: 'Combine multiple PNG, JPG, or WebP images into a single clean PDF.',
    category: 'pdf',
    iconName: 'FilePlus2',
    popular: false,
    isComingSoon: true,
    badge: 'Coming Soon',
    howItWorks: [
      'Select or drop multiple image files to compile into a PDF document.',
      'Reorder images and set page orientation, margins, and paper size.',
      'Compile images in your browser and download the generated PDF.'
    ],
    relatedToolIds: ['pdf-compressor', 'pdf-merger', 'pdf-to-image']
  }
];

export const CATEGORIES_LIST = [
  { id: 'all', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'pdf', label: 'PDF' },
  { id: 'developer', label: 'Developer' },
  { id: 'utilities', label: 'Utilities' },
] as const;
