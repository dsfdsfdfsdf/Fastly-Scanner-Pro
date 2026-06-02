import { type NextPage } from "next";
import dynamic from "next/dynamic";
import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { type TryChar, useIPScanner } from "~/hooks/useIPScanner";
import { download } from "~/helpers/download";
import {
  TableCellsIcon,
  DocumentTextIcon,
  ArrowPathRoundedSquareIcon,
  MagnifyingGlassCircleIcon,
  PlayIcon,
  StopIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  ArrowDownTrayIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { usePWA } from "~/hooks/usePWA";

import { copyIPToClipboard } from "~/helpers/copyIPToClipboard";
import SEO from "~/components/SEO";

type RangeItem = { range: string; checked: boolean };

// Fetch IP ranges from our API route
const fetchFastlyIPs = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/ip-ranges');
    if (!response.ok) {
      throw new Error(`Failed to fetch IP ranges: ${response.status} ${response.statusText}`);
    }
    const ranges: string[] = await response.json();
    return ranges;
  } catch (error) {
    console.error('Error fetching Fastly IP ranges:', error);
    return [];
  }
};

const DesignerCredit = memo(() => (
  <div className="w-full max-w-5xl mb-8 flex justify-center">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20 group transition-all duration-300 hover:border-brand-primary/30 hover:bg-brand-primary/5">
      <span className="text-[10px] md:text-xs font-medium text-slate-400 flex items-center gap-1.5">
        Designed with
        <span className="text-brand-primary animate-pulse">❤️</span>
        by
        <a
          href="https://t.me/mehdisedighinasab"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-200 font-bold hover:text-brand-primary transition-colors relative"
        >
          mehdisedighinasab
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
        </a>
      </span>
    </div>
  </div>
));
DesignerCredit.displayName = "DesignerCredit";

const Header = memo(({ isInstallAvailable, handleInstallClick }: { isInstallAvailable: boolean, handleInstallClick: () => void }) => (
  <header className="w-full max-w-5xl mb-12 text-center">
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest">
        <CpuChipIcon className="h-4 w-4" />
        Network Optimizer
      </div>
      {isInstallAvailable && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer animate-bounce-subtle"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Install App
        </button>
      )}
    </div>
    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
      Fastly Scanner <span className="text-brand-primary">Pro</span>
    </h1>
    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
      High-performance IP discovery and latency analysis for the Fastly network.
    </p>
  </header>
));
Header.displayName = "Header";


const Home: NextPage = () => {
  const [rangeItems, setRangeItems] = useState<RangeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedRanges = useMemo(
    () => rangeItems.filter((r) => r.checked).map((r) => r.range),
    [rangeItems]
  );

  useEffect(() => {
    const loadIPs = async () => {
      setIsLoading(true);
      const ipRanges = await fetchFastlyIPs();
      setRangeItems(ipRanges.map((r) => ({ range: r, checked: true })));
      setIsLoading(false);
    };
    loadIPs();
  }, []);

  const toggleRange = useCallback((range: string) => {
    setRangeItems((prev) =>
      prev.map((r) => r.range === range ? { ...r, checked: !r.checked } : r)
    );
  }, []);

  const {
    startScan: originalStartScan,
    stopScan,
    color,
    currentIP,
    currentLatency,
    ipRegex,
    maxIPCount,
    maxLatency,
    scanState,
    testNo,
    tryChar,
    validIPs,
    setSettings,
  } = useIPScanner({ allIps: selectedRanges });

  const memoizedIPScanner = useMemo(() => ({
    startScan: async () => {
      if (selectedRanges.length === 0 || isLoading) {
        const ipRanges = await fetchFastlyIPs();
        setRangeItems(ipRanges.map((r) => ({ range: r, checked: true })));
        if (ipRanges.length > 0) {
          originalStartScan();
        }
      } else {
        originalStartScan();
      }
    },
    stopScan,
  }), [selectedRanges, isLoading, originalStartScan, stopScan]);

  const { isInstallAvailable, handleInstallClick } = usePWA();
  const isRunning = scanState !== "idle";

  const tryCharToRotation: Record<TryChar, string> = {
    "": "rotate-[360deg]",
    "|": "rotate-[72deg]",
    "/": "rotate-[144deg]",
    "-": "rotate-[216deg]",
    "\\": "rotate-[288deg]",
  };


  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-brand-primary/30">
      <SEO />

      <main className="container mx-auto px-4 py-8 lg:py-12 flex flex-col items-center">
        <DesignerCredit />
        <Header isInstallAvailable={isInstallAvailable} handleInstallClick={handleInstallClick} />


        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <section className="glass-card p-6" aria-labelledby="settings-title">
              <h2 id="settings-title" className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" /> Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="max-ip" className="text-sm text-slate-400 mb-2 block font-medium">Max IP Count</label>
                  <input
                    id="max-ip"
                    type="number"
                    value={maxIPCount}
                    onChange={(e) => setSettings({ maxIPCount: e.target.valueAsNumber })}
                    disabled={isRunning}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label htmlFor="max-latency" className="text-sm text-slate-400 mb-2 block font-medium">Max Latency (ms)</label>
                  <input
                    id="max-latency"
                    type="number"
                    value={maxLatency}
                    onChange={(e) => setSettings({ maxLatency: e.target.valueAsNumber })}
                    disabled={isRunning}
                    step={50}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label htmlFor="ip-regex" className="text-sm text-slate-400 mb-2 block font-medium">IP Pattern (Regex)</label>
                  <input
                    id="ip-regex"
                    type="text"
                    value={ipRegex}
                    onChange={(e) => setSettings({ ipRegex: e.target.value })}
                    disabled={isRunning}
                    placeholder="^104\.17\."
                    className="input-field w-full"
                  />
                </div>

              </div>
            </section>

            {rangeItems.length > 0 && (
              <section className="glass-card p-6">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" /> IP Ranges
                </h2>
                <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {rangeItems.map(({ range, checked }) => (
                    <label
                      key={range}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isRunning}
                        onChange={() => toggleRange(range)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-brand-primary checked:bg-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                      />
                      <span className="text-sm font-mono text-slate-300">{range}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setRangeItems((prev) => prev.map((r) => ({ ...r, checked: true })))}
                    disabled={isRunning}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setRangeItems((prev) => prev.map((r) => ({ ...r, checked: false })))}
                    disabled={isRunning}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </section>
            )}

            <div className="glass-card p-4 flex flex-col gap-3">
              <button
                disabled={scanState === "stopping"}
                onClick={isRunning ? memoizedIPScanner.stopScan : memoizedIPScanner.startScan}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isRunning
                  ? "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                  : "bg-brand-primary border border-brand-primary text-white hover:opacity-90 shadow-lg shadow-brand-primary/20"
                  }`}
              >
                {isRunning ? (
                  <>
                    <StopIcon className="h-5 w-5 fill-current" /> Stop Scanner
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 fill-current" /> Start Analysis
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Main Dashboard */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* Status View */}
            <article className="glass-card relative overflow-hidden">
              {/* Progress Glow */}
              <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary to-transparent transition-opacity duration-500 ${isRunning ? "opacity-100" : "opacity-0"}`} />

              <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${isRunning ? "bg-brand-primary/10 text-brand-primary" : "bg-white/5 text-slate-500"} transition-colors duration-500`}>
                    <SignalIcon className={`h-12 w-12 ${isRunning ? "animate-pulse" : ""}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Status</div>
                    <div className="text-2xl font-mono font-bold">
                      {isRunning ? (
                        <span className="text-brand-primary">Scanning Nodes</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">System Idle</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center md:text-left">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Queue</div>
                    <div className="text-2xl font-bold">{testNo}</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nodes Found</div>
                    <div className="text-2xl font-bold text-brand-primary">{validIPs.length}</div>
                  </div>
                </div>
              </div>

              {/* Realtime Logger */}
              <div className="border-t border-white/5 bg-black/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${color === "green" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"} transition-all duration-300`} />
                  <span className="font-mono text-sm text-slate-400">{currentIP || "---.---.---.---"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <ArrowPathRoundedSquareIcon className={`h-4 w-4 transform transition-transform duration-500 ${tryCharToRotation[tryChar]}`} />
                    <span className="text-xs font-mono">{currentLatency}ms</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <button
                      onClick={() => validIPs.length > 0 && download(validIPs, "csv")}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-20"
                      disabled={validIPs.length === 0}
                      title="Export CSV"
                    >
                      <TableCellsIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => validIPs.length > 0 && download(validIPs, "json")}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-20"
                      disabled={validIPs.length === 0}
                      title="Export JSON"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Results Table */}
            <article className="glass-card flex-1 min-h-[400px] flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <SignalIcon className="h-4 w-4" /> Detected Nodes
                </h3>
                <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  Click IP to copy
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {validIPs.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Index</th>
                        <th className="px-6 py-4">Node Address</th>
                        <th className="px-6 py-4 text-right">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {validIPs.map(({ ip, latency }, index) => (
                        <tr
                          key={ip}
                          onClick={() => copyIPToClipboard(ip)}
                          className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-300 group-hover:text-brand-primary transition-colors">
                              {ip}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${latency < 200 ? "bg-green-500/10 text-green-500" :
                              latency < 500 ? "bg-orange-500/10 text-orange-400" :
                                "bg-red-500/10 text-red-500"
                              }`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {latency} ms
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 gap-4">
                    <MagnifyingGlassCircleIcon className="h-16 w-16 opacity-10" />
                    <p className="text-sm italic">Initialize scan to discover optimized nodes.</p>
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
