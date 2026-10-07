import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local (locally) or the Vercel project settings.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Restaurant = {
  id: number;
  name: string;
  neighbourhood: string;
  cuisine: string;
  price_range: string;
};

export type Vibe = {
  id: number;
  restaurant_id: number;
  user_id: string;
  author_name: string;
  prompt: string;
  content: string;
  created_at: string;
};

export type VibeWithVotes = Vibe & {
  score: number;
  userVote: 1 | -1 | null;
};
