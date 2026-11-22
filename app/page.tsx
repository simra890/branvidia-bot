import Report from "./components/Report";
import Chat from "./components/Chat";
import OpenChatButton from "./components/OpenChatButton";

const stats = [
  { value: "0-100", label: "Optimization score" },
  { value: "8", label: "Report sections" },
  { value: "~2 min", label: "To your first report" },
  { value: "Read-only", label: "Optional Google access" },
];

const steps = [
  { icon: "💬", title: "Chat with our AI", text: "Tell us about your business in a quick, friendly conversation." },
  { icon: "🔒", title: "Choose to connect", text: "Optionally connect Google. You stay in control and can skip." },
  { icon: "🔍", title: "AI analyses your profile", text: "We review your details, reviews and photos in seconds." },
  { icon: "📈", title: "Get your report", text: "Receive a score, clear problems and practical next steps." },
];

const features = [
  { icon: "⭐", title: "Review insights", text: "See what customers love, what they complain about and your overall sentiment." },
  { icon: "📷", title: "Photo analysis", text: "Find missing photo types and content ideas that attract more customers." },
  { icon: "🎯", title: "Optimization score", text: "One clear score out of 100 showing how strong your profile is." },
  { icon: "✍️", title: "AI review replies", text: "Ready-to-send, polite replies to your toughest reviews." },
  { icon: "🧩", title: "Weak spot detection", text: "Spot missing descriptions, hours, website and other profile gaps." },
  { icon: "✅", title: "Next steps", text: "A prioritised action list so you know exactly what to fix first." },
];

const faqs = [
  {
    q: "Is connecting Google required?",
    a: "No. It is always optional and only happens after you clearly say yes. You can skip it and still chat with us.",
  },
  {
    q: "What can Branvidia see?",
    a: "Only your business details, reviews and photo information, with read-only access. We never post, edit or delete anything.",
  },
  {
    q: "Is this real Google data?",
    a: "This demo simulates the Google sign-in and uses a sample café profile. The flow mirrors a real OAuth integration, which needs Google's approval for Business Profile access.",
  },
  {
    q: "How is the score calculated?",
    a: "Our AI reviews your profile completeness, customer reviews, photos and content, then gives a score from 0 to 100 with reasons.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-2xl font-bold tracking-tight text-purple-700">
            Branvidia
          </a>
          <nav className="hidden gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#how" className="hover:text-purple-700">How it works</a>
            <a href="#features" className="hover:text-purple-700">Features</a>
            <a href="#report" className="hover:text-purple-700">Live demo</a>
            <a href="#faq" className="hover:text-purple-700">FAQ</a>
          </nav>
          <OpenChatButton label="Chat with AI" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-fuchsia-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-semibold text-purple-700">
              ✨ AI-powered Google Business Profile analysis
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Get found by more customers with{" "}
              <span className="bg-gradient-to-r from-purple-700 to-fuchsia-500 bg-clip-text text-transparent">
                Branvidia AI
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 lg:mx-0">
              Chat with our assistant, optionally connect your Google Business
              Profile, and receive a free AI report with a score, insights and
              clear steps to improve your online presence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
              <OpenChatButton label="Start free analysis" />
              <a
                href="#report"
                className="rounded-full border border-purple-200 bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                See the live demo
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              🔒 Read-only access · Always optional · No credit card needed
            </p>
          </div>

          {/* Preview card */}
          <div className="animate-float mx-auto w-full max-w-sm">
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-2xl shadow-purple-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                    Sample preview
                  </p>
                  <p className="mt-1 font-bold">Green Leaf Café</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Needs work
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ede9fe" strokeWidth="9" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#7e22ce" strokeWidth="9"
                      strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="70.4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-purple-700">72</span>
                    <span className="text-[10px] text-gray-500">of 100</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="rounded-lg bg-green-50 px-3 py-1.5 text-green-700">✓ Loved: coffee, staff</p>
                  <p className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700">⚠ 3 photo types missing</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-100 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Add your website</span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    High
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  A website link builds trust and sends more visitors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-purple-700">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
          From first hello to a full report in just a few minutes.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  {s.icon}
                </span>
                <span className="text-sm font-bold text-purple-300">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">What you get</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            A complete review of your Google presence, explained simply.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  {f.icon}
                </span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-purple-900 p-8 text-center text-white sm:p-12">
          <p className="text-4xl">🛡️</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Your data, your choice</h2>
          <p className="mx-auto mt-4 max-w-2xl text-purple-100">
            Connecting Google is always optional and needs your clear permission.
            We only read your business details, reviews and photos. We never post,
            edit or delete anything.
          </p>
        </div>
      </section>

      {/* Live demo */}
      <section className="bg-gray-50 pb-6 pt-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Try the live demo</h2>
          <p className="mt-3 text-gray-600">
            Chat with the assistant, connect (demo) Google, or just run the sample
            profile below.
          </p>
        </div>
        <div className="mt-10">
          <Report />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-10 space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-2xl text-purple-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-gray-500 sm:flex-row">
          <span className="font-bold text-purple-700">Branvidia</span>
          <span>contact@branvidia.com · www.branvidia.com</span>
          <span>© 2026 Branvidia Solutions Private Limited</span>
        </div>
      </footer>

      <Chat />
    </main>
  );
}