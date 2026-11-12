/** "Known for" chips. Every one is backed by the district's Wikipedia article. */
export default function KnownFor({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="known-for" aria-label="Known for">
      {items.map((label) => (
        <li key={label}>{label}</li>
      ))}
    </ul>
  );
}
