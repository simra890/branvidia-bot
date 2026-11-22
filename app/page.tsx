import Chat from "./components/Chat";
import Report from "./components/Report";
import profile from "../data/mockProfile.json";
import OpenChatButton from "./components/OpenChatButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold text-purple-700">Branvidia</h1>
        <OpenChatButton />
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Grow your business with <span className="text-purple-700">AI</span>
        </h2>
        <p className="mt-6 text-lg text-gray-600">
          Tell our AI assistant about your business and get a free Google
          Business Profile analysis.
        </p>
      </section>

      <section className="mx-auto max-w-md px-6 pb-16">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
          <p className="text-sm text-purple-700">{profile.category}</p>
          <p className="mt-2 text-gray-600">{profile.description}</p>
          <p className="mt-3 text-sm text-gray-500">{profile.address}</p>
          <p className="mt-3 font-semibold">
            ⭐ {profile.rating} ({profile.totalReviews} reviews)
          </p>
        </div>
       
      </section>
      <Report />
      <Chat />
    </main>
  );
}
