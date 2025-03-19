import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const [users] = await db.query("SELECT id, ashima_id, name, email, campaign_id, role FROM users");
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { ashima_id, name, email, password, campaign_id, role } = body;

    if (!ashima_id || !name || !email || !password || !campaign_id || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (ashima_id, name, email, password, campaign_id, role) VALUES (?, ?, ?, ?, ?, ?)",
      [ashima_id, name, email, hashedPassword, campaign_id, role]
    );

    return NextResponse.json({ message: "User added successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add user", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ashima_id = searchParams.get("ashima_id");

    if (!ashima_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await db.query("DELETE FROM users WHERE ashima_id = ?", [ashima_id]);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user", details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await req.json();
    const email = session.user.email;

    if (name) {
      await db.query("UPDATE users SET name = ? WHERE email = ?", [name, email]);
    }

    if (currentPassword && newPassword) {
      const [users] = await db.query("SELECT password FROM users WHERE email = ?", [email]);
      if (!users.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = users[0];
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
