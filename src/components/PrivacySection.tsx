import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-900">
      <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Client-Side Architecture
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Your files stay yours.
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            UTILIX utilities for images, PDFs, text manipulation, and cryptography are designed to execute directly inside your web browser. When you compress an image, merge a document, or generate a password, processing happens locally in your device&apos;s memory. Files and inputs are not sent to remote servers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-neutral-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <HardDrive className="w-4 h-4 text-neutral-400" />
              <span>Zero Cloud Uploads</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Browser-native tools read file buffers locally using HTML5 File and Canvas APIs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <Cpu className="w-4 h-4 text-neutral-400" />
              <span>Local Computation</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Calculations leverage your hardware via Web Cryptography, Canvas, and WebAssembly.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <Lock className="w-4 h-4 text-neutral-400" />
              <span>No Ephemeral Storage</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Passcodes, keys, and UUIDs are kept exclusively in component state and purged upon refresh.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
