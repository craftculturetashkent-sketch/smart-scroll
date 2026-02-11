import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

const COLUMN_MAP: Record<string, string> = {
  telegram: 'telegram_channels',
  rss: 'rss_feeds',
  reddit: 'subreddits',
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { type, value } = await request.json();
    const col = COLUMN_MAP[type];
    if (!col || !value?.trim()) {
      return NextResponse.json({ error: 'Invalid type or value' }, { status: 400 });
    }
    const topic = await queryOne(
      `UPDATE topics SET ${col} = array_append(${col}, $1) WHERE id = $2 AND NOT ($1 = ANY(${col})) RETURNING *`,
      [value.trim(), parseInt(id)]
    );
    if (!topic) {
      const existing = await queryOne('SELECT * FROM topics WHERE id = $1', [parseInt(id)]);
      return NextResponse.json({ topic: existing });
    }
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
