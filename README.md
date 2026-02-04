# CampusOS

An AI-powered orchestration platform for college students that transforms natural language descriptions into ready-to-use digital assets.

## Overview

CampusOS enables students to create promotional materials, landing pages, and presentations by simply describing what they need in plain language. The platform interprets user intent, generates an execution pipeline, and delivers polished assets without requiring design or coding skills.

## Features

### Supported Creation Types

- **Event Promotion** - Posters, social media posts, and promotional content for college events, club activities, hackathons, fests, and workshops
- **Landing Pages** - Simple websites for projects, clubs, portfolios, and showcases
- **Presentations** - Slide decks and visual content for assignments, project reports, and pitch decks

### How It Works

1. **Intent Interpretation** - Describe what you want to create in natural language
2. **Pipeline Generation** - The system automatically plans the creation workflow
3. **Asset Generation** - Each pipeline step produces text, design, or code assets
4. **Ready-to-Use Output** - Download or copy generated content immediately

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Radix UI** for accessible component primitives
- **shadcn/ui** for pre-built components
- **React Router** for navigation
- **TanStack Query** for server state management

### Backend
- **Supabase** for backend services
- **Supabase Edge Functions** for serverless AI processing
- **OpenAI-compatible API** for AI inference

### Testing
- **Vitest** for unit testing
- **Testing Library** for React component testing

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Application header
│   ├── IntentInput.tsx # User input component
│   ├── IntentSummary.tsx
│   ├── PipelineView.tsx
│   ├── CreationCanvas.tsx
│   └── AssetCard.tsx
├── hooks/              # Custom React hooks
│   └── useCreationEngine.ts  # Core creation logic
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Route pages
├── test/               # Test utilities
└── types/              # TypeScript definitions
    └── campusos.ts     # Core type definitions

supabase/
└── functions/          # Edge Functions
    ├── interpret-intent/   # Natural language processing
    ├── generate-pipeline/  # Pipeline planning
    └── generate-asset/     # Asset generation
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (for backend functions)

### Installation

1. Clone the repository
```bash
git clone https://github.com/nitinog10/Campus-Os.git
cd Campus-Os
```

2. Install dependencies
```bash
npm install
# or
bun install
```

3. Set up environment variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Supabase Edge Functions

The backend logic is handled by three Edge Functions:

### interpret-intent
Analyzes natural language input and extracts structured intent data including:
- Intent type (event_promotion, website, presentation)
- Title and description
- Target audience
- Tone (formal, casual, energetic, professional)
- Required elements

### generate-pipeline
Creates an execution plan based on the parsed intent:
- Determines what assets to generate
- Establishes step order and dependencies
- Assigns step types (text, design, code)

### generate-asset
Produces the actual content for each pipeline step:
- Text content (headlines, copy, descriptions)
- Design suggestions (colors, typography, layout)
- Code output (HTML/CSS)

## Type Definitions

Key types are defined in `src/types/campusos.ts`:

- `ParsedIntent` - Structure for interpreted user intent
- `Pipeline` - Execution plan with ordered steps
- `PipelineStep` - Individual step with status and dependencies
- `GeneratedAsset` - Output asset with content and metadata
- `AssetExplanation` - Rationale behind generated content

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Author

Nitin OG ([@nitinog10](https://github.com/nitinog10))
