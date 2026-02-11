import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { fetchTelegramChannel } from '@/lib/fetchTelegram';
import { fetchRSSFeed } from '@/lib/fetchRSS';
import { fetchRedditSubreddit } from '@/lib/fetchReddit';

const COLUMN_MAP: Record<string, string> = {
  telegram: 'telegram_channels',
  rss: 'rss_feeds',
  reddit: 'subreddits',
};

async function fetchAndInsertSource(topicId: number, type: string, value: string) {
  try {
    let posts: { title: string; content: string; imageUrl?: string; sourceUrl: string; sourceName: string; timestamp: Date }[] = [];

    if (type === 'telegram') posts = await fetchTelegramChannel(value);
    else if (type === 'rss') posts = await fetchRSSFeed(value);
    else if (type === 'reddit') posts = await fetchRedditSubreddit(value);

    for (const post of posts) {
      await query(
        `INSERT INTO cards (topic_id, title, content, image_url, source_url, source_name, source_type, score, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)
         ON CONFLICT (source_url) DO NOTHING`,
        [topicId, post.title, post.content, post.imageUrl || null, post.sourceUrl, post.sourceName, type, post.timestamp.toISOString()]
      );
    }
    return posts.length;
  } catch (e) {
    console.error(`Failed to fetch ${type} ${value}:`, e);
    return 0;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const topicId = parseInt(id);
    const { type, value } = await request.json();
    const col = COLUMN_MAP[type];
    if (!col || !value?.trim()) {
      return NextResponse.json({ error: 'Invalid type or value' }, { status: 400 });
    }

    const cleanValue = value.trim().replace(/^@/, '');
    const topic = await queryOne(
      `UPDATE topics SET ${col} = array_append(${col}, $1) WHERE id = $2 AND NOT ($1 = ANY(${col})) RETURNING *`,
      [cleanValue, topicId]
    );

    if (!topic) {
      const existing = await queryOne('SELECT * FROM topics WHERE id = $1', [topicId]);
      return NextResponse.json({ topic: existing });
    }

    // Auto-fetch content from the new source (fire and forget)
    fetchAndInsertSource(topicId, type, cleanValue).then(count => {
      console.log(`Auto-fetched ${count} cards from ${type}:${cleanValue}`);
    });

    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { type, value } = await request.json();
    const col = COLUMN_MAP[type];
    if (!col) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const topic = await queryOne(
      `UPDATE topics SET ${col} = array_remove(${col}, $1) WHERE id = $2 RETURNING *`,
      [value, parseInt(id)]
    );
    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
