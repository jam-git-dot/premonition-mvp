# Premier League Predictor

A web application for predicting Premier League final table standings using drag and drop functionality.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Supabase (database)
- Vercel Analytics
- dnd-kit (drag and drop)

## Installation

```bash
git clone https://github.com/jam-git-dot/premonition-mvp.git
cd premonition-mvp
npm install
```

## Environment Setup

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Drag and drop team reordering
- Email-based predictions with update capability
- Responsive mobile design
- Real-time database storage
- Analytics tracking

## Project Structure

```
src/
├── components/     # React components
├── data/          # Team data and configurations
├── hooks/         # Custom React hooks
├── lib/           # External service configurations
└── App.jsx        # Main application
```

## Database Schema

```sql
CREATE TABLE predictions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rankings JSONB NOT NULL,
  group TEXT DEFAULT 'dev',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Deployment

Deploy to Vercel with environment variables set in the dashboard.

## License

ISC