/** "Known for" chips. Each links to the Wikipedia article that backs it. */
export default function KnownFor({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="known-for" aria-label="Known for">
      {items.map((k) => (
        <li key={k.label}>
          <a href={k.source} target="_blank" rel="noreferrer" title="Source: Wikipedia">
            {k.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
