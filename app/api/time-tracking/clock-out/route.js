import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id, logout_by } = await req.json();

    if (!ashima_id || !logout_by) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Check if user has already clocked out today
    const [existingClockOut] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'OUT' AND DATE(created_at) = ?",
      [ashima_id, today]
    );

    if (existingClockOut.length > 0) {
      return NextResponse.json({ error: "User has already clocked out today." }, { status: 409 });
    }

    // Find the latest clock-in record
    const [rows] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'IN' ORDER BY created_at DESC LIMIT 1",
      [ashima_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User is not clocked in." }, { status: 409 });
    }

    const attendanceId = rows[0].id;

    // Update the latest attendance record to clock out
    await pool.query(
      "UPDATE attendance SET status = 'OUT', logout_by = ? WHERE id = ?",
      [logout_by, attendanceId]
    );

    return NextResponse.json({
      success: true,
      message: `User ${ashima_id} clocked out by ${logout_by}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
