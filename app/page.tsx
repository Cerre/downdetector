"use client";

import { useState, useEffect, useRef } from "react";

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

const DDOS_RESPONSES = [
  "Not nice of you.",
  "Bro really just clicked that. \u{1F480}",
  "The FBI has been notified. (just kidding) (or am I?)",
  "Congrats, you did nothing.",
  "ostider.se has been strengthened by your attempt.",
  "Your IP has been logged. (it hasn't) (maybe)",
  "That's illegal in 47 countries.",
  "Attack launched! Just kidding. Touch grass.",
  "Error 418: I'm a teapot, not a weapon.",
  "Nice try, script kiddie.",
  "You monster. ostider.se has feelings too.",
  "Launching 0 packets... Done! 0% effective.",
];

const SASSY_COMMENTS = [
  "ostider.se is built different fr fr",
  "zero downtime? couldn't be my servers",
  "ostider.se really said '99.9% uptime or die trying'",
  "more stable than my mental health",
  "ostider.se has better uptime than my sleep schedule",
];

const CHAOS_LABELS = [
  "chill",
  "slightly unhinged",
  "questionable",
  "chaotic",
  "MAXIMUM CHAOS",
];

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
  const [ddosMsg, setDdosMsg] = useState<string | null>(null);
  const [ddosLoading, setDdosLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [sassyComment, setSassyComment] = useState("");
  const [chaos, setChaos] = useState(0);
  const ddosTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setSassyComment(SASSY_COMMENTS[Math.floor(Math.random() * SASSY_COMMENTS.length)]);
    return () => clearInterval(interval);
  }, []);

  const handleDdos = () => {
    setClickCount((c) => c + 1);
    setDdosLoading(true);
    setDdosMsg(null);

    if (ddosTimeout.current) clearTimeout(ddosTimeout.current);

    const delay = 1000 + Math.random() * 2000;
    ddosTimeout.current = setTimeout(() => {
      setDdosLoading(false);
      if (clickCount >= 5) {
        setDdosMsg("You've clicked this " + (clickCount + 1) + " times. Seek help.");
      } else {
        setDdosMsg(DDOS_RESPONSES[Math.floor(Math.random() * DDOS_RESPONSES.length)]);
      }
    }, delay);
  };

  // Chaos-driven styles
  const chaosHue = chaos * 72; // 0 → 288 degrees
  const chaosSkew = chaos * 1.5;
  const chaosBorderRadius = chaos * 12;
  const chaosScale = 1 + chaos * 0.03;
  const chaosAnimSpeed = Math.max(0.2, 2 - chaos * 0.4);
  const chaosInvert = chaos >= 4 ? 1 : 0;

  const chaosStyle = {
    filter: `hue-rotate(${chaosHue}deg) invert(${chaosInvert})`,
    transform: `skew(${chaos > 2 ? chaosSkew : 0}deg) scale(${chaosScale})`,
    borderRadius: `${chaosBorderRadius}px`,
    "--chaos-speed": `${chaosAnimSpeed}s`,
  } as React.CSSProperties;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white" style={chaosStyle}>
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
    <div
      className={`min-h-screen ${isUp ? "bg-black" : "bg-red-950"} text-white transition-all duration-500`}
      style={chaosStyle}
    >
      {/* Fixed top-right: DDoS button */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={handleDdos}
          disabled={ddosLoading}
          className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            ddosLoading
              ? "bg-red-900 text-red-400 cursor-wait animate-pulse"
              : "bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-95"
          }`}
        >
          {ddosLoading ? "\u2620\uFE0F ATTACKING..." : "\u{1F680} DDOS"}
        </button>
        {ddosMsg && (
          <div className={`max-w-56 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-bold ${
            clickCount > 5 ? "text-red-500 animate-shake" : "text-yellow-400"
          }`}>
            {ddosMsg}
          </div>
        )}
        {clickCount > 3 && !ddosLoading && (
          <p className="text-[10px] text-zinc-700">
            attempts: {clickCount} | success: 0
          </p>
        )}
      </div>

      {/* Fixed bottom-right: Chaos slider */}
      <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm p-4 shadow-lg">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
          Chaos Level
        </div>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={chaos}
          onChange={(e) => setChaos(Number(e.target.value))}
          className="w-32 accent-red-500 cursor-pointer"
        />
        <div className={`text-xs font-bold mt-1 ${
          chaos === 0 ? "text-zinc-500" :
          chaos === 1 ? "text-yellow-400" :
          chaos === 2 ? "text-orange-400" :
          chaos === 3 ? "text-red-400" :
          "text-red-500 animate-rainbow"
        }`}>
          {CHAOS_LABELS[chaos]}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className={`font-bold text-zinc-500 uppercase tracking-widest ${
            chaos >= 3 ? "text-4xl" : "text-2xl"
          } transition-all duration-300`}>
            Is{" "}
            <a
              href="https://ostider.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white hover:decoration-white transition-colors"
            >
              ostider.se
            </a>
            {" "}down?
          </h1>

          {/* The Big Answer */}
          <div className="mt-8">
            {isUp ? (
              <>
                <div
                  className={`font-black text-green-400 sm:text-9xl transition-all duration-300 ${
                    chaos >= 2 ? "animate-rainbow" : ""
                  } ${chaos >= 3 ? "animate-shake" : ""}`}
                  style={{ fontSize: `${Math.max(6, 8 + chaos * 1.5)}rem` }}
                >
                  NOPE
                </div>
                <p className={`mt-4 text-green-300 transition-all duration-300 ${
                  chaos >= 3 ? "text-4xl font-black" : "text-2xl"
                }`}>
                  It&apos;s up. Chill.
                </p>
                <p className="mt-2 text-sm text-zinc-600 italic">
                  {sassyComment}
                </p>
              </>
            ) : (
              <>
                <div
                  className="font-black text-red-500 animate-shake sm:text-9xl"
                  style={{ fontSize: `${Math.max(6, 8 + chaos * 1.5)}rem` }}
                >
                  YES!!!
                </div>
                <p className={`mt-4 text-red-400 transition-all duration-300 ${
                  chaos >= 3 ? "text-4xl font-black animate-shake" : "text-2xl"
                }`}>
                  IT&apos;S DOWN. PANIC.
                </p>
                <p className="mt-2 text-sm text-red-800 italic">
                  someone call the developers. or don&apos;t. idk.
                </p>
              </>
            )}
          </div>

          {/* Visit button */}
          <a
            href="https://ostider.se"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-block border border-zinc-700 bg-zinc-900 px-6 py-2 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white hover:scale-105 ${
              chaos >= 3 ? "rounded-full text-lg px-8 py-3" : "rounded-lg"
            }`}
          >
            {isUp ? "Visit ostider.se (it's alive!)" : "Try visiting anyway (good luck)"}
          </a>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-3 gap-4">
          <div className={`border border-zinc-800 bg-zinc-900 p-6 text-center transition-all duration-300 ${
            chaos >= 2 ? "rounded-3xl" : "rounded-xl"
          } ${chaos >= 4 ? "animate-shake" : ""}`}>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Uptime 24h
            </div>
            <div className={`mt-2 font-black transition-all duration-300 ${
              chaos >= 3 ? "text-5xl" : "text-4xl"
            } ${
              pct === null ? "text-zinc-600" :
              pct >= 99.9 ? "text-green-400" :
              pct >= 95 ? "text-yellow-400" :
              "text-red-500 animate-shake"
            }`}>
              {pct !== null ? `${pct}%` : "\u2014"}
            </div>
          </div>
          <div className={`border border-zinc-800 bg-zinc-900 p-6 text-center transition-all duration-300 ${
            chaos >= 2 ? "rounded-3xl" : "rounded-xl"
          } ${chaos >= 4 ? "animate-shake" : ""}`}>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Response
            </div>
            <div className={`mt-2 font-black transition-all duration-300 ${
              chaos >= 3 ? "text-5xl" : "text-4xl"
            } ${
              status.response_time_ms === null ? "text-zinc-600" :
              status.response_time_ms < 500 ? "text-green-400" :
              status.response_time_ms < 2000 ? "text-yellow-400" :
              "text-red-500"
            }`}>
              {status.response_time_ms !== null
                ? `${Math.round(status.response_time_ms)}ms`
                : "\u2014"}
            </div>
          </div>
          <div className={`border border-zinc-800 bg-zinc-900 p-6 text-center transition-all duration-300 ${
            chaos >= 2 ? "rounded-3xl" : "rounded-xl"
          } ${chaos >= 4 ? "animate-shake" : ""}`}>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">
              Last Check
            </div>
            <div className={`mt-2 font-black text-zinc-300 transition-all duration-300 ${
              chaos >= 3 ? "text-5xl" : "text-4xl"
            }`}>
              {status.last_checked ? timeAgo(status.last_checked) : "\u2014"}
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
          <div className={`mt-2 flex gap-[1px] overflow-hidden transition-all duration-300 ${
            chaos >= 2 ? "rounded-full h-14" : "rounded-lg h-10"
          }`}>
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
                  title={`${new Date(check.timestamp).toLocaleTimeString()} \u2014 ${
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
                className={`flex items-center justify-between bg-zinc-900 px-4 py-2 text-sm transition-all duration-300 ${
                  chaos >= 2 ? "rounded-2xl" : "rounded-lg"
                } ${chaos >= 4 && !check.is_up ? "animate-shake" : ""}`}
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
            Monitoring{" "}
            <a
              href="https://ostider.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 font-bold hover:text-white transition-colors"
            >
              ostider.se
            </a>
            {" "}every 60 seconds from a GCP VM
          </p>
          <p className="mt-1">
            Powered by vibes, FastAPI, and questionable design choices
          </p>
        </div>
      </div>
    </div>
  );
}
