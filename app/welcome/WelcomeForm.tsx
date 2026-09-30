"use client";

import { useActionState } from "react";
import { completeWelcome } from "@/app/actions";
import NameFields from "@/app/NameFields";

export default function WelcomeForm({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [state, formAction, pending] = useActionState(completeWelcome, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <NameFields firstName={firstName} lastName={lastName} />
      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
