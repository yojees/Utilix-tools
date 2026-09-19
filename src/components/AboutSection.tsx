import React from 'react';
import { Shield, Zap, Sparkles, CheckCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-neutral-900">
      <div className="max-w-3xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          Built for everyday utility.
        </h2>

        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
          UTILIX brings small, useful tools together in one clean workspace. No complicated setup. No unnecessary steps. Just tools that get the job done quickly and reliably.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Browser Local</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Files and data are processed directly on your device whenever supported.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zero Latency</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Instant generation and transformations without waiting on server queues.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">No Accounts</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No logins, no cookies, no tracking scripts, and no subscription walls.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
