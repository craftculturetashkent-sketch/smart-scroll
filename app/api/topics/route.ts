import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const topics = await query('SELECT * FROM topics ORDER BY id');
    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }
    const topic = await queryOne(
      `INSERT INTO topics (name, icon, telegram_channels, rss_feeds, subreddits)
       VALUES ($1, $2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[])
       RETURNING *`,
      [name.trim(), icon || '📌']
    );
    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
