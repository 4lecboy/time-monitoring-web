import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");

    if (!ashima_id) {
      return NextResponse.json({ error: "Missing ashima_id" }, { status: 400 });
    }

    // Check the latest attendance record
    const [rows] = await pool.query(
      "SELECT status FROM attendance WHERE ashima_id = ? ORDER BY created_at DESC LIMIT 1",
      [ashima_id]
    );

    const isClockedIn = rows.length > 0 && rows[0].status === "IN";

    return NextResponse.json({ isClockedIn });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
