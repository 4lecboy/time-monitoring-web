import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id } = await req.json();

    if (!ashima_id) {
      console.error("❌ Missing ashima_id in request");
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    // ✅ Check if the user is already clocked in
    const [existingClockIn] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'IN' ORDER BY time_in DESC LIMIT 1",
      [ashima_id]
    );

    if (existingClockIn.length > 0) {
      return NextResponse.json({ isClockedIn: true, error: "User is already clocked in." }, { status: 409 });
    }

    // ✅ Insert new clock-in entry with `time_in`
    await pool.query(
      "INSERT INTO attendance (ashima_id, status, time_in) VALUES (?, 'IN', NOW())",
      [ashima_id]
    );

    console.log(`✅ User ${ashima_id} clocked in at ${new Date().toISOString()}`);
    return NextResponse.json({ isClockedIn: true, success: true, message: `User ${ashima_id} successfully clocked in.` });

  } catch (error) {
    console.error("❌ Error during clock-in:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
