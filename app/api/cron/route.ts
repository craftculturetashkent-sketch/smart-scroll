import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { fetchTelegramChannel } from '@/lib/fetchTelegram';
import { fetchRSSFeed } from '@/lib/fetchRSS';
import { fetchRedditSubreddit } from '@/lib/fetchReddit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface Topic {
  id: number;
  name: string;
  telegram_channels: string[] | null;
  rss_feeds: string[] | null;
  subreddits: string[] | null;
}

export async function GET(request: Request) {
  try {
    // Auth check - allow internal refresh calls (from browser) without secret
    const authHeader = request.headers.get('authorization');
    const referer = request.headers.get('referer');
    const isInternalCall = referer?.includes(request.headers.get('host') || '');
    if (process.env.NODE_ENV === 'production' && !isInternalCall && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await query('SELECT * FROM topics') as Topic[];
    let totalCards = 0;
    const errors: string[] = [];

    for (const topic of topics) {
      for (const channel of topic.telegram_channels || []) {
        try {
          const posts = await fetchTelegramChannel(channel);
          for (const post of posts) {
            await insertCard(topic.id, post, 'telegram');
            totalCards++;
          }
        } catch (e) {
          errors.push(`telegram @${channel}: ${e}`);
        }
      }

      for (const feed of topic.rss_feeds || []) {
        try {
          const posts = await fetchRSSFeed(feed);
          for (const post of posts) {
            await insertCard(topic.id, post, 'rss');
            totalCards++;
          }
        } catch (e) {
          errors.push(`rss ${feed}: ${e}`);
        }
      }

      for (const subreddit of topic.subreddits || []) {
        try {
          const posts = await fetchRedditSubreddit(subreddit);
          for (const post of posts) {
            await insertCard(topic.id, post, 'reddit');
            totalCards++;
          }
        } catch (e) {
          errors.push(`reddit r/${subreddit}: ${e}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fetched ${totalCards} cards`,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function insertCard(
  topicId: number,
  post: { title: string; content: string; imageUrl?: string; sourceUrl: string; sourceName: string; timestamp: Date },
  sourceType: string
) {
  const existing = await queryOne('SELECT id FROM cards WHERE source_url = $1', [post.sourceUrl]);
  if (existing) return;

  await query(
    `INSERT INTO cards (topic_id, title, content, image_url, source_url, source_name, source_type, score, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)
     ON CONFLICT (source_url) DO NOTHING`,
    [topicId, post.title, post.content, post.imageUrl || null, post.sourceUrl, post.sourceName, sourceType, post.timestamp.toISOString()]
  );
}
