"use client";
import { useEffect, useState } from "react";

type ReportData = {
  score: number;
  summary: string;
  profileReview: string[];
  reviewInsights: {
    sentiment: string;
    positiveThemes: string[];
    complaints: string[];
  };
  photoInsights: string[];
  problems: string[];
  suggestions: { title: string; detail: string; priority: string }[];
  reviewReplies: { author: string; reply: string }[];
  nextSteps: string[];
};

const priorityStyle: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  return (
    <ul className="space-y-2 text-gray-700">
      {(items || []).map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-purple-700">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(score, 0), 100) / 100) * c;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#ede9fe" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="#7e22ce" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-purple-700">{score}</span>
        <span className="text-xs text-gray-500">out of 100</span>
      </div>
    </div>
  );
}

export default function Report() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  useEffect(() => {
    function onConnected() {
      runAnalysis();
      document.getElementById("report")?.scrollIntoView({ behavior: "smooth" });
    }
    window.addEventListener("branvidia:connected", onConnected);
    return () => window.removeEventListener("branvidia:connected", onConnected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyReply(text: string, i: number) {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <section id="report" className="mx-auto max-w-3xl px-6 pb-24">
      {!data && (
        <div className="text-center">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="rounded-full bg-purple-700 px-8 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {loading ? "Analysing with AI..." : "Analyse this profile"}
          </button>
          {loading && (
            <div className="mx-auto mt-6 h-2 w-48 animate-pulse rounded-full bg-purple-200" />
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}. Please try again.
            </p>
          )}
        </div>
      )}

      {data && (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-purple-50 p-6 sm:flex-row">
            <ScoreRing score={data.score} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Profile Optimization Score
              </h3>
              <p className="mt-2 text-gray-700">{data.summary}</p>
            </div>
          </div>

          <Card title="Google Business Profile Review">
            <List items={data.profileReview} />
          </Card>

          <Card title="Customer Review Insights">
            <p className="mb-3 text-sm">
              Overall sentiment:{" "}
              <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold capitalize text-purple-700">
                {data.reviewInsights?.sentiment}
              </span>
            </p>
            <p className="mb-1 font-semibold text-green-700">What customers like</p>
            <List items={data.reviewInsights?.positiveThemes} />
            <p className="mb-1 mt-4 font-semibold text-red-700">Complaints</p>
            <List items={data.reviewInsights?.complaints} />
          </Card>

          <Card title="Photo Insights">
            <List items={data.photoInsights} />
          </Card>

          <Card title="Problems Identified">
            <List items={data.problems} />
          </Card>

          <Card title="AI Optimization Suggestions">
            <div className="space-y-4">
              {(data.suggestions || []).map((s, i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        priorityStyle[s.priority] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{s.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Suggested Review Responses">
            <div className="space-y-4">
              {(data.reviewReplies || []).map((r, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Reply to {r.author}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{r.reply}</p>
                  <button
                    onClick={() => copyReply(r.reply, i)}
                    className="mt-2 text-sm font-medium text-purple-700 hover:underline"
                  >
                    {copied === i ? "Copied!" : "Copy reply"}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Suggested Next Steps">
            <List items={data.nextSteps} />
          </Card>

          <div className="text-center">
            <button
              onClick={() => setData(null)}
              className="text-sm font-medium text-purple-700 hover:underline"
            >
              Run analysis again
            </button>
          </div>
        </div>
      )}
    </section>
  );
}