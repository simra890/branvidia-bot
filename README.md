# Branvidia AI Chatbot & Google Business Profile Optimizer

A chatbot-led experience that learns about a customer's business and, with opt-in,
connects a (simulated) Google Business Profile to generate an AI optimization report.

## Features
- AI chatbot collecting business name, category, services, target customers and goals
- Clear, optional opt-in before any Google connection
- Google-style sign-in and consent flow (demo)
- AI analysis: optimization score, review sentiment, photo gaps, problems, suggestions
- AI-written replies to customer reviews, with a copy button
- Responsive UI with loading and error states

## Tech Stack
Next.js (App Router), TypeScript, Tailwind CSS, Groq API (openai/gpt-oss-120b)

## Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env.local` and add your own Groq API key
3. Run `npm run dev`
4. Open http://localhost:3000

## How It Works
1. The chatbot calls `/api/chat`, which asks the LLM for strict JSON so the app
   knows when all 5 business details have been collected.
2. After the customer opts in, a simulated Google OAuth flow runs and the app loads
   sample data from `data/mockProfile.json`.
3. `/api/analyze` sends the profile to the LLM and returns structured JSON, which
   the UI renders as report cards (score, review insights, photo tips, suggestions,
   review replies and next steps).

## Google Integration Note
Live Google Business Profile API access requires Google's approval, so this demo
simulates the sign-in and uses realistic mock data. A production version would use
Google OAuth 2.0 with the `business.manage` scope. The app only requests read access.

## Security
- API keys are server-side only and never committed (`.env.local` is git-ignored)
- User input is validated and size-limited in the API routes
- No real Google credentials are collected

## Future Improvements
PDF export, saved analyses, multi-business dashboard, real Google OAuth.