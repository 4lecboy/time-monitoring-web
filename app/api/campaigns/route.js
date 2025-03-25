import { NextResponse } from "next/server";
import db from "@/lib/db";

// 🔹 GET: Fetch All Campaigns
export async function GET() {
  try {
    console.log("📥 Fetching campaigns...");
    const [campaigns] = await db.query("SELECT id, name FROM campaigns");
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/campaigns Error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns", details: error.message }, { status: 500 });
  }
}

// 🔹 POST: Add a New Campaign
export async function POST(req) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      console.log("⚠️ Campaign name is required");
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    // Check if campaign already exists
    const [existingCampaign] = await db.query("SELECT id FROM campaigns WHERE name = ?", [name]);
    if (existingCampaign.length > 0) {
      console.log("⚠️ Campaign already exists:", name);
      return NextResponse.json({ error: "Campaign already exists" }, { status: 409 });
    }

    // Insert new campaign
    await db.query("INSERT INTO campaigns (name) VALUES (?)", [name]);
    console.log("✅ Campaign added successfully:", name);
    return NextResponse.json({ message: "Campaign added successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/campaigns Error:", error);
    return NextResponse.json({ error: "Failed to add campaign", details: error.message }, { status: 500 });
  }
}

// 🔹 DELETE: Remove a Campaign by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      console.log("⚠️ Missing Campaign ID");
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    await db.query("DELETE FROM campaigns WHERE id = ?", [id]);
    console.log("✅ Campaign deleted:", id);
    return NextResponse.json({ message: "Campaign deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE /api/campaigns Error:", error);
    return NextResponse.json({ error: "Failed to delete campaign", details: error.message }, { status: 500 });
  }
}
