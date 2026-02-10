# Smart Scroll 📱

A content aggregation app that pulls from Telegram channels, RSS/blogs, and Reddit, then displays them as swipeable cards.

## Features

- 📱 Mobile-first card interface (TikTok-style for articles)
- 🎯 Topic-based filtering
- 📡 Multi-source aggregation (Telegram, RSS, Reddit)
- 🌙 Dark mode by default
- ⚡ Auto-refresh via cron jobs

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL database)
- **Tailwind CSS**
- **Vercel** (deployment + cron)

## Setup

### 1. Database Setup

Run the SQL initialization script in your Supabase SQL editor:

```bash
cat init-tables.sql
```

Copy and paste the contents into Supabase SQL Editor and execute.

Alternatively, if you have database credentials:
```bash
npm run db:init
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jvxftpdxpqnflvzmaved.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Fetch Initial Content

```bash
npm run fetch
# Or directly:
curl http://localhost:3000/api/cron
```

## Deployment

### Vercel

```bash
vercel --prod
```

The app includes a `vercel.json` that sets up a cron job to fetch content every 6 hours.

### Environment Variables on Vercel

Add these to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

## API Routes

- `GET /api/topics` - Get all topics
- `GET /api/cards?topicId=1` - Get cards (optionally filtered by topic)
- `GET /api/cron` - Trigger content fetch (protected by CRON_SECRET in production)

## Topics

1. **🚀 Entrepreneurship** - thedankoe, sweatystartup, Paul Graham, r/entrepreneur
2. **🤖 AI & Tech** - OpenAI updates, TechCrunch, r/LocalLLaMA
3. **🏔️ Central Asia** - Silk Road stories, r/CentralAsia
4. **🗣️ Languages** - Arabic learning, r/languagelearning
5. **💡 Business Insights** - Stratechery, Not Boring

## File Structure

```
smart-scroll/
├── app/
│   ├── api/
│   │   ├── cards/route.ts
│   │   ├── cron/route.ts
│   │   └── topics/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db-types.ts
│   ├── fetchReddit.ts
│   ├── fetchRSS.ts
│   ├── fetchTelegram.ts
│   └── supabase.ts
├── scripts/
│   └── init-db.ts
├── init-tables.sql
└── vercel.json
```

## Manual Content Fetch

To manually trigger a content fetch:

```bash
curl -X GET https://smart-scroll.vercel.app/api/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## License

MIT
