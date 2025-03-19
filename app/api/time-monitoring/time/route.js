import db from '@/lib/db';
import { NextResponse } from 'next/server';

// ⏰ **GET Time Records**
export async function GET() {
  try {
    const [records] = await db.query("SELECT * FROM tbltimeinout");
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch records", details: error.message }, { status: 500 });
  }
}

// ✅ **POST: Clock In / Clock Out**
export async function POST(req) {
  try {
    const { user_id, action } = await req.json();

    if (!user_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "clock_in") {
      // Check if user has an active session
      const [existingRecords] = await db.query(
        "SELECT * FROM tbltimeinout WHERE user_id = ? AND time_out IS NULL",
        [user_id]
      );

      if (existingRecords.length > 0) {
        return NextResponse.json({ error: "User already clocked in" }, { status: 400 });
      }

      // Insert clock-in record
      await db.query("INSERT INTO tbltimeinout (user_id, time_in, status) VALUES (?, NOW(), 'clocked_in')", [user_id]);

      return NextResponse.json({ message: "Clocked In Successfully" }, { status: 201 });
    }

    if (action === "clock_out") {
      // Find the active clock-in record
      const [records] = await db.query(
        "SELECT * FROM tbltimeinout WHERE user_id = ? AND status = 'clocked_in' AND time_out IS NULL",
        [user_id]
      );

      if (records.length === 0) {
        return NextResponse.json({ error: "No active clock-in session found" }, { status: 400 });
      }

      const timeOut = new Date(); // 🔹 Define timeOut correctly
      const timeIn = new Date(records[0].time_in);

      // ✅ Calculate total seconds
      const totalSeconds = Math.floor((timeOut - timeIn) / 1000);

      // Convert to HH:MM:SS
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      // Update the clock-in record with time_out
      await db.query(
        "UPDATE tbltimeinout SET time_out = NOW(), status = 'clocked_out' WHERE id = ?",
        [records[0].id]
      );

      return NextResponse.json({ message: "Clocked Out Successfully", work_time: formattedTime }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 });
  }
}
