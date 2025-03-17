"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginForm = ({ onSubmit, loading, error, email, setEmail, password, setPassword }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <p className="text-red-500 text-sm text-center" aria-live="assertive">
        {error}
      </p>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // ✅ Controlled input
        placeholder="name@example.com"
        required
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // ✅ Controlled input
        placeholder="••••••••"
        required
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition flex items-center justify-center ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"
            />
          </svg>
          Logging in...
        </span>
      ) : (
        "Login"
      )}
    </button>
  </form>
);

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
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
  
      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
  
      // Wait for session to update
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await res.json();
  
      if (!session?.user) {
        setError("Failed to retrieve session.");
        setLoading(false);
        return;
      }
  
      const role = session.user.role;
      switch (role) {
        case "admin":
        case "pdd":
          router.push("/dashboard");
          break;
        case "agent":
          router.push("/time-monitoring");
          break;
        default:
          setError("Unauthorized role. Contact admin.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-3xl font-bold text-center mb-4">Login</h1>
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      </div>
    </div>
  );
}
