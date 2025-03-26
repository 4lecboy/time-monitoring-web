import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id, logout_by } = await req.json();

    if (!ashima_id || !logout_by) {
      console.error("❌ Missing parameters in request");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // ✅ Find the latest clock-in record that hasn't been clocked out
    const [existingClockIn] = await pool.query(
      "SELECT id, time_in FROM attendance WHERE ashima_id = ? AND status = 'IN' AND time_out IS NULL ORDER BY time_in DESC LIMIT 1",
      [ashima_id]
    );

    if (existingClockIn.length === 0) {
      return NextResponse.json({ error: "User is not clocked in or already clocked out." }, { status: 409 });
    }

    const attendanceId = existingClockIn[0].id;
    const timeIn = new Date(existingClockIn[0].time_in);
    const timeOut = new Date(); // Current timestamp

    // ✅ Calculate total hours (difference between time_in and time_out)
    const totalHours = ((timeOut - timeIn) / 1000 / 60 / 60).toFixed(2); // Convert ms to hours

    // ✅ Update `time_out`, `total_hours`, and `logout_by`
    await pool.query(
      "UPDATE attendance SET status = 'OUT', time_out = NOW(), total_hours = ?, logout_by = ? WHERE id = ?",
      [totalHours, logout_by, attendanceId]
    );

    console.log(`✅ User ${ashima_id} clocked out at ${timeOut.toISOString()} (Total Hours: ${totalHours})`);
    return NextResponse.json({ isClockedIn: false, success: true, message: `User ${ashima_id} successfully clocked out.` });

  } catch (error) {
    console.error("❌ Error during clock-out:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
