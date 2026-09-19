import React from 'react';
import {
  ImageDown,
  Maximize2,
  Minimize2,
  QrCode,
  Braces,
  KeyRound,
  Palette,
  Binary,
  Fingerprint,
  Clock,
  FileText,
  Files,
  Scissors,
  FileArchive,
  FileImage,
  FilePlus2,
  Crop,
  RefreshCw,
  Wrench
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'ImageDown':
      return <ImageDown className={className} />;
    case 'Maximize2':
      return <Maximize2 className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'Crop':
      return <Crop className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'QrCode':
      return <QrCode className={className} />;
    case 'Braces':
      return <Braces className={className} />;
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Binary':
      return <Binary className={className} />;
    case 'Fingerprint':
      return <Fingerprint className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Files':
      return <Files className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'FileArchive':
      return <FileArchive className={className} />;
    case 'FileImage':
      return <FileImage className={className} />;
    case 'FilePlus2':
      return <FilePlus2 className={className} />;
    default:
      return <Wrench className={className} />;
  }
};
