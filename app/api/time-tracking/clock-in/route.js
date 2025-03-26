import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request payload:", body); // ✅ Log received payload

    const { ashima_id } = body;

    if (!ashima_id) {
      console.error("❌ Missing ashima_id in request");
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if the user already clocked in today without clocking out
    const [existingClockIn] = await pool.query(
      "SELECT id FROM attendance WHERE ashima_id = ? AND status = 'IN' AND time_out IS NULL AND DATE(time_in) = ?",
      [ashima_id, today]
    );

    if (existingClockIn.length > 0) {
      console.error(`❌ User ${ashima_id} is already clocked in.`);
      return NextResponse.json({ error: "User is already clocked in." }, { status: 409 });
    }

    // Insert a new clock-in record
    await pool.query(
      "INSERT INTO attendance (ashima_id, time_in, status) VALUES (?, NOW(), 'IN')",
      [ashima_id]
    );

    return NextResponse.json({
      success: true,
      message: `User ${ashima_id} successfully clocked in.`,
    });

  } catch (error) {
    console.error("❌ Clock-in API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
