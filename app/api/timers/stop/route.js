import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { task, finalTime } = body;
    
    await db.query(
      'UPDATE timers SET started = FALSE, time_seconds = ?, last_updated = CURRENT_TIMESTAMP WHERE task = ?',
      [finalTime, task]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}