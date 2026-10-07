"use client";

import { useTransition } from "react";
import { castVote } from "@/app/actions";

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
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleVote(1)}
        disabled={pending}
        aria-label="Upvote"
        className={`rounded px-2 py-0.5 transition-colors disabled:opacity-50 ${
          currentVote === 1
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        ▲
      </button>
      <span
        className={`w-6 text-center font-medium tabular-nums ${
          score > 0
            ? "text-green-700 dark:text-green-400"
            : score < 0
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={pending}
        aria-label="Downvote"
        className={`rounded px-2 py-0.5 transition-colors disabled:opacity-50 ${
          currentVote === -1
            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        ▼
      </button>
    </div>
  );
}
