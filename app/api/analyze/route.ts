import { NextResponse } from "next/server";
import profile from "../../../data/mockProfile.json";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
  }

  // Optional business details collected by the chatbot (validated and size-limited)
  let business: Record<string, string> | null = null;
  try {
    const body = await req.json();
    if (body && typeof body.business === "object" && body.business) {
      business = {};
      for (const k of ["businessName", "category", "productsServices", "targetCustomers", "goals"]) {
        const v = body.business[k];
        if (typeof v === "string") business[k] = v.slice(0, 300);
      }
    }
  } catch {
    // no body sent: sample analysis without chat details
  }

  const prompt = `You are an expert Google Business Profile consultant.
Analyse this business and reply with ONLY valid JSON in exactly this shape:
{
  "score": number from 0 to 100,
  "summary": "2 sentence overview",
  "businessOverview": "3-4 sentences combining the customer's own details with the Google profile",
  "profileReview": ["weak or missing profile items"],
  "reviewInsights": {
    "sentiment": "positive | mixed | negative",
    "positiveThemes": ["..."],
    "complaints": ["..."]
  },
  "photoInsights": ["missing photo types and content ideas"],
  "problems": ["..."],
  "suggestions": [{ "title": "...", "detail": "...", "priority": "high | medium | low" }],
  "reviewReplies": [{ "author": "...", "reply": "polite reply to that review" }],
  "nextSteps": ["..."]
}
Write reviewReplies for the 3 lowest-rated reviews.
Tailor suggestions to the customer's goals and target customers, and mention any mismatch between what the customer said and what the Google profile shows.

Customer-provided details (from chat): ${business ? JSON.stringify(business) : "Not provided"}

Google Business Profile data:
${JSON.stringify(profile)}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }

  const data = await res.json();
  try {
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
  }
}