"use client";
import { useEffect, useRef, useState } from "react";
import GoogleConnect from "./GoogleConnect";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm Branvidia's AI assistant. I can help improve your online presence. What's your business called?",
};

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [optIn, setOptIn] = useState<"pending" | "allowed" | "skipped">("pending");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, done, optIn]);
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("branvidia:open-chat", openChat);
    return () => window.removeEventListener("branvidia:open-chat", openChat);
  }, []);
  async function send() {
    const text = input.trim();
    if (!text || loading || done) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
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
      if (data.done) setDone(true);
    } catch {
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  function handleConnected() {
    setShowGoogle(false);
    setOpen(false);
    window.dispatchEvent(new Event("branvidia:connected"));
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
          className="fixed bottom-5 right-5 z-50 rounded-full bg-purple-700 px-5 py-3 font-semibold text-white shadow-lg hover:bg-purple-800"
        >
          💬 Chat with AI
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[75vh] max-h-[600px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between bg-purple-700 px-4 py-3 text-white">
            <div>
              <p className="font-bold">Branvidia AI</p>
              <p className="text-xs text-purple-200">Business assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-purple-700 text-white"
                      : "border bg-white text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="animate-pulse rounded-2xl border bg-white px-4 py-2 text-sm text-gray-400">
                  Typing...
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
            )}

            {/* Opt-in card */}
            {done && optIn === "pending" && (
              <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
                <p className="font-bold text-gray-900">
                  Connect Google Business Profile?{" "}
                  <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  With your permission, we will <b>read</b> your business details,
                  reviews and photos to give you a free AI analysis.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li>✓ Read-only access. We never post or edit anything</li>
                  <li>✓ You can skip and still continue</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                        setOptIn("allowed");
                        setShowGoogle(true);
                      }}
                    className="flex-1 rounded-full bg-purple-700 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => setOptIn("skipped")}
                    className="flex-1 rounded-full border py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {optIn === "allowed" && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
               Google connected! Your report is being generated.
              </p>
            )}
            {optIn === "skipped" && (
              <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
                No problem! You can connect Google any time later.
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading || done}
              placeholder={done ? "Chat complete" : "Type your answer..."}
              className="flex-1 rounded-full border px-4 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 disabled:bg-gray-100"
            />
            <button
              onClick={send}
              disabled={loading || done || !input.trim()}
              className="rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
            >
              Send
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