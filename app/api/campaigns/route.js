import { NextResponse } from "next/server";
import db from "@/lib/db"; // MySQL connection

// ✅ Get all campaigns
export async function GET() {
  try {
    const [campaigns] = await db.query("SELECT * FROM campaigns");
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error("🔥 Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// ✅ Add new campaign
export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    // 🔹 Check if campaign exists
    const [existing] = await db.query("SELECT id FROM campaigns WHERE name = ?", [name]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Campaign already exists" }, { status: 409 });
    }

    // 🔹 Insert into DB
    await db.query("INSERT INTO campaigns (name) VALUES (?)", [name]);
    return NextResponse.json({ message: "Campaign added successfully" }, { status: 201 });
  } catch (error) {
    console.error("🔥 Error adding campaign:", error);
    return NextResponse.json({ error: "Failed to add campaign" }, { status: 500 });
  }
}

// ✅ Delete campaign
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    await db.query("DELETE FROM campaigns WHERE id = ?", [id]);
    return NextResponse.json({ message: "Campaign deleted" }, { status: 200 });
  } catch (error) {
    console.error("🔥 Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
