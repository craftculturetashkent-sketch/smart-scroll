import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM cards';
    const params: unknown[] = [];

    if (topicId) {
      sql += ' WHERE topic_id = $1';
      params.push(parseInt(topicId));
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const cards = await query(sql, params);
    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
