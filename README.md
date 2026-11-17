# Beep Assignment — Frontend (Launchpad)

Standalone Next.js 15 (App Router) web application for Launchpad: a curated fresher job platform for tech graduates and entry-level talent in India.

## Features

- **Curated Fresher Discovery**: Search, filter, and inspect verified 0-2 YoE entry-level roles, internships, and graduate trainee positions.
- **Direct Supabase Integration**: Reads job listings and public source postings securely from Supabase using Row-Level Security (RLS) and public views.
- **AI-Powered Resume Matcher**: Upload resumes (PDF/DOCX) or paste text to receive candidate fit scores, skill breakdown, and tailored match rationales powered by Google Gemini.
- **Evaluation & Feedback**: Upvote/downvote and bookmark jobs with feedback recorded back to the Launchpad API.
- **Responsive & Modern UI**: Built with Tailwind CSS, Lucide icons, and modern responsive UI components.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data & Auth**: Supabase (`@supabase/supabase-js`)
- **Document Parsing**: `pdf-parse`, `mammoth`
- **Validation**: Zod

---

## Getting Started Locally

### 1. Prerequisites

- Node.js 20.x or higher
- npm (or pnpm / yarn)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

```ini
# Supabase Configuration (Required for direct client/server queries)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Configuration
# Points to your standalone beep-assignment-backend Vercel deployment or local backend
NEXT_PUBLIC_BACKEND_URL=https://beep-assignment-backend.vercel.app

# Google Gemini API (Required for the AI resume matching endpoint)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build & Typecheck

```bash
npm run typecheck
npm run build
npm start
```

---

## Deploying to Vercel

1. Import `beep-assignment-frontend` into Vercel.
2. Configure the environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`
   - `GEMINI_API_KEY`
3. Click **Deploy**.
