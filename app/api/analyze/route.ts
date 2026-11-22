import { NextResponse } from "next/server";
import profile from "../../../data/mockProfile.json";

export async function POST() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
  }

  const prompt = `You are an expert Google Business Profile consultant.
Analyse this business profile and reply with ONLY valid JSON in exactly this shape:
{
  "score": number from 0 to 100,
  "summary": "2 sentence overview",
  "profileReview": ["weak or missing profile items"],
  "reviewInsights": {
    "sentiment": "positive | mixed | negative",
    "positiveThemes": ["..."],
    "complaints": ["..."]
  },
  "photoInsights": ["missing photo types and tips"],
  "problems": ["..."],
  "suggestions": [{ "title": "...", "detail": "...", "priority": "high | medium | low" }],
  "reviewReplies": [{ "author": "...", "reply": "polite reply to that review" }],
  "nextSteps": ["..."]
}
Write reviewReplies for the 3 lowest-rated reviews.

Business profile:
${JSON.stringify(profile)}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:"openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "AI request failed", details: err }, { status: 500 });
  }

  const data = await res.json();
  try {
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
  }
}