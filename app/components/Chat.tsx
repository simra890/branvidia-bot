"use client";
import { useEffect, useRef, useState } from "react";
import GoogleConnect from "./GoogleConnect";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm Branvidia's AI assistant. I can help improve your online presence. What's your business called?",
};

const TOTAL_QUESTIONS = 5;
const EXAMPLES = ["Green Leaf Café", "Sharma Dental Clinic", "FitZone Gym"];

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [optIn, setOptIn] = useState<"pending" | "allowed" | "skipped">("pending");
  const [showGoogle, setShowGoogle] = useState(false);
  const [bizProfile, setBizProfile] = useState<Record<string, string> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const answered = messages.filter((m) => m.role === "user").length;
  const progress = done ? 100 : (Math.min(answered, TOTAL_QUESTIONS) / TOTAL_QUESTIONS) * 100;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, done, optIn, error]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("branvidia:open-chat", openChat);
    return () => window.removeEventListener("branvidia:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function request(next: Message[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.done) {
        setDone(true);
        setBizProfile(data.profile);
      }
    } catch {
      setError("Sorry, something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading || done) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    request(next);
  }

  function resetChat() {
    setMessages([GREETING]);
    setInput("");
    setLoading(false);
    setError("");
    setDone(false);
    setOptIn("pending");
    setBizProfile(null);
  }

  function handleConnected() {
    setShowGoogle(false);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("branvidia:connected", { detail: bizProfile }));
  }

  function handleCancel() {
    setShowGoogle(false);
    setOptIn("pending");
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-purple-700 px-5 py-3 font-semibold text-white shadow-xl shadow-purple-300 transition hover:scale-105 hover:bg-purple-800"
        >
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          💬 Chat with AI
        </button>
      )}

      {open && (
        <div className="animate-fade-up fixed inset-x-3 bottom-3 z-50 flex h-[80dvh] max-h-[640px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                  B
                </span>
                <div>
                  <p className="font-bold leading-tight">Branvidia AI</p>
                  <p className="flex items-center gap-1 text-xs text-purple-200">
                    <span className="h-2 w-2 rounded-full bg-green-400" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  aria-label="Restart chat"
                  title="Restart"
                  className="rounded-full p-2 text-lg leading-none hover:bg-white/10"
                >
                  ↻
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full px-3 py-1 text-2xl leading-none hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="border-b bg-white px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {done ? "All set!" : `Question ${Math.min(answered + 1, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`animate-fade-up flex items-end gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                    B
                  </span>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-purple-700 text-white"
                      : "rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Example chips */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pl-9">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => send(ex)}
                    className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {/* Typing dots */}
            {loading && (
              <div className="flex items-end gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                  B
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <span>{error}</span>
                <button
                  onClick={() => request(messages)}
                  className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Opt-in card */}
            {done && optIn === "pending" && (
              <div className="animate-fade-up rounded-2xl border border-purple-200 bg-white p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl">
                    🛡️
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">Connect Google Business Profile?</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      Optional
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  With your permission, we will <b>read</b> your business details,
                  reviews and photos to create your free AI analysis.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-500">
                  <li>✓ Read-only. We never post or edit anything</li>
                  <li>✓ You can skip and still continue</li>
                  <li>✓ You can remove access at any time</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setOptIn("allowed");
                      setShowGoogle(true);
                    }}
                    className="flex-1 rounded-full bg-purple-700 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-purple-800"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => setOptIn("skipped")}
                    className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {optIn === "allowed" && (
              <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                ✅ Google connected! Your report is being prepared.
              </p>
            )}
            {optIn === "skipped" && (
              <div className="rounded-xl bg-gray-100 p-3 text-sm text-gray-700">
                No problem! You can connect Google any time later.
                <button
                  onClick={resetChat}
                  className="ml-2 font-semibold text-purple-700 hover:underline"
                >
                  Start over
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading || done}
              aria-label="Type your answer"
              placeholder={done ? "Chat complete" : "Type your answer..."}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
            />
            <button
              onClick={() => send()}
              disabled={loading || done || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-white transition hover:bg-purple-800 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M3.4 20.4 21 12 3.4 3.6v6.3l12 2.1-12 2.1z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showGoogle && (
        <GoogleConnect onClose={handleCancel} onComplete={handleConnected} />
      )}
    </>
  );
}