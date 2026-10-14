"use client";

import { useActionState, useState } from "react";
import { updateProfile, type NameFormState } from "@/app/actions";
import NameFields from "@/app/NameFields";
import Avatar from "@/app/Avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function ProfileForm({
  userId,
  firstName,
  lastName,
  avatarUrl,
}: {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}) {
  const [preview, setPreview] = useState(avatarUrl);

  // Upload the photo straight to Supabase Storage from the browser, then send
  // only its URL (not the image bytes) to the server to save on the profile.
  async function submit(
    prev: NameFormState,
    formData: FormData,
  ): Promise<NameFormState> {
    const photo = formData.get("photo");
    formData.delete("photo");

    if (photo instanceof File && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return { error: "Please choose an image file." };
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return { error: "Photo must be 5 MB or smaller." };
      }

      const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, photo, { contentType: photo.type });
      if (error) return { error: `Photo upload failed: ${error.message}` };

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      formData.set("avatar_url", publicUrl);
      setPreview(publicUrl);
    }

    return updateProfile(prev, formData);
  }

  const [state, formAction, pending] = useActionState(submit, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Avatar + photo upload */}
      <div className="flex items-center gap-4">
        <Avatar url={preview} name={firstName} size={64} />
        <div>
          <p className="text-xs font-medium text-[var(--muted)]">Profile photo</p>
          <label className="mt-1.5 inline-flex cursor-pointer items-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]">
            Change photo
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <NameFields firstName={firstName} lastName={lastName} />

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      ) : state.saved ? (
        <p className="rounded-lg bg-[var(--accent-light)] px-3 py-2 text-sm font-medium text-[var(--accent)]">
          Saved!
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
