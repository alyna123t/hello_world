"use client";

import { useActionState, useRef } from "react";
import { generateVibe, type VibeFormState } from "@/app/actions";

const STARTERS = [
  "Going on a first date",
  "Solo lunch on a budget",
  "Bringing my parents",
  "Late night after a show",
  "I'm vegetarian",
];

export default function GenerateVibeForm({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const [state, formAction, pending] = useActionState<VibeFormState, FormData>(
    generateVibe,
    {},
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyStarter(text: string) {
    if (textareaRef.current) {
      textareaRef.current.value = text;
      textareaRef.current.focus();
    }
  }

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="vibe-note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Your situation{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <p className="text-xs text-gray-400">
          Tell the AI your context so it writes a vibe check tailored to you.
          Or leave it blank for a general vibe.
        </p>
      </div>

      {/* Quick-fill starters */}
      <div className="flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => applyStarter(s)}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        id="vibe-note"
        name="note"
        maxLength={300}
        placeholder='e.g. "Going with friends on a Saturday night" or "I only eat halal"'
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        rows={2}
      />

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : state.success ? (
        <p className="text-sm text-green-600">
          Vibe generated! Scroll down to see it.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-60"
      >
        {pending ? "Generating…" : "Generate vibe check"}
      </button>
    </form>
  );
}
