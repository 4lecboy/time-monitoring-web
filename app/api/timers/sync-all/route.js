import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Endpoint to synchronize all running timers
export async function GET() {
  try {
    // Get all running timers
    const [runningTimers] = await db.query(
      'SELECT task, time_seconds, last_updated FROM timers WHERE started = TRUE'
    );
    
    // Calculate elapsed time for each running timer and update
    const updates = runningTimers.map(async (timer) => {
      const lastUpdated = new Date(timer.last_updated);
      const now = new Date();
      const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);
      
      if (elapsedSeconds > 0) {
        const newTime = timer.time_seconds + elapsedSeconds;
        await db.query(
          'UPDATE timers SET time_seconds = ?, last_updated = CURRENT_TIMESTAMP WHERE task = ?',
          [newTime, timer.task]
        );
      }
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${runningTimers.length} running timers`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}