import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");

    if (!ashima_id) {
      console.error("❌ Missing ashima_id in request");
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    // ✅ Fetch the latest attendance record
    const [rows] = await pool.query(
      "SELECT status, time_out, total_hours FROM attendance WHERE ashima_id = ? ORDER BY time_in DESC LIMIT 1",
      [ashima_id]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ No attendance record found for ashima_id: ${ashima_id}`);
      return NextResponse.json({ isClockedIn: false });
    }

    const isClockedIn = rows[0].status === "IN" && !rows[0].time_out;
    const totalHours = rows[0].total_hours || 0;

    console.log(`✅ Clock status for ${ashima_id}: ${isClockedIn ? "IN" : "OUT"}, Total Hours: ${totalHours}`);
    return NextResponse.json({ isClockedIn, totalHours });

  } catch (error) {
    console.error("❌ Error fetching clock status:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
