import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ topics: data });
    
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: String(error) },
      { status: 500 }
    );
  }
}
