"use client";
import { useEffect, useState } from "react";
import profile from "../../data/mockProfile.json";
import { exportReportPdf } from "../lib/exportPdf";

type Business = Record<string, string>;

type ReportData = {
  score: number;
  summary: string;
  businessOverview?: string;
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

const LOADING_STEPS = [
  "Reading your profile details...",
  "Analysing customer reviews...",
  "Checking your photos...",
  "Writing recommendations...",
];

const priorityStyle: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const businessLabels: [string, string][] = [
  ["businessName", "Business"],
  ["category", "Category"],
  ["productsServices", "Products / services"],
  ["targetCustomers", "Target customers"],
  ["goals", "Goals"],
];

// Profile completeness checklist (computed from the profile data)
const checks = [
  { label: "Business name", ok: !!profile.name },
  { label: "Category", ok: !!profile.category },
  { label: "Address", ok: !!profile.address },
  { label: "Phone number", ok: !!profile.phone },
  { label: "Opening hours", ok: !!profile.hours },
  { label: "Website", ok: !!profile.website },
  { label: "Detailed description", ok: profile.description.length >= 100 },
  { label: "Interior photos", ok: profile.photos.interior > 0 },
  { label: "Menu photos", ok: profile.photos.menu > 0 },
  { label: "Team photos", ok: profile.photos.team > 0 },
];
const completeness = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

// Rating breakdown (computed from the review data)
const reviewCounts = {
  positive: profile.reviews.filter((r) => r.rating >= 4).length,
  neutral: profile.reviews.filter((r) => r.rating === 3).length,
  negative: profile.reviews.filter((r) => r.rating <= 2).length,
};
const reviewTotal = profile.reviews.length;

function Section({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-lg">
          {icon}
        </span>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function List({ items, tone = "purple" }: { items?: string[]; tone?: "purple" | "green" | "red" }) {
  const dot = { purple: "bg-purple-500", green: "bg-green-500", red: "bg-red-500" }[tone];
  return (
    <ul className="space-y-2 text-sm text-gray-700">
      {(items || []).map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  const r = 52;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(shown, 0), 100);
  const offset = c - (clamped / 100) * c;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#ede9fe" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
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
  const [connected, setConnected] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    function onConnected(e: Event) {
      const detail = (e as CustomEvent).detail;
      setBusiness(detail && typeof detail === "object" ? detail : null);
      setConnected(true);
      setData(null);
      setError("");
      document.getElementById("report")?.scrollIntoView({ behavior: "smooth" });
    }
    window.addEventListener("branvidia:connected", onConnected);
    return () => window.removeEventListener("branvidia:connected", onConnected);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  async function runAnalysis() {
    setLoading(true);
    setStepIdx(0);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business }),
      });
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

  async function downloadPdf() {
    if (!data) return;
    setPdfError("");
    try {
      await exportReportPdf(data, business?.businessName || profile.name);
    } catch {
      setPdfError("Could not create the PDF. Please try again.");
    }
  }

  const pct = (n: number) => `${(n / reviewTotal) * 100}%`;

  return (
    <section id="report" className="mx-auto max-w-3xl scroll-mt-20 px-6 pb-24">
      {/* Google Business Profile screen */}
      {!data && (
        <div className="space-y-5">
          <div className="animate-fade-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {connected ? "✓ Connected via Google (demo)" : "Sample profile (not connected)"}
              </span>
              <span className="text-xs font-medium text-gray-400">Google Business Profile</span>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                ☕
              </span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
                <p className="text-sm font-medium text-purple-700">{profile.category}</p>
                <p className="mt-1 text-sm font-semibold">
                  <span className="text-amber-500">★</span> {profile.rating}{" "}
                  <span className="font-normal text-gray-500">({profile.totalReviews} reviews)</span>
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-400">Description</dt>
                <dd className="text-gray-800">{profile.description}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Address</dt>
                <dd className="text-gray-800">{profile.address}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Phone</dt>
                <dd className="text-gray-800">{profile.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Hours</dt>
                <dd className="text-gray-800">{profile.hours}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Website</dt>
                <dd className={profile.website ? "text-gray-800" : "font-medium text-red-600"}>
                  {profile.website || "Not added"}
                </dd>
              </div>
            </dl>

            {/* Completeness */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">Profile completeness</span>
                <span className="font-bold text-purple-700">{completeness}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-purple-100">
                <div
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                {checks.map((c) => (
                  <li key={c.label} className={c.ok ? "text-green-700" : "text-red-600"}>
                    {c.ok ? "✓" : "✗"} {c.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Photos */}
            <p className="mb-2 mt-6 text-sm font-semibold text-gray-900">Photos on profile</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Object.entries(profile.photos).map(([type, count]) => (
                <div
                  key={type}
                  className={`rounded-xl p-3 text-center ${
                    count === 0 ? "bg-red-50 text-red-700" : "bg-purple-50 text-purple-700"
                  }`}
                >
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs capitalize">{type}</p>
                  {count === 0 && <p className="text-[10px] font-semibold">Missing</p>}
                </div>
              ))}
            </div>

            {/* Reviews */}
            <p className="mb-2 mt-6 text-sm font-semibold text-gray-900">Recent reviews</p>
            <div className="space-y-2">
              {profile.reviews.slice(0, 3).map((r, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {r.author}{" "}
                    <span className="text-amber-500">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </p>
                  <p className="text-gray-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {business && (
            <div className="animate-fade-up rounded-2xl border border-purple-100 bg-purple-50 p-6">
              <h3 className="mb-3 font-bold text-gray-900">What you told us</h3>
              <dl className="space-y-1 text-sm">
                {businessLabels.map(([key, label]) =>
                  business[key] ? (
                    <div key={key} className="flex gap-2">
                      <dt className="w-36 shrink-0 text-gray-500">{label}</dt>
                      <dd className="text-gray-800">{business[key]}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-full bg-purple-700 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:opacity-60"
            >
              {loading ? "Analysing with AI..." : "Run AI analysis"}
            </button>
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}. Please try again.
              </p>
            )}
          </div>

          {loading && (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-purple-700">
                {LOADING_STEPS[stepIdx]}
              </p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="mt-4 h-3 w-full rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final AI report */}
      {data && (
        <div className="space-y-5">
          <div className="animate-fade-up flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white p-6 ring-1 ring-purple-100 sm:flex-row">
            <ScoreRing score={data.score} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                AI report for {business?.businessName || profile.name}
              </p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">Profile Optimization Score</h3>
              <p className="mt-2 text-sm text-gray-700">{data.summary}</p>
            </div>
          </div>

          <Section icon="🏪" title="Business Overview" delay={80}>
            <p className="text-sm text-gray-700">{data.businessOverview || data.summary}</p>
          </Section>

          <Section icon="📋" title="Google Business Profile Review" delay={120}>
            <List items={data.profileReview} />
          </Section>

          <Section icon="⭐" title="Customer Review Insights" delay={160}>
            <p className="mb-3 text-sm">
              Overall sentiment:{" "}
              <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold capitalize text-purple-700">
                {data.reviewInsights?.sentiment}
              </span>
            </p>

            <div className="mb-5">
              <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="bg-green-500" style={{ width: pct(reviewCounts.positive) }} />
                <div className="bg-amber-400" style={{ width: pct(reviewCounts.neutral) }} />
                <div className="bg-red-500" style={{ width: pct(reviewCounts.negative) }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>🟢 {reviewCounts.positive} positive</span>
                <span>🟡 {reviewCounts.neutral} neutral</span>
                <span>🔴 {reviewCounts.negative} negative</span>
                <span className="text-gray-400">(sample of {reviewTotal} reviews)</span>
              </div>
            </div>

            <p className="mb-2 text-sm font-semibold text-green-700">What customers like</p>
            <List items={data.reviewInsights?.positiveThemes} tone="green" />
            <p className="mb-2 mt-4 text-sm font-semibold text-red-700">Complaints</p>
            <List items={data.reviewInsights?.complaints} tone="red" />
          </Section>

          <Section icon="📷" title="Photo Insights" delay={200}>
            <List items={data.photoInsights} />
          </Section>

          <Section icon="⚠️" title="Problems Identified" delay={240}>
            <List items={data.problems} tone="red" />
          </Section>

          <Section icon="💡" title="AI Optimization Suggestions" delay={280}>
            <div className="space-y-3">
              {(data.suggestions || []).map((s, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-4 transition hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
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
          </Section>

          <Section icon="✍️" title="Suggested Review Responses" delay={320}>
            <div className="space-y-3">
              {(data.reviewReplies || []).map((r, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Reply to {r.author}</p>
                  <p className="mt-1 text-sm text-gray-700">{r.reply}</p>
                  <button
                    onClick={() => copyReply(r.reply, i)}
                    className="mt-2 rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                  >
                    {copied === i ? "✓ Copied!" : "Copy reply"}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section icon="🚀" title="Suggested Next Steps" delay={360}>
            <List items={data.nextSteps} tone="green" />
          </Section>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <button
              onClick={downloadPdf}
              className="rounded-full bg-purple-700 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800"
            >
              ⬇ Download PDF report
            </button>
            <button
              onClick={() => setData(null)}
              className="rounded-full border border-purple-200 px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              Back to profile
            </button>
          </div>
          {pdfError && (
            <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{pdfError}</p>
          )}
        </div>
      )}
    </section>
  );
}