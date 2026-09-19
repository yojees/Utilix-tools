import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setPassword('');
      return;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate strength indicator
  const calculateStrength = () => {
    if (!password) return { label: 'Empty', score: 0, color: 'bg-neutral-800', textColor: 'text-neutral-500' };

    let poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 28;

    const entropy = length * Math.log2(poolSize || 1);

    if (entropy < 40 || length < 8) {
      return { label: 'Weak', score: 1, color: 'bg-rose-500', textColor: 'text-rose-400' };
    } else if (entropy < 65 || length < 12) {
      return { label: 'Moderate', score: 2, color: 'bg-amber-500', textColor: 'text-amber-400' };
    } else if (entropy < 90) {
      return { label: 'Strong', score: 3, color: 'bg-emerald-500', textColor: 'text-emerald-400' };
    } else {
      return { label: 'Very Strong', score: 4, color: 'bg-emerald-400', textColor: 'text-emerald-300' };
    }
  };

  const strength = calculateStrength();

  return (
    <div id="password-generator-root" className="w-full max-w-2xl mx-auto space-y-6">
      {/* Generated Password Display */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Generated Password
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
          <input
            id="generated-password-input"
            type="text"
            readOnly
            value={password}
            className="w-full bg-transparent font-mono text-base md:text-lg text-neutral-100 tracking-wide focus:outline-none selection:bg-neutral-800"
          />
          <button
            id="btn-copy-password"
            onClick={handleCopy}
            className="shrink-0 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors"
            title="Copy password"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            id="btn-regenerate-password"
            onClick={generatePassword}
            className="shrink-0 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors"
            title="Generate new password"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Strength Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 rounded-full transition-colors duration-200 ${
                  strength.score >= step ? strength.color : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-6">
        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="length-slider" className="text-sm font-medium text-neutral-300">
              Password Length: <span className="text-white font-semibold font-mono">{length}</span>
            </label>
            <div className="flex items-center gap-1">
              {[12, 16, 24, 32].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
                    length === len
                      ? 'border-neutral-400 bg-neutral-800 text-white'
                      : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
          <input
            id="length-slider"
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-200"
          />
        </div>

        {/* Character Set Options */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Character Options
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-white accent-neutral-200"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Uppercase Letters</p>
                <p className="text-[11px] text-neutral-500 font-mono">A - Z</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-white accent-neutral-200"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Lowercase Letters</p>
                <p className="text-[11px] text-neutral-500 font-mono">a - z</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-white accent-neutral-200"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Numbers</p>
                <p className="text-[11px] text-neutral-500 font-mono">0 - 9</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-white accent-neutral-200"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Special Symbols</p>
                <p className="text-[11px] text-neutral-500 font-mono">!@#$%^&*</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action button */}
        <div className="flex gap-3 pt-2">
          <button
            id="btn-generate-pw"
            onClick={generatePassword}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Password
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-800/80 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
