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
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar url={preview} name={firstName} size={80} />
        <label className="text-sm font-medium">
          Photo
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="mt-1 block text-sm"
          />
        </label>
      </div>
      <NameFields firstName={firstName} lastName={lastName} />
      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : state.saved ? (
        <p className="text-sm text-green-700">Saved!</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
