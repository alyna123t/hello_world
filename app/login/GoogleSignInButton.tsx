"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      // Plain /auth/callback with no extra query parameters.
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-60"
    >
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
