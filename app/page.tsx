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

// Each click escalates chaos — messages get more panicked
const CHAOS_MESSAGES: string[][] = [
  // Level 0 → 1
  ["vafan?", "uh oh", "hm that wasn't smart", "oh no", "wait what"],
  // Level 1 → 2
  ["oh shi-", "bro STOP", "things are getting weird", "varfoooor", "this is your fault"],
  // Level 2 → 3
  ["WALALALALALA", "MAKE IT STOP", "du har f\u00f6rst\u00f6rt allt", "AAAAAAH", "herregud"],
  // Level 3 → 4
  ["IT'S TOO LATE", "THERE IS NO GOING BACK", "you absolute maniac", "RIP ostider.se", "TOTAL KAOS"],
  // Level 4 (already maxed)
  [
    "it's already maximum chaos you psycho",
    "STOP CLICKING",
    "there's nothing left to destroy",
    "du \u00e4r sjuk",
    "the void stares back",
  ],
];

const BUTTON_LABELS = [
  "\u{1F680} LAUNCH DDOS ATTACK",
  "\u{1F680} LAUNCH ANOTHER ONE??",
  "\u2620\uFE0F MAKE IT WORSE",
  "\u{1F525} FULL SEND",
  "\u{1F480} PRESS IF YOU DARE",
];

const DDOS_SUCCESS_CLICKS = 5;
const RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const SASSY_COMMENTS = [
  "ostider.se is built different fr fr",
  "zero downtime? couldn't be my servers",
  "ostider.se really said '99.9% uptime or die trying'",
  "more stable than my mental health",
  "ostider.se has better uptime than my sleep schedule",
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
  const [ddosClicks, setDdosClicks] = useState(0);
  const [sassyComment] = useState(
    () => SASSY_COMMENTS[Math.floor(Math.random() * SASSY_COMMENTS.length)],
  );
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
    return () => clearInterval(interval);
  }, []);

  const handleDdos = () => {
    if (ddosLoading || ddosClicks >= DDOS_SUCCESS_CLICKS) return;

    setDdosClicks((c) => c + 1);
    setDdosLoading(true);
    setDdosMsg(null);
    const nextChaos = Math.min(4, chaos + 1);
    setChaos(nextChaos);

    if (ddosTimeout.current) clearTimeout(ddosTimeout.current);

    const delay = 800 + Math.random() * 1500;
    ddosTimeout.current = setTimeout(() => {
      setDdosLoading(false);
      const level = Math.min(nextChaos, 4);
      const msgs = CHAOS_MESSAGES[level];
      setDdosMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }, delay);
  };

  // Chaos-driven styles on the page wrapper
  const chaosHue = chaos * 72;
  const chaosStyle = {
    filter: `hue-rotate(${chaosHue}deg)${chaos >= 4 ? " invert(1)" : ""}`,
    transform: `skew(${chaos >= 3 ? chaos * 1.2 : 0}deg)`,
  } as React.CSSProperties;

  // Card float classes per index
  const cardFloat = ["animate-float-1", "animate-float-2", "animate-float-3"];

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

  const hasTakenDown = ddosClicks >= DDOS_SUCCESS_CLICKS;
  const isUp = status.is_up && !hasTakenDown;
  const pct = status.uptime_percentage_24h;

  return (
    <div
      className={`min-h-screen text-white transition-all duration-500 ${
        chaos >= 3 ? "animate-rainbow-bg" :
        chaos >= 2 ? "animate-bg-cycle" :
        isUp ? "bg-black" : "bg-red-950"
      }`}
      style={chaosStyle}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className={`font-bold text-zinc-500 uppercase tracking-widest transition-all duration-300 ${
            chaos >= 3 ? "text-xl sm:text-3xl" : "text-2xl"
          } ${chaos >= 2 ? "animate-drift" : ""}`}>
            Is{" "}
            {hasTakenDown ? (
              <span className="text-zinc-300">ostider.se</span>
            ) : (
              <a
                href="https://ostider.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white hover:decoration-white transition-colors"
              >
                ostider.se
              </a>
            )}
            {" "}down?
          </h1>

          {/* The Big Answer */}
          <div className="mt-6 sm:mt-8">
            {isUp ? (
              <>
                <div
                  className={`font-black text-green-400 sm:text-9xl transition-all duration-300 ${
                    chaos >= 1 ? "animate-rainbow" : ""
                  } ${chaos >= 3 ? "animate-jitter" : ""
                  } ${chaos >= 4 ? "animate-spin-slow" : ""
                  } ${chaos >= 2 ? "animate-drift" : ""}`}
                  style={{ fontSize: `${Math.max(4.8, 5.8 + chaos * 0.7)}rem` }}
                >
                  NOPE
                </div>
                <p className={`mt-4 text-green-300 transition-all duration-300 ${
                  chaos >= 3 ? "text-2xl sm:text-3xl font-black" : "text-xl sm:text-2xl"
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
                  className={`font-black text-red-500 animate-shake sm:text-9xl ${
                    chaos >= 4 ? "animate-spin-slow" : ""
                  }`}
                  style={{ fontSize: `${Math.max(4.8, 5.8 + chaos * 0.7)}rem` }}
                >
                  YES!!!
                </div>
                <p className={`mt-4 text-red-400 transition-all duration-300 ${
                  chaos >= 3 ? "text-2xl sm:text-3xl font-black animate-shake" : "text-xl sm:text-2xl"
                }`}>
                  {hasTakenDown ? (
                    <span className="inline-block rounded-xl border border-red-700/70 bg-red-950/40 px-4 py-2 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.22)]">
                      You succesfully took down ostider.se
                    </span>
                  ) : "IT&apos;S DOWN. PANIC."}
                </p>
                {hasTakenDown && (
                  <a
                    href={RICKROLL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block rounded-full border border-red-500 bg-red-900/70 px-7 py-2.5 text-sm font-black uppercase tracking-wide text-red-100 underline decoration-red-300 underline-offset-4 transition-all hover:scale-105 hover:bg-red-800 hover:text-white"
                  >
                    ostider.se
                  </a>
                )}
                <p className="mt-2 text-sm text-red-800 italic">
                  someone call the developers. or don&apos;t. idk.
                </p>
              </>
            )}
          </div>

        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:mt-16 sm:gap-4">
          {[
            {
              label: "Uptime 24h",
              value: pct !== null ? `${pct}%` : "\u2014",
              color: pct === null ? "text-zinc-600" :
                pct >= 99.9 ? "text-green-400" :
                pct >= 95 ? "text-yellow-400" :
                "text-red-500 animate-shake",
            },
            {
              label: "Response",
              value: status.response_time_ms !== null
                ? `${Math.round(status.response_time_ms)}ms` : "\u2014",
              color: status.response_time_ms === null ? "text-zinc-600" :
                status.response_time_ms < 500 ? "text-green-400" :
                status.response_time_ms < 2000 ? "text-yellow-400" :
                "text-red-500",
            },
            {
              label: "Last Check",
              value: status.last_checked ? timeAgo(status.last_checked) : "\u2014",
              color: "text-zinc-300",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`border border-zinc-800 bg-zinc-900 p-4 sm:p-6 text-center transition-all duration-300 ${
                chaos >= 2 ? "rounded-3xl" : "rounded-xl"
              } ${chaos >= 1 ? cardFloat[i] : ""
              } ${chaos >= 3 ? "animate-jitter" : ""
              } ${chaos >= 4 ? "animate-spin-slow" : ""}`}
            >
              <div className={`text-[10px] sm:text-sm text-zinc-500 uppercase tracking-wide sm:tracking-wider ${
                chaos >= 2 ? "animate-rainbow" : ""
              }`}>
                {stat.label}
              </div>
              <div className={`mt-2 text-2xl sm:text-4xl font-black leading-none transition-all duration-300 ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Bar */}
        <div className={`mt-8 sm:mt-12 ${chaos >= 2 ? "animate-drift" : ""} ${chaos >= 3 ? "animate-jitter" : ""}`}>
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>{chaos >= 3 ? "the past???" : "24h ago"}</span>
            <span className={`font-bold text-zinc-300 ${chaos >= 3 ? "animate-rainbow" : ""}`}>
              {chaos >= 4 ? "CHAOS TIMELINE" : "Uptime Timeline"}
            </span>
            <span>{chaos >= 3 ? "now-ish" : "now"}</span>
          </div>
          <div className={`mt-2 flex gap-[1px] overflow-hidden transition-all duration-300 ${
            chaos >= 2 ? "rounded-full" : "rounded-lg"
          } h-8 sm:h-10`}>
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
        <div className="mt-8 sm:mt-12">
          <h2 className={`text-lg font-bold text-zinc-300 ${chaos >= 3 ? "animate-drift" : ""}`}>
            {chaos >= 4 ? "RECENT CHAOS" : "Recent Checks"}
          </h2>
          <div className="mt-4 space-y-1">
            {[...history.checks].reverse().slice(0, 5).map((check, i) => (
              <div
                key={i}
                className={`${i > 2 ? "hidden sm:flex" : "flex"} items-center justify-between bg-zinc-900 px-4 py-2 text-sm transition-all duration-300 ${
                  chaos >= 2 ? "rounded-2xl" : "rounded-lg"
                } ${chaos >= 3 ? cardFloat[i % 3] : ""
                } ${chaos >= 4 ? "animate-jitter" : ""}`}
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

        {/* DDoS Button */}
        <div className={`mt-10 text-center sm:mt-16 ${chaos >= 2 ? "animate-float-2" : ""}`}>
          <button
            onClick={handleDdos}
            disabled={ddosLoading || hasTakenDown}
            className={`rounded-lg px-8 py-3 font-bold uppercase tracking-wider transition-all ${
              ddosLoading
                ? "bg-red-900 text-red-400 cursor-wait animate-pulse text-sm"
                : hasTakenDown
                ? "bg-red-950 text-red-300 cursor-not-allowed text-sm"
                : chaos >= 4
                ? "bg-red-600 text-white hover:bg-red-500 hover:scale-110 active:scale-95 text-lg animate-jitter"
                : chaos >= 3
                ? "bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-95 text-base animate-shake"
                : "bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-95 text-sm"
            }`}
          >
            {ddosLoading
              ? chaos >= 3 ? "\u{1F525} DESTROYING EVERYTHING..." : "\u2620\uFE0F ATTACKING..."
              : hasTakenDown
              ? "TARGET ELIMINATED"
              : BUTTON_LABELS[Math.min(chaos, 4)]}
          </button>
          {ddosMsg && (
            <p className={`mt-4 text-lg font-bold ${
              chaos >= 3 ? "text-red-500 animate-shake text-2xl" :
              chaos >= 2 ? "text-orange-400 text-xl" :
              "text-yellow-400"
            }`}>
              {ddosMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
