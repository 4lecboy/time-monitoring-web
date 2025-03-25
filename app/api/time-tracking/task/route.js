import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id, task_type, task_time } = await req.json();
    if (!ashima_id || !task_type || !task_time) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Insert task log with duration in HH:MM:SS format
    await pool.query(
      "INSERT INTO task_logs (ashima_id, task_time, task_type) VALUES (?, ?, ?)",
      [ashima_id, task_time, task_type]
    );

    return NextResponse.json({ success: true, message: "Task logged successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
