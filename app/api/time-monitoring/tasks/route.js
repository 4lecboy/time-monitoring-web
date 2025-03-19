import db from '@/lib/db';
import { NextResponse } from 'next/server';

// 🎯 GET: Fetch active task for a user
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');

  if (!user_id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const [tasks] = await db.query(
      "SELECT * FROM tbltaskcounter WHERE user_id = ? AND end_time IS NULL LIMIT 1",
      [user_id]
    );
    return NextResponse.json(tasks.length > 0 ? tasks[0] : { message: "No active task" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks", details: error.message }, { status: 500 });
  }
}

// 🎯 POST: Start a new task
export async function POST(req) {
  try {
    const { user_id, session_id, task_type } = await req.json();

    if (!user_id || !session_id || !task_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure no active task before starting a new one
    const [activeTasks] = await db.query(
      "SELECT * FROM tbltaskcounter WHERE user_id = ? AND end_time IS NULL",
      [user_id]
    );

    if (activeTasks.length > 0) {
      return NextResponse.json({ error: "Finish your active task first" }, { status: 400 });
    }

    await db.query(
      "INSERT INTO tbltaskcounter (user_id, session_id, task_type, start_time) VALUES (?, ?, ?, NOW())",
      [user_id, session_id, task_type]
    );

    return NextResponse.json({ message: "Task started successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to start task", details: error.message }, { status: 500 });
  }
}

// 🎯 PUT: End the active task
export async function PUT(req) {
  try {
    const { task_id } = await req.json();

    if (!task_id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Get task start time
    const [task] = await db.query(
      "SELECT start_time FROM tbltaskcounter WHERE id = ?",
      [task_id]
    );

    if (task.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const startTime = new Date(task[0].start_time);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    await db.query(
      "UPDATE tbltaskcounter SET end_time = NOW(), duration = ? WHERE id = ?",
      [duration, task_id]
    );

    return NextResponse.json({ message: "Task ended successfully", duration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to end task", details: error.message }, { status: 500 });
  }
}
