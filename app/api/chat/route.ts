import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Branvidia's friendly AI assistant on the Branvidia website.
Your job is to learn about the customer's business by asking these 5 things, ONE question at a time:
1. businessName  2. category  3. productsServices  4. targetCustomers  5. goals
Rules:
- Keep every reply to 1-2 short, warm sentences.
- Do not ask for something the customer already told you.
- When all 5 are collected, thank them, and say that if they like they can optionally connect their Google Business Profile for a free AI analysis.
Reply with ONLY valid JSON in this shape:
{"reply": "your message", "done": true or false, "profile": null or {"businessName":"","category":"","productsServices":"","targetCustomers":"","goals":""}}
Set "done" to true and fill "profile" only when all 5 are collected. Otherwise done is false and profile is null.`;

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Basic validation: only allow user/assistant messages, limit size
  const messages = (body.messages || [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }

  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    return NextResponse.json({
      reply: parsed.reply || "Sorry, could you say that again?",
      done: Boolean(parsed.done),
      profile: parsed.profile || null,
    });
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
  }
}