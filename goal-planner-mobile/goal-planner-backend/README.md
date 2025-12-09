# Trellis - Goal Planner Backend

Backend API server for the Trellis goal planning mobile app. Powers AI-driven goal planning with progressive difficulty and intelligent task scheduling.

## Features

- **AI-Powered Plan Generation**: Uses Google Gemini to create personalized, progressive weekly plans
- **RAG Knowledge System**: Self-improving knowledge base that learns from web searches
  - Searches for expert information when local knowledge is unavailable
  - Caches results for faster future lookups
  - Includes real resource recommendations (books, apps, YouTube channels)
- **Progressive Difficulty**: Plans automatically scale from foundation (30-40%) to peak (90-100%) difficulty
- **Google Calendar Sync**: Sync tasks to Google Calendar for reminders
- **Supabase Auth**: Secure authentication via Supabase

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Supabase
- **AI**: Google Gemini API
- **Web Scraping**: Cheerio (for RAG knowledge extraction)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure `.env` with your credentials:
   - `DATABASE_URL` - Supabase PostgreSQL connection string
   - `SUPABASE_URL` & `SUPABASE_SERVICE_KEY` - Supabase project credentials
   - `GEMINI_API_KEY` - Google AI Studio API key
   - `BRAVE_SEARCH_API_KEY` (optional) - For enhanced RAG web search

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Goals
- `POST /api/goals` - Create a new goal with AI-generated plan
- `GET /api/goals` - List all goals for authenticated user
- `GET /api/goals/:id` - Get goal details with tasks
- `POST /api/goals/:id/sync-calendar` - Sync tasks to Google Calendar

### Tasks
- `PATCH /api/tasks/:id` - Update task status
- `POST /api/tasks/:id/toggle` - Toggle task completion

### Check-ins
- `POST /api/goals/:id/checkin` - Submit weekly check-in and regenerate plan

## RAG Knowledge System

The backend includes a self-improving RAG (Retrieval-Augmented Generation) system:

1. When a new goal is created, it first checks local knowledge files
2. If no match found, it searches the web using Brave Search API (optional)
3. Scrapes content from authoritative sources
4. Extracts structured knowledge using Gemini
5. Saves knowledge locally for future goals

Knowledge files are stored in `src/knowledge/` as JSON files.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `BRAVE_SEARCH_API_KEY` | No | Brave Search API key for enhanced RAG |
| `GOOGLE_CLIENT_ID` | No | For Google Calendar sync |
| `GOOGLE_CLIENT_SECRET` | No | For Google Calendar sync |

## License

MIT
