import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id, activity_type, activity_time } = await req.json();
    if (!ashima_id || !activity_type || !activity_time) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Insert activity log with duration in HH:MM:SS format
    await pool.query(
      "INSERT INTO activity_logs (ashima_id, activity_time, activity_type) VALUES (?, ?, ?)",
      [ashima_id, activity_time, activity_type]
    );

    return NextResponse.json({ success: true, message: "Activity logged successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
