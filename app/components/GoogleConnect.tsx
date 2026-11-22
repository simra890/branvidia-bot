"use client";
import { useEffect, useState } from "react";

type Props = { onClose: () => void; onComplete: () => void };

const ACCOUNTS = [
  { name: "Green Leaf Café Owner", email: "owner@greenleafcafe.demo", initial: "G" },
  { name: "Demo Business User", email: "demo.user@example.com", initial: "D" },
];

const STEPS = [
  "Authorising your account...",
  "Accessing your Business Profile...",
  "Fetching reviews and photos...",
  "Preparing AI analysis...",
];

const PERMISSIONS = [
  { icon: "🏪", text: "View your business name, category, address and hours" },
  { icon: "⭐", text: "View your customer reviews and ratings" },
  { icon: "📷", text: "View photos on your Business Profile" },
];

function GoogleG() {
  return (
    <span className="text-2xl font-bold">
      <span className="text-blue-500">G</span>
      <span className="text-red-500">o</span>
      <span className="text-yellow-500">o</span>
      <span className="text-blue-500">g</span>
      <span className="text-green-600">l</span>
      <span className="text-red-500">e</span>
    </span>
  );
}

export default function GoogleConnect({ onClose, onComplete }: Props) {
  const [step, setStep] = useState<"accounts" | "consent" | "connecting">("accounts");
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step !== "connecting") return;
    if (progress >= STEPS.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 900);
    return () => clearTimeout(t);
  }, [step, progress, onComplete]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-1 text-center">
          <GoogleG />
        </div>

        {/* STEP 1: choose account */}
        {step === "accounts" && (
          <>
            <h2 className="mt-3 text-center text-xl font-semibold text-gray-900">
              Choose an account
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600">
              to continue to <b>Branvidia AI</b>
            </p>
            <div className="mt-5 divide-y rounded-xl border">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => {
                    setAccount(a);
                    setStep("consent");
                  }}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 font-semibold text-white">
                    {a.initial}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{a.name}</span>
                    <span className="block text-xs text-gray-500">{a.email}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full text-sm font-medium text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </>
        )}

        {/* STEP 2: consent */}
        {step === "consent" && (
          <>
            <h2 className="mt-3 text-center text-xl font-semibold text-gray-900">
              Branvidia AI wants access to your Google account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">{account.email}</p>
            <p className="mt-5 text-sm font-medium text-gray-900">
              This will allow Branvidia AI to:
            </p>
            <ul className="mt-3 space-y-3">
              {PERMISSIONS.map((p) => (
                <li key={p.text} className="flex gap-3 text-sm text-gray-700">
                  <span>{p.icon}</span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-purple-50 p-3 text-xs text-gray-600">
              🔒 Branvidia only reads this data to create your report. We never post,
              edit or delete anything. You can remove access at any time.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("connecting")}
                className="flex-1 rounded-full bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Allow
              </button>
            </div>
          </>
        )}

        {/* STEP 3: connecting */}
        {step === "connecting" && (
          <div className="py-6 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />
            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Connecting your Business Profile
            </h2>
            <ul className="mt-5 space-y-2 text-left text-sm">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={i < progress ? "text-green-700" : i === progress ? "text-gray-900" : "text-gray-300"}
                >
                  {i < progress ? "✓" : "•"} {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Demo mode: simulated Google sign-in using sample data
        </p>
      </div>
    </div>
  );
}