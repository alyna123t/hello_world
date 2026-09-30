import { NextResponse, type NextRequest } from "next/server";
import { createClient, getUserAndProfile, needsName } from "@/lib/supabase/server";

// Google -> Supabase -> here with ?code=... ; swap the code for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Ask for a first and last name if we don't have them yet.
  const { profile } = await getUserAndProfile();
  const next = needsName(profile) ? "/welcome" : "/dashboard";

  return NextResponse.redirect(`${origin}${next}`);
}
