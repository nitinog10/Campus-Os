# CampusOS

An AI-powered orchestration platform for college students that transforms natural language descriptions into ready-to-use digital assets — posters, landing pages, and presentations.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Express.js, OpenAI API (GPT-4o-mini)
- **No Supabase. No Gemini.** Pure OpenAI.

## Quick Start

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Set your OpenAI API key

Edit `server/.env`:
```
OPENAI_API_KEY=sk-your-actual-key
```

### 3. Run both servers

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Backend API (http://localhost:3001)
cd server && node server.js
```

Or use `npm run dev:all` to run both with concurrently.

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── Header.tsx     # Glassmorphic navigation
│   │   ├── IntentInput.tsx # AI prompt input
│   │   ├── IntentSummary.tsx
│   │   ├── PipelineView.tsx
│   │   ├── AssetCard.tsx  # Output with preview/copy/download
│   │   └── CreationCanvas.tsx
│   ├── pages/             # Route pages
│   ├── services/api.ts    # Backend API client
│   ├── hooks/             # useCreationEngine
│   └── types/             # TypeScript definitions
├── server/                 # Express + OpenAI backend
│   ├── server.js          # Express entry point
│   ├── lib/openai.js      # OpenAI client
│   └── routes/            # API routes
│       ├── interpret.js   # POST /api/interpret-intent
│       ├── pipeline.js    # POST /api/generate-pipeline
│       └── asset.js       # POST /api/generate-asset
```

## How It Works

1. **Describe** — Type what you want to create in natural language
2. **Interpret** — AI extracts structured intent (type, title, audience, tone)
3. **Plan** — AI generates an execution pipeline with ordered steps
4. **Generate** — Each step produces text, design specs, or HTML/CSS assets
5. **Download** — Copy or download any generated asset

## Author

Nitin OG ([@nitinog10](https://github.com/nitinog10))
