import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "NYC Vibes — AI restaurant vibe checks",
};

const MARQUEE_ITEMS = [
  "West Village", "Pizza", "Tribeca", "Korean BBQ", "SoHo",
  "Italian", "Nolita", "Steakhouse", "Chelsea", "Deli",
  "Lower East Side", "Vegetarian", "Midtown", "Ramen", "Williamsburg",
  "Brunch", "NoMad", "Dumbo", "Tacos", "Harlem",
];

const HERO_CARDS = [
  {
    name: "Joe's Pizza",
    neighbourhood: "Greenwich Village",
    photo: "photo-1565299624946-b28f40a0ae38",
    vibe: "Old-school NYC slice. Cash only, zero pretension — and worth every cent.",
  },
  {
    name: "Katz's Delicatessen",
    neighbourhood: "Lower East Side",
    photo: "photo-1619740455993-9e612b1af08a",
    vibe: "A pastrami sandwich that earns the queue. Loud, chaotic, legendary.",
  },
  {
    name: "Peter Luger",
    neighbourhood: "Williamsburg",
    photo: "photo-1546964124-0cce460f38ef",
    vibe: "Dry-aged steak you'll still think about a year later.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* ── Split hero ── */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-8">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              New York City
            </p>
            <h1 className="mt-3 text-6xl font-bold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              Find your
              <br />
              <span className="text-[var(--muted)]">vibe.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-[var(--muted)] lg:mx-0">
              AI-written restaurant snapshots, shaped by your situation and
              voted on by people who&apos;ve actually been there.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/restaurants"
                className="rounded-xl bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
              >
                Browse restaurants
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="rounded-xl border border-[var(--border)] px-7 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
                >
                  Log in to generate &amp; vote
                </Link>
              )}
            </div>
          </div>

          {/* Right: stacked vibe cards */}
          <div className="relative hidden h-80 w-full max-w-sm flex-shrink-0 lg:block lg:w-96">
            {/* Card 1 — back-left */}
            <div className="absolute left-0 top-10 z-10 w-52 -rotate-3 overflow-hidden rounded-2xl bg-[var(--background)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:z-40 hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://images.unsplash.com/${HERO_CARDS[0].photo}?auto=format&fit=crop&w=400&h=240`}
                alt={HERO_CARDS[0].name}
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-semibold">{HERO_CARDS[0].name}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">{HERO_CARDS[0].neighbourhood}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--foreground)]/80">{HERO_CARDS[0].vibe}</p>
              </div>
            </div>

            {/* Card 2 — center, front */}
            <div className="absolute left-24 top-2 z-30 w-52 rotate-1 overflow-hidden rounded-2xl bg-[var(--background)] shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-transform duration-300 hover:z-40 hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://images.unsplash.com/${HERO_CARDS[1].photo}?auto=format&fit=crop&w=400&h=240`}
                alt={HERO_CARDS[1].name}
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-semibold">{HERO_CARDS[1].name}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">{HERO_CARDS[1].neighbourhood}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--foreground)]/80">{HERO_CARDS[1].vibe}</p>
              </div>
            </div>

            {/* Card 3 — right, slightly back */}
            <div className="absolute right-0 top-14 z-20 w-52 -rotate-1 overflow-hidden rounded-2xl bg-[var(--background)] shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-transform duration-300 hover:z-40 hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://images.unsplash.com/${HERO_CARDS[2].photo}?auto=format&fit=crop&w=400&h=240`}
                alt={HERO_CARDS[2].name}
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-semibold">{HERO_CARDS[2].name}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">{HERO_CARDS[2].neighbourhood}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--foreground)]/80">{HERO_CARDS[2].vibe}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="border-y border-[var(--border)] py-3.5 overflow-hidden">
        <div className="marquee flex whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-5 px-5 text-sm font-medium text-[var(--muted)]"
            >
              {item}
              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
