# Smart Scroll - Quick Start Guide 🚀

## TL;DR - Deploy in 5 Minutes

### Step 1: Get Supabase Anon Key (30 seconds)
1. Go to: https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved/settings/api
2. Copy the **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. Save it somewhere for Step 2

### Step 2: Deploy to Vercel (2 minutes)
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `craftculturetashkent-sketch/smart-scroll`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jvxftpdxpqnflvzmaved.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [paste from Step 1]
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2eGZ0cGR4cHFuZmx2em1hdmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1MDMwNSwiZXhwIjoyMDg1NTI2MzA1fQ.bEuPKBe_HjP-YhXCWF7FjH7UepVtIqZID7nU1OraVxo`
   - `CRON_SECRET` = `smart_scroll_secret_2026`
5. Click **Deploy**
6. Wait 2-3 minutes for build
7. Save your deployment URL (e.g., `https://smart-scroll.vercel.app`)

### Step 3: Initialize Database (1 minute)
1. Go to: https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved/editor
2. Click **SQL Editor** → **New query**
3. Open the file `init-tables.sql` from the project
4. Copy all contents and paste into SQL Editor
5. Click **Run** (▶️ button)
6. You should see: "Success. No rows returned"

### Step 4: Fetch Initial Content (30 seconds)
Open terminal and run:
```bash
curl -X GET https://smart-scroll.vercel.app/api/cron \
  -H "Authorization: Bearer smart_scroll_secret_2026"
```

Replace `smart-scroll.vercel.app` with your actual Vercel URL.

You should get:
```json
{
  "success": true,
  "message": "Fetched X cards",
  "timestamp": "..."
}
```

### Step 5: Open the App! 🎉
Visit your Vercel URL in a browser. You should see:
- Topic pills at the top (Entrepreneurship, AI & Tech, etc.)
- Cards with content from Telegram, RSS, and Reddit
- Dark theme, mobile-optimized interface

**Done!** The cron job will auto-fetch content every 6 hours.

---

## Troubleshooting

### "Invalid API key" error
- Double-check you copied the full anon key from Supabase
- Make sure there are no extra spaces

### No cards showing
- Run the Step 4 curl command to fetch initial content
- Check Vercel Function Logs for errors

### Build failed
- Verify all environment variables are set
- Check Vercel deployment logs

---

## Manual Content Fetch

To fetch new content anytime:
```bash
curl -X GET https://your-url.vercel.app/api/cron \
  -H "Authorization: Bearer smart_scroll_secret_2026"
```

---

## Links

- **GitHub:** https://github.com/craftculturetashkent-sketch/smart-scroll
- **Supabase:** https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved
- **Full Docs:** See README.md and DEPLOYMENT.md

---

**Estimated Total Time:** 5 minutes  
**Difficulty:** Easy ⭐
