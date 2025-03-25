import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");
    if (!ashima_id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

    const [report] = await pool.query("SELECT * FROM reports WHERE ashima_id = ?", [ashima_id]);

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
