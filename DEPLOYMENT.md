# Smart Scroll - Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with the marshallls-projects account

2. **Import from GitHub**
   - Select the repository: `craftculturetashkent-sketch/smart-scroll`
   - Click "Import"

3. **Configure Environment Variables**
   Add these in the Vercel project settings:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jvxftpdxpqnflvzmaved.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[Get from Supabase Dashboard]
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2eGZ0cGR4cHFuZmx2em1hdmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1MDMwNSwiZXhwIjoyMDg1NTI2MzA1fQ.bEuPKBe_HjP-YhXCWF7FjH7UepVtIqZID7nU1OraVxo
   CRON_SECRET=smart_scroll_secret_2026
   ```

   **To get ANON_KEY:**
   - Go to https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved/settings/api
   - Copy the "anon public" key

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Set up Database**
   - Go to https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved/editor
   - Open SQL Editor
   - Copy and paste the contents of `init-tables.sql`
   - Run the query

6. **Test the Deployment**
   - Visit your deployed URL (e.g., `https://smart-scroll.vercel.app`)
   - You should see the app with empty cards
   - Trigger initial content fetch:
     ```bash
     curl -X GET https://smart-scroll.vercel.app/api/cron \
       -H "Authorization: Bearer smart_scroll_secret_2026"
     ```

### Option 2: Deploy via CLI

If Vercel CLI is authenticated:

```bash
cd /home/marshall/smart-scroll
vercel --prod
```

Follow the prompts and add environment variables when asked.

## Post-Deployment

### Verify Cron Job
The `vercel.json` file configures a cron job to run every 6 hours:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 */6 * * *"
  }]
}
```

This will automatically fetch new content every 6 hours.

### Manual Content Fetch

To manually trigger a content fetch:

```bash
curl -X GET https://your-domain.vercel.app/api/cron \
  -H "Authorization: Bearer smart_scroll_secret_2026"
```

### Monitor Logs

Check Vercel dashboard for:
- Build logs
- Function logs
- Cron execution logs

## Database Tables

The app uses two main tables:

1. **topics** - Content categories with source configurations
2. **cards** - Aggregated content from all sources

Both are created automatically by running `init-tables.sql` in Supabase.

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Supabase keys are valid
- Check Vercel build logs for errors

### No Content Showing
- Run the cron endpoint manually to fetch initial content
- Check Vercel function logs for fetch errors
- Verify topics are seeded in database

### Cron Not Running
- Check Vercel dashboard → Project → Settings → Cron Jobs
- Verify the cron job is enabled
- Check function logs for execution

## GitHub Repository

https://github.com/craftculturetashkent-sketch/smart-scroll

## Live URLs

- **Production**: TBD (after deployment)
- **GitHub**: https://github.com/craftculturetashkent-sketch/smart-scroll
- **Supabase Dashboard**: https://supabase.com/dashboard/project/jvxftpdxpqnflvzmaved
