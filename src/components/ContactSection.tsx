import React, { useState } from 'react';
import { Mail, ArrowUpRight, Copy, Check, MessageSquare } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const email = 'yojeesofficial@gmail.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="contact-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-neutral-900">
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-400 font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-300" />
            <span>Get in touch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Contact Us
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl">
            Have a question, suggestion, or found an issue? We'd love to hear from you.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-200 shrink-0 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Direct Email
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${email}`}
                  className="text-base sm:text-lg font-bold text-white hover:text-neutral-300 font-mono underline decoration-neutral-700 underline-offset-4 transition-colors"
                >
                  {email}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy email to clipboard"
                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <a
              id="btn-send-email"
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Send Email
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600" />
            </a>
          </div>
        </div>

        <p className="text-xs text-neutral-500 font-mono">
          We welcome bug reports, tool recommendations, and partnership inquiries.
        </p>
      </div>
    </section>
  );
};
