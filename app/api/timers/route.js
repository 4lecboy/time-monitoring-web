import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");

    if (!ashima_id) {
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    const [rows] = await pool.query("SELECT * FROM user_timers WHERE ashima_id = ?", [ashima_id]);

    if (rows.length === 0) {
      return NextResponse.json({ task: null, aux: null, task_seconds: 0, aux_seconds: 0 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching timers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { ashima_id, task, aux, task_seconds, aux_seconds } = await req.json();

    if (!ashima_id) {
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    console.log("🛠 Updating timers for:", { ashima_id, task, aux, task_seconds, aux_seconds });

    const [result] = await pool.query(
      `INSERT INTO user_timers (ashima_id, task, aux, task_seconds, aux_seconds) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       task = VALUES(task), aux = VALUES(aux), 
       task_seconds = VALUES(task_seconds), aux_seconds = VALUES(aux_seconds)`,
      [ashima_id, task, aux, task_seconds, aux_seconds]
    );

    console.log("✅ Database updated:", result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error in API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}