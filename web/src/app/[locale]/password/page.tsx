"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/beta-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = redirect;
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-display font-semibold text-white text-center mb-8">
          Bean Map
        </h1>
        <p className="text-stone-400 text-center mb-8 text-sm">
          This site is password protected.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
