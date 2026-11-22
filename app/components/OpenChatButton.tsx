"use client";

export default function OpenChatButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("branvidia:open-chat"))}
      className="rounded-full bg-purple-700 px-5 py-2 font-medium text-white hover:bg-purple-800"
    >
      Chat with AI
    </button>
  );
}