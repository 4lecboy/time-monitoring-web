import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { task, previousTask, previousTime } = body;
    
    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // If there was a previous task running, update its time
      if (previousTask && previousTime !== undefined) {
        await connection.query(
          'UPDATE timers SET time_seconds = ?, started = FALSE, last_updated = CURRENT_TIMESTAMP WHERE task = ?',
          [previousTime, previousTask]
        );
      } else {
        // Stop all running timers without updating time (handled by client)
        await connection.query('UPDATE timers SET started = FALSE WHERE started = TRUE');
      }
      
      // Start the new timer
      await connection.query(
        'UPDATE timers SET started = TRUE, last_updated = CURRENT_TIMESTAMP WHERE task = ?',
        [task]
      );
      
      await connection.commit();
      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}