export default function Avatar({
  url,
  name,
  size,
}: {
  url: string | null;
  name: string;
  size: number;
}) {
  const style = { width: size, height: size };

  if (url) {
    // Plain <img>: the photo is hosted on Supabase Storage.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Profile photo"
        style={style}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
