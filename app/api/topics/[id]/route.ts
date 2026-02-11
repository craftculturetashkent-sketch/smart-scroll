import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await query('DELETE FROM cards WHERE topic_id = $1', [parseInt(id)]);
    await query('DELETE FROM topics WHERE id = $1', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
