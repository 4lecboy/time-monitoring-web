import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ashima_id } = await req.json();

    if (!ashima_id) {
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Check if the user has already clocked out today
    const [existingClockOut] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'OUT' AND DATE(created_at) = ?",
      [ashima_id, today]
    );

    if (existingClockOut.length > 0) {
      return NextResponse.json({ error: "User has already clocked out today and cannot clock in again." }, { status: 409 });
    }

    // Check if user is already clocked in (status = 'IN')
    const [existingClockIn] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'IN' AND DATE(created_at) = ?",
      [ashima_id, today]
    );

    if (existingClockIn.length > 0) {
      return NextResponse.json({ error: "User is already clocked in." }, { status: 409 });
    }

    // Insert a new clock-in entry
    await pool.query(
      "INSERT INTO attendance (ashima_id, status, created_at) VALUES (?, 'IN', NOW())",
      [ashima_id]
    );

    return NextResponse.json({
      success: true,
      message: `User ${ashima_id} successfully clocked in.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
