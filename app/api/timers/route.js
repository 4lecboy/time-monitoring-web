import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Get all timers
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM timers');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update timer time
export async function PUT(request) {
  try {
    const body = await request.json();
    const { task, time } = body;
    
    await db.query(
      'UPDATE timers SET time_seconds = ?, last_updated = CURRENT_TIMESTAMP WHERE task = ?',
      [time, task]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}