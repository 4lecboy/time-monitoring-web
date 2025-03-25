import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔹 GET: Fetch All Users
export async function GET() {
  try {
    console.log("📥 Fetching all users...");
    const [users] = await db.query(
      "SELECT id, ashima_id, full_name, email, campaign_id, role, status FROM users"
    );
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

// 🔹 POST: Register a New User
export async function POST(req) {
  try {
    console.log("📥 Registering new user...");
    const body = await req.json();
    console.log("📌 Request Body:", body);

    const { full_name, email, password, role = "employee", ashima_id, campaign_id, status = "active" } = body;

    if (!full_name || !email || !password || !ashima_id || !campaign_id) {
      console.log("⚠️ Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user or ashima_id exists
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? OR ashima_id = ?", [email, ashima_id]);
    if (existingUsers.length > 0) {
      console.log("⚠️ Email or Ashima ID already exists:", email, ashima_id);
      return NextResponse.json({ error: "Email or Employee ID already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Password hashed successfully");

    // Insert user
    await db.query(
      "INSERT INTO users (full_name, email, password, role, ashima_id, campaign_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, role, ashima_id, campaign_id, status]
    );

    console.log("✅ User registered successfully:", email);
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/users Error:", error);

    // Return proper error details
    return NextResponse.json({
      error: "Internal Server Error",
      details: error.message || "No details available",
    }, { status: 500 });
  }
}


// 🔹 DELETE: Remove a User by `ashima_id`
export async function DELETE(req) {
  try {
    console.log("📥 Deleting user...");
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");

    if (!ashima_id) {
      console.log("⚠️ Missing ashima_id");
      return NextResponse.json({ error: "Employee ID (ashima_id) is required" }, { status: 400 });
    }

    await db.query("DELETE FROM users WHERE ashima_id = ?", [ashima_id]);
    console.log("✅ User deleted:", ashima_id);
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE /api/users Error:", error);
    return NextResponse.json({ error: "Failed to delete user", details: error.message }, { status: 500 });
  }
}

// 🔹 PUT: Update User Profile (Name & Password)
export async function PUT(req) {
  try {
    console.log("📥 Updating user profile...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("⚠️ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📌 Request Body:", body);

    const { full_name, currentPassword, newPassword } = body;
    const email = session.user.email;

    if (full_name) {
      await db.query("UPDATE users SET full_name = ? WHERE email = ?", [full_name, email]);
      console.log("✅ Name updated:", full_name);
    }

    if (currentPassword && newPassword) {
      const [users] = await db.query("SELECT password FROM users WHERE email = ?", [email]);
      if (!users.length) {
        console.log("⚠️ User not found:", email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = users[0];
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      console.log("🔍 Password match result:", passwordMatch);

      if (!passwordMatch) {
        console.log("❌ Incorrect current password:", email);
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
      console.log("✅ Password updated:", email);
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ PUT /api/users Error:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
