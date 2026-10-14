"use client";
import { useState } from "react";

const FALLBACK_BG: Record<string, string> = {
  Pizza:        "#c8604a",
  Deli:         "#b07040",
  Chinese:      "#8a6040",
  Mexican:      "#b85c30",
  Steakhouse:   "#7a4030",
  Italian:      "#c06050",
  "Korean BBQ": "#904030",
  Vegetarian:   "#5a8050",
};

export default function RestaurantCardImage({
  src,
  alt,
  cuisine,
}: {
  src: string;
  alt: string;
  cuisine: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full items-end p-3"
        style={{ backgroundColor: FALLBACK_BG[cuisine] ?? "#8a6040" }}
      >
        <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {cuisine}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}
