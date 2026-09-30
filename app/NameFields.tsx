const inputClass =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900";

export default function NameFields({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  return (
    <>
      <label className="text-sm font-medium">
        First name
        <input
          name="first_name"
          defaultValue={firstName}
          required
          autoComplete="given-name"
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium">
        Last name
        <input
          name="last_name"
          defaultValue={lastName}
          required
          autoComplete="family-name"
          className={inputClass}
        />
      </label>
    </>
  );
}
