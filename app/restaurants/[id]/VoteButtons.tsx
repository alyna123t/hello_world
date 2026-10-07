"use client";

import { useTransition } from "react";
import { castVote } from "@/app/actions";

function ChevronUp() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 9.5L7 4.5L11.5 9.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5L7 9.5L11.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VoteButtons({
  vibeId,
  restaurantId,
  currentVote,
  score,
}: {
  vibeId: number;
  restaurantId: number;
  currentVote: 1 | -1 | null;
  score: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleVote(vote: 1 | -1) {
    startTransition(() => {
      castVote(vibeId, vote, restaurantId);
    });
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={pending}
        aria-label="Upvote"
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${
          currentVote === 1
            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        }`}
      >
        <ChevronUp />
      </button>

      <span
        className={`w-7 text-center text-sm font-semibold tabular-nums ${
          score > 0
            ? "text-green-700 dark:text-green-400"
            : score < 0
              ? "text-red-600 dark:text-red-400"
              : "text-[var(--muted)]"
        }`}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={pending}
        aria-label="Downvote"
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${
          currentVote === -1
            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        }`}
      >
        <ChevronDown />
      </button>
    </div>
  );
}
