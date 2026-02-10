import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const topics = await query('SELECT * FROM topics ORDER BY id');
    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
