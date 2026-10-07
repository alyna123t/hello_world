"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ---- Vibe generation ----

export type VibeFormState = { error?: string; success?: boolean };

export async function generateVibe(
  _prev: VibeFormState,
  formData: FormData,
): Promise<VibeFormState> {
  const restaurantId = Number(formData.get("restaurant_id"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);

  if (!restaurantId) return { error: "Missing restaurant." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to generate vibes." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  const authorName = profile?.first_name?.trim() || "Anonymous";

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, neighbourhood, cuisine, price_range")
    .eq("id", restaurantId)
    .single();
  if (!restaurant) return { error: "Restaurant not found." };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI service not configured. Set GROQ_API_KEY." };

  const prompt = [
    `Write a vibe check for ${restaurant.name} in ${restaurant.neighbourhood} (${restaurant.cuisine}, ${restaurant.price_range}).`,
    note ? `Context from the user: ${note}` : "",
    "Write exactly 2–3 punchy sentences. Capture the crowd, energy, and what to order. Be specific, honest, and fun. No generic praise, no emojis.",
  ]
    .filter(Boolean)
    .join(" ");

  let content: string;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a witty NYC food critic writing short, honest vibe checks for young New Yorkers exploring the city on weekends.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", errText);
      return { error: "AI generation failed. Please try again." };
    }
    const json = await res.json();
    content = json?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) return { error: "AI returned an empty response. Try again." };
  } catch (e) {
    console.error("Groq fetch error:", e);
    return { error: "Could not reach the AI service. Try again." };
  }

  const { error: dbError } = await supabase.from("vibes").insert({
    restaurant_id: restaurantId,
    user_id: user.id,
    author_name: authorName,
    prompt,
    content,
  });
  if (dbError) return { error: dbError.message };

  revalidatePath(`/restaurants/${restaurantId}`);
  return { success: true };
}

// ---- Voting ----

export async function castVote(
  vibeId: number,
  vote: 1 | -1,
  restaurantId: number,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: existing } = await supabase
    .from("vibe_votes")
    .select("id, vote")
    .eq("vibe_id", vibeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.vote === vote) {
      // Clicking your own vote again removes it (toggle off)
      await supabase.from("vibe_votes").delete().eq("id", existing.id);
    } else {
      await supabase
        .from("vibe_votes")
        .update({ vote })
        .eq("id", existing.id);
    }
  } else {
    await supabase
      .from("vibe_votes")
      .insert({ vibe_id: vibeId, user_id: user.id, vote });
  }

  revalidatePath(`/restaurants/${restaurantId}`);
  return {};
}

export type NameFormState = { error?: string; saved?: boolean };

async function saveProfile(formData: FormData): Promise<NameFormState> {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) {
    return { error: "Please enter both your first and last name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const update: Record<string, string> = {
    first_name: firstName,
    last_name: lastName,
    updated_at: new Date().toISOString(),
  };
  const avatarUrl = formData.get("avatar_url");
  if (typeof avatarUrl === "string" && avatarUrl) {
    update.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { saved: true };
}

// First-time prompt: save, then continue into the app.
export async function completeWelcome(
  _prev: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  const result = await saveProfile(formData);
  if (result.error) return result;
  redirect("/dashboard");
}

// Profile page: save and stay on the page.
export async function updateProfile(
  _prev: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  return saveProfile(formData);
}
