"use client";

import { useActionState } from "react";
import { generateVibe, type VibeFormState } from "@/app/actions";

export default function GenerateVibeForm({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const [state, formAction, pending] = useActionState<VibeFormState, FormData>(
    generateVibe,
    {},
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <textarea
        name="note"
        maxLength={300}
        placeholder="Optional: add context for the AI — e.g. 'I'm vegetarian' or 'went on a Friday night'"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-600 dark:bg-gray-900"
        rows={2}
      />
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : state.success ? (
        <p className="text-sm text-green-600">Vibe generated! Scroll down to see it.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {pending ? "Generating…" : "Generate vibe check"}
      </button>
    </form>
  );
}
