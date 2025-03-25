"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Attempting login with:", { email, password });

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result || result.error) {
        console.error("❌ Authentication failed:", result?.error);
        setError(result?.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful, fetching session...");

      // Fetch the updated session
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) {
        console.error("❌ Failed to fetch session:", res.status);
        setError("Failed to retrieve session.");
        setLoading(false);
        return;
      }

      const session = await res.json();
      if (!session?.user) {
        setError("Session data is missing.");
        setLoading(false);
        return;
      }

      console.log("🔹 Session retrieved:", session);

      const { role } = session.user;

      // Redirect based on role
      switch (role) {
        case "admin":
        case "pdd":
          router.push("/admin/dashboard");
          break;
        case "employee": // Fix: Use "employee" instead of "agent"
          router.push("/time-monitoring");
          break;
        default:
          setError("Unauthorized role. Contact admin.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-3xl font-bold text-center mb-4">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
