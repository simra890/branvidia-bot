"use client";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
};

export default function OpenChatButton({
  label = "Chat with AI",
  variant = "primary",
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-purple-700 text-white shadow-lg shadow-purple-200 hover:bg-purple-800"
      : "border border-purple-200 bg-white text-purple-700 hover:bg-purple-50";

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("branvidia:open-chat"))}
      className={`rounded-full px-6 py-3 font-semibold transition ${styles}`}
    >
      {label}
    </button>
  );
}