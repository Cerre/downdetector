"use client";

import { useState, useEffect } from "react";

interface UptimeStatus {
  target: string;
  is_up: boolean;
  last_checked: string | null;
  response_time_ms: number | null;
  uptime_percentage_24h: number | null;
}

interface CheckEntry {
  timestamp: string;
  status_code: number | null;
  response_time_ms: number | null;
  is_up: boolean;
}

interface UptimeHistory {
  target: string;
  checks: CheckEntry[];
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Home() {
  const [status, setStatus] = useState<UptimeStatus | null>(null);
  const [history, setHistory] = useState<UptimeHistory | null>(null);
  const [error, setError] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch("/api/uptime/status").then((r) => r.json()),
      fetch("/api/uptime/history?hours=24").then((r) => r.json()),
    ])
      .then(([s, h]) => {
        setStatus(s);
        setHistory(h);
        setError(false);
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold animate-shake">BRUH</h1>
          <p className="mt-4 text-2xl text-red-500">
            Can&apos;t even reach the monitoring server lmao
          </p>
        </div>
      </div>
    );
  }

  if (!status || !history) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold animate-rainbow">
            HOLD ON...
          </h1>
          <p className="mt-4 text-xl text-zinc-500">
            checking if ostider.se is alive...
          </p>
        </div>
      </div>
    );
  }

  const isUp = status.is_up;
  const pct = status.uptime_percentage_24h;

  return (
    <div className={`min-h-screen ${isUp ? "bg-black" : "bg-red-950"} text-white transition-colors duration-500`}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-500 uppercase tracking-widest">
            Is ostider.se down?
          </h1>

          {/* The Big Answer */}
          <div className="mt-8">
            {isUp ? (
              <>
                <div className="text-8xl font-black text-green-400 animate-rainbow sm:text-9xl">
                  NOPE
                </div>
                <p className="mt-4 text-2xl text-green-300">
                  It&apos;s up. Chill.
                </p>
              </>
            ) : (
              <>
                <div className="text-8xl font-black text-red-500 animate-shake sm:text-9xl">
                  YES!!!
                </div>
                <p className="mt-4 text-2xl text-red-400">
                  IT&apos;S DOWN. PANIC.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Uptime 24h
            </div>
            <div className={`mt-2 text-4xl font-black ${
              pct === null ? "text-zinc-600" :
              pct >= 99.9 ? "text-green-400" :
              pct >= 95 ? "text-yellow-400" :
              "text-red-500 animate-shake"
            }`}>
              {pct !== null ? `${pct}%` : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Response
            </div>
            <div className={`mt-2 text-4xl font-black ${
              status.response_time_ms === null ? "text-zinc-600" :
              status.response_time_ms < 500 ? "text-green-400" :
              status.response_time_ms < 2000 ? "text-yellow-400" :
              "text-red-500"
            }`}>
              {status.response_time_ms !== null
                ? `${Math.round(status.response_time_ms)}ms`
                : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Last Check
            </div>
            <div className="mt-2 text-4xl font-black text-zinc-300">
              {status.last_checked ? timeAgo(status.last_checked) : "—"}
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="mt-12">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>24h ago</span>
            <span className="font-bold text-zinc-300">Uptime Timeline</span>
            <span>now</span>
          </div>
          <div className="mt-2 flex h-10 gap-[1px] overflow-hidden rounded-lg">
            {history.checks.length === 0 ? (
              <div className="flex-1 bg-zinc-800 flex items-center justify-center text-xs text-zinc-600">
                waiting for data...
              </div>
            ) : (
              history.checks.map((check, i) => (
                <div
                  key={i}
                  className={`flex-1 transition-colors ${
                    check.is_up
                      ? "bg-green-500 hover:bg-green-400"
                      : "bg-red-500 hover:bg-red-400 animate-pulse-bg"
                  }`}
                  title={`${new Date(check.timestamp).toLocaleTimeString()} — ${
                    check.is_up
                      ? `UP (${check.response_time_ms}ms)`
                      : "DOWN"
                  }`}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Checks Table */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-zinc-300">Recent Checks</h2>
          <div className="mt-4 space-y-1">
            {[...history.checks].reverse().slice(0, 20).map((check, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      check.is_up ? "bg-green-500" : "bg-red-500 animate-pulse-bg"
                    }`}
                  />
                  <span className="text-zinc-400">
                    {new Date(check.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {check.status_code && (
                    <span className={`font-mono ${
                      check.status_code < 400 ? "text-green-400" : "text-red-400"
                    }`}>
                      {check.status_code}
                    </span>
                  )}
                  <span className="w-20 text-right font-mono text-zinc-500">
                    {check.response_time_ms
                      ? `${Math.round(check.response_time_ms)}ms`
                      : "timeout"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-600">
          <p>
            Monitoring <span className="text-zinc-400 font-bold">ostider.se</span> every 60 seconds from a GCP VM
          </p>
          <p className="mt-1">
            Powered by vibes, FastAPI, and questionable design choices
          </p>
        </div>
      </div>
    </div>
  );
}
