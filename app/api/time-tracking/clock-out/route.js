import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id, logout_by } = await req.json();

    if (!ashima_id || !logout_by) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if the user already clocked out today
    const [existingClockOut] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'OUT' AND DATE(time_out) = ?",
      [ashima_id, today]
    );

    if (existingClockOut.length > 0) {
      return NextResponse.json({ error: "User has already clocked out today." }, { status: 409 });
    }

    // Find the most recent clock-in record that hasn't been clocked out
    const [rows] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'IN' AND time_out IS NULL ORDER BY time_in DESC LIMIT 1",
      [ashima_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User is not clocked in." }, { status: 409 });
    }

    const attendanceId = rows[0].id;

    // Update the latest attendance record to clock out
    await pool.query(
      "UPDATE attendance SET status = 'OUT', time_out = NOW(), logout_by = ? WHERE id = ?",
      [logout_by, attendanceId]
    );

    return NextResponse.json({
      success: true,
      message: `User ${ashima_id} successfully clocked out.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
