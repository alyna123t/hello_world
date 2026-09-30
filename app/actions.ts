"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
