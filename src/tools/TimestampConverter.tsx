import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, RefreshCw, ArrowRightLeft, Calendar } from 'lucide-react';

export const TimestampConverter: React.FC = () => {
  const [currentTimestampSec, setCurrentTimestampSec] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState<boolean>(true);
  const [copiedCurrent, setCopiedCurrent] = useState<boolean>(false);

  // Conversion 1: Timestamp to Date
  const [inputTs, setInputTs] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [tsCopiedField, setTsCopiedField] = useState<string | null>(null);

  // Conversion 2: Date to Timestamp
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [dateCopiedField, setDateCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentTimestampSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Parse input timestamp
  const getParsedTsDate = () => {
    const raw = inputTs.trim();
    if (!raw || isNaN(Number(raw))) return null;
    const num = Number(raw);
    // If length is <= 11 digits, assume seconds, otherwise ms
    const ms = raw.length <= 11 ? num * 1000 : num;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const parsedDate = getParsedTsDate();

  // Parse date picker into timestamp
  const getParsedDateToTs = () => {
    if (!inputDate) return null;
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) return null;
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      local: date.toString()
    };
  };

  const dateToTsResult = getParsedDateToTs();

  const handleCopy = async (text: string, fieldId: string, setCopied: (id: string | null) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(fieldId);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div id="timestamp-converter-root" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Real-time Ticking Epoch Bar */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Current Unix Epoch
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-white">
            {currentTimestampSec}
          </div>
          <p className="text-xs text-neutral-500">
            Seconds since Jan 01, 1970 00:00:00 UTC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(currentTimestampSec.toString());
              setCopiedCurrent(true);
              setTimeout(() => setCopiedCurrent(false), 1800);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {copiedCurrent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCurrent ? 'Copied' : 'Copy Timestamp'}
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              isLive ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-amber-800 text-amber-400 bg-amber-950/40'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Timestamp to Human Date */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Timestamp → Human Date
            </span>
            <button
              onClick={() => setInputTs(currentTimestampSec.toString())}
              className="text-[11px] text-neutral-400 hover:text-white transition-colors"
            >
              Use Current
            </button>
          </div>

          <div>
            <label htmlFor="input-timestamp-num" className="block text-xs text-neutral-400 mb-1.5">
              Unix Epoch (Seconds or Milliseconds)
            </label>
            <input
              id="input-timestamp-num"
              type="text"
              value={inputTs}
              onChange={(e) => setInputTs(e.target.value)}
              placeholder="e.g. 1773918000"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-mono text-neutral-100 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {parsedDate ? (
            <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">UTC Format</p>
                  <p className="text-xs font-mono text-neutral-200 mt-0.5">{parsedDate.toUTCString()}</p>
                </div>
                <button
                  onClick={() => handleCopy(parsedDate.toUTCString(), 'utc', setTsCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy UTC"
                >
                  {tsCopiedField === 'utc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">ISO 8601</p>
                  <p className="text-xs font-mono text-neutral-200 mt-0.5">{parsedDate.toISOString()}</p>
                </div>
                <button
                  onClick={() => handleCopy(parsedDate.toISOString(), 'iso', setTsCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy ISO"
                >
                  {tsCopiedField === 'iso' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">Local Timezone</p>
                  <p className="text-xs font-mono text-neutral-200 mt-0.5">{parsedDate.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleCopy(parsedDate.toLocaleString(), 'local', setTsCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy Local"
                >
                  {tsCopiedField === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              Please enter a valid numeric Unix timestamp.
            </p>
          )}
        </div>

        {/* Section 2: Human Date to Timestamp */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Human Date → Timestamp
            </span>
          </div>

          <div>
            <label htmlFor="input-date-picker" className="block text-xs text-neutral-400 mb-1.5">
              Select Date & Time
            </label>
            <input
              id="input-date-picker"
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {dateToTsResult ? (
            <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">Seconds Epoch (10 digits)</p>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">{dateToTsResult.seconds}</p>
                </div>
                <button
                  onClick={() => handleCopy(dateToTsResult.seconds.toString(), 'sec', setDateCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy Seconds"
                >
                  {dateCopiedField === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">Milliseconds Epoch (13 digits)</p>
                  <p className="text-xs font-mono text-neutral-200 mt-0.5">{dateToTsResult.milliseconds}</p>
                </div>
                <button
                  onClick={() => handleCopy(dateToTsResult.milliseconds.toString(), 'ms', setDateCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy Milliseconds"
                >
                  {dateCopiedField === 'ms' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-semibold">UTC Representation</p>
                  <p className="text-xs font-mono text-neutral-300 mt-0.5">{dateToTsResult.utc}</p>
                </div>
                <button
                  onClick={() => handleCopy(dateToTsResult.utc, 'utc2', setDateCopiedField)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Copy UTC"
                >
                  {dateCopiedField === 'utc2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              Choose a date and time to view the timestamp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
